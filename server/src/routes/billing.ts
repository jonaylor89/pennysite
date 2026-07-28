import { Hono } from "hono";
import { config } from "../config.js";
import { getOrCreateStripeCustomer } from "../db/credits.js";
import type { Env } from "../types.js";

const billing = new Hono<Env>();

/**
 * POST /api/billing/checkout
 * Creates a Stripe checkout session for an authenticated user.
 */
billing.post("/checkout", async (c) => {
	const user = c.get("user");
	const { packId } = await c.req.json<{ packId: string }>();

	const { CREDIT_PACKS } = await import("../lib/stripe/packs.js");
	const pack = CREDIT_PACKS.find((p) => p.id === packId);
	if (!pack) {
		return c.json({ error: "Invalid pack" }, 400);
	}

	const { getStripe } = await import("../lib/stripe/stripe.js");
	const stripe = getStripe();

	const customerId = await getOrCreateStripeCustomer(user.id, user.email);

	const { trackServerEvent } = await import("../lib/posthog/server.js");
	trackServerEvent(user.id, "checkout_started", {
		pack_id: packId,
		credits: pack.credits,
		price_usd: pack.priceUsd,
	});

	const session = await stripe.checkout.sessions.create({
		customer: customerId,
		mode: "payment",
		line_items: [{ price: pack.stripePriceId, quantity: 1 }],
		success_url: `${config.siteUrl}/billing?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${config.siteUrl}/billing`,
		metadata: {
			user_id: user.id,
			pack_id: packId,
			credits: String(pack.credits),
		},
	});

	return c.json({ url: session.url });
});

export default billing;
