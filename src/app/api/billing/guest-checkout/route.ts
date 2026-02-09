import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/posthog/server";
import { getStripe } from "@/lib/stripe/stripe";

export async function POST(req: Request) {
  const priceId = process.env.STRIPE_PRICE_STARTER;
  if (!priceId) {
    console.error("STRIPE_PRICE_STARTER is not configured");
    return NextResponse.json(
      { error: "Checkout not configured" },
      { status: 500 },
    );
  }

  let body: { email?: string; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { email, prompt } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const origin = req.headers.get("origin") || "https://pennysite.app";

    // Store prompt directly in metadata (Stripe metadata limit is 500 chars per value)
    // Truncate if needed - full prompt will be stored in pending_generations table
    const truncatedPrompt =
      prompt.length > 450 ? `${prompt.substring(0, 447)}...` : prompt;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        prompt: truncatedPrompt,
        full_prompt_hash: Buffer.from(prompt)
          .toString("base64")
          .substring(0, 50),
        flow: "guest_checkout",
        credits: "100",
      },
      allow_promotion_codes: true,
      success_url: `${origin}/project/new?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/project/new?canceled=true`,
    });

    // Track checkout started
    trackServerEvent("anonymous", "guest_checkout_started", {
      has_email: !!email,
      prompt_length: prompt.length,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create guest checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
