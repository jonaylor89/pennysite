import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { addCreditsFromPurchase } from "@/lib/billing/credits";
import { getStripe } from "@/lib/stripe/stripe";

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
    console.error("Webhook signature verification failed:", message);
    console.error("Signature header:", `${signature.substring(0, 50)}...`);
    console.error(
      "Webhook secret starts with:",
      `${webhookSecret.substring(0, 10)}...`,
    );
    console.error("Body length:", body.length);
    console.error("Body preview:", body.substring(0, 100));
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status !== "paid") {
      console.log("Payment not completed, skipping");
      return NextResponse.json({ received: true });
    }

    const userId = session.metadata?.user_id;
    const creditsStr = session.metadata?.credits;

    if (!userId || !creditsStr) {
      console.error("Missing metadata in checkout session:", session.id);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
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
      } else {
        console.log(`Event ${event.id} already processed`);
      }
    } catch (err) {
      console.error("Failed to add credits:", err);
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
