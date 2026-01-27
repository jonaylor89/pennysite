import { NextResponse } from "next/server";
import { getOrCreateStripeCustomer } from "@/lib/billing/credits";
import { getPackById } from "@/lib/stripe/packs";
import { getStripe } from "@/lib/stripe/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packId } = (await req.json()) as { packId: string };

  const pack = getPackById(packId);
  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  if (!pack.stripePriceId) {
    return NextResponse.json(
      { error: "Pack not configured in Stripe" },
      { status: 500 },
    );
  }

  const customerId = await getOrCreateStripeCustomer(user.id, user.email || "");

  const origin = req.headers.get("origin") || "https://pennysite.vercel.app";

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [
      {
        price: pack.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      pack_id: pack.id,
      credits: pack.credits.toString(),
    },
    success_url: `${origin}/billing?success=true`,
    cancel_url: `${origin}/billing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
