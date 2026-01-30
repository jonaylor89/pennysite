import { NextResponse } from "next/server";
import { addCreditsFromPurchase } from "@/lib/billing/credits";
import { getStripe } from "@/lib/stripe/stripe";
import {
  consumePendingGeneration,
  createAdminClient,
  generateMagicLinkToken,
  getOrCreateUserByEmail,
  storePendingGeneration,
} from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id parameter" },
      { status: 400 },
    );
  }

  try {
    // First, try to get from pending_generations table (if webhook already processed)
    let pending = await consumePendingGeneration(sessionId);

    // If not found, fetch directly from Stripe and process inline
    // This handles the case where webhook hasn't fired yet or isn't configured
    if (!pending) {
      console.log(
        `No pending generation found, fetching from Stripe: ${sessionId}`,
      );

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Verify payment was successful
      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { error: "Payment not completed" },
          { status: 402 },
        );
      }

      // Verify this is a guest checkout
      if (session.metadata?.flow !== "guest_checkout") {
        return NextResponse.json(
          { error: "Invalid session type" },
          { status: 400 },
        );
      }

      const email = session.customer_email || session.customer_details?.email;
      const prompt = session.metadata?.prompt;

      if (!email || !prompt) {
        return NextResponse.json(
          { error: "Missing session data" },
          { status: 400 },
        );
      }

      // Create user and add credits (idempotent operations)
      const user = await getOrCreateUserByEmail(email);
      const credits = Number.parseInt(session.metadata?.credits || "100", 10);

      // Try to add credits - will return false if already processed
      await addCreditsFromPurchase(user.id, credits, `checkout_${sessionId}`);

      // Store pending generation for future use (in case of page refresh)
      try {
        await storePendingGeneration(sessionId, user.id, prompt);
      } catch {
        // May already exist from webhook, ignore duplicate error
      }

      pending = { userId: user.id, prompt };
    }

    // Get the user's email to generate magic link
    const supabase = createAdminClient();
    const { data: userData } = await supabase.auth.admin.getUserById(
      pending.userId,
    );

    if (!userData?.user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a magic link token for session establishment
    const authToken = await generateMagicLinkToken(userData.user.email);

    return NextResponse.json({
      prompt: pending.prompt,
      userId: pending.userId,
      email: userData.user.email,
      authToken,
    });
  } catch (error) {
    console.error("Failed to get session status:", error);

    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 },
    );
  }
}
