import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { addCreditsFromPurchase } from "@/lib/billing/credits";
import { trackServerEvent } from "@/lib/posthog/server";
import { getStripe } from "@/lib/stripe/stripe";
import {
  getOrCreateUserByEmail,
  storePendingGeneration,
} from "@/lib/supabase/admin";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    Sentry.captureException(err, {
      tags: { route: "api/billing/webhook", step: "signature_verification" },
    });
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status !== "paid") {
      console.log("Payment not completed, skipping");
      return NextResponse.json({ received: true });
    }

    const flow = session.metadata?.flow;
    const creditsStr = session.metadata?.credits;

    // Guest checkout flow - create user and store pending generation
    if (flow === "guest_checkout") {
      const email = session.customer_email || session.customer_details?.email;
      const prompt = session.metadata?.prompt;

      if (!email) {
        console.error("No email in guest checkout session:", session.id);
        return NextResponse.json(
          { error: "No email provided" },
          { status: 400 },
        );
      }

      if (!prompt) {
        console.error("No prompt in guest checkout:", session.id);
        return NextResponse.json({ error: "No prompt" }, { status: 400 });
      }

      const credits = Number.parseInt(creditsStr || "100", 10);

      try {
        // Create or get the user
        const user = await getOrCreateUserByEmail(email);

        // Add credits
        const added = await addCreditsFromPurchase(user.id, credits, event.id);

        if (added) {
          console.log(
            `Guest checkout: Added ${credits} credits for user ${user.id} (${email})`,
          );

          // Store the pending generation for retrieval
          await storePendingGeneration(session.id, user.id, prompt);
          console.log(
            `Guest checkout: Stored pending generation for session ${session.id}`,
          );

          trackServerEvent(user.id, "guest_checkout_completed", {
            credits,
            amount_cents: session.amount_total,
            is_new_user: user.created_at === user.updated_at,
          });
        } else {
          console.log(`Event ${event.id} already processed`);
        }
      } catch (err) {
        Sentry.captureException(err, {
          tags: { route: "api/billing/webhook", step: "guest_checkout" },
          extra: { sessionId: session.id },
        });
        console.error("Failed to process guest checkout:", err);
        return NextResponse.json(
          { error: "Failed to process guest checkout" },
          { status: 500 },
        );
      }
    } else {
      // Authenticated user checkout flow (existing behavior)
      const userId = session.metadata?.user_id;

      if (!userId || !creditsStr) {
        console.error("Missing metadata in checkout session:", session.id);
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 },
        );
      }

      const credits = Number.parseInt(creditsStr, 10);

      if (Number.isNaN(credits) || credits <= 0) {
        console.error("Invalid credits value:", creditsStr);
        return NextResponse.json({ error: "Invalid credits" }, { status: 400 });
      }

      try {
        const added = await addCreditsFromPurchase(userId, credits, event.id);

        if (added) {
          console.log(`Added ${credits} credits for user ${userId}`);
          trackServerEvent(userId, "credits_purchased", {
            credits,
            pack_id: session.metadata?.pack_id,
            amount_cents: session.amount_total,
          });
        } else {
          console.log(`Event ${event.id} already processed`);
        }
      } catch (err) {
        Sentry.captureException(err, {
          tags: { route: "api/billing/webhook", step: "add_credits" },
          extra: { userId, sessionId: session.id },
        });
        console.error("Failed to add credits:", err);
        return NextResponse.json(
          { error: "Failed to add credits" },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
