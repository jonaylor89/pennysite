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

/**
 * POST /api/billing/guest-checkout
 * Creates a Stripe checkout for unauthenticated users.
 */
billing.post("/guest-checkout", async (c) => {
	const { email, prompt, packId } = await c.req.json<{
		email: string;
		prompt: string;
		packId: string;
	}>();

	if (!email || !prompt || !packId) {
		return c.json({ error: "email, prompt, and packId are required" }, 400);
	}

	const { CREDIT_PACKS } = await import("../lib/stripe/packs.js");
	const pack = CREDIT_PACKS.find((p) => p.id === packId);
	if (!pack) {
		return c.json({ error: "Invalid pack" }, 400);
	}

	const { getStripe } = await import("../lib/stripe/stripe.js");
	const stripe = getStripe();

	const session = await stripe.checkout.sessions.create({
		customer_email: email,
		mode: "payment",
		line_items: [{ price: pack.stripePriceId, quantity: 1 }],
		success_url: `${config.siteUrl}/billing?session_id={CHECKOUT_SESSION_ID}&flow=guest_checkout`,
		cancel_url: `${config.siteUrl}/pricing`,
		metadata: {
			flow: "guest_checkout",
			email,
			prompt,
			pack_id: packId,
			credits: String(pack.credits),
		},
	});

	return c.json({ url: session.url });
});

/**
 * GET /api/billing/session-status
 * Polls Stripe session status after checkout.
 */
billing.get("/session-status", async (c) => {
	const sessionId = c.req.query("session_id");
	if (!sessionId) {
		return c.json({ error: "session_id required" }, 400);
	}

	const { getStripe } = await import("../lib/stripe/stripe.js");
	const stripe = getStripe();

	const session = await stripe.checkout.sessions.retrieve(sessionId);

	return c.json({
		status: session.status,
		payment_status: session.payment_status,
		customer_email: session.customer_details?.email || session.customer_email,
		metadata: session.metadata,
	});
});

export default billing;
