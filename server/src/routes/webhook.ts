import { Hono } from "hono";
import { config } from "../config.js";
import { addCreditsFromPurchase } from "../db/credits.js";
import { storePendingGeneration } from "../db/pending-generations.js";
import { ensureCreditAccount, getOrCreateGuestUser } from "../db/users.js";

const webhook = new Hono();

/**
 * POST /api/billing/webhook
 * Stripe webhook handler. No auth middleware — uses Stripe signature verification.
 */
webhook.post("/", async (c) => {
	const { getStripe } = await import("../lib/stripe/stripe.js");
	const stripe = getStripe();

	const body = await c.req.text();
	const sig = c.req.header("stripe-signature");

	if (!sig) {
		return c.json({ error: "Missing stripe-signature" }, 400);
	}

	let event: ReturnType<typeof stripe.webhooks.constructEvent>;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			sig,
			config.stripeWebhookSecret,
		);
	} catch (err) {
		console.error("Webhook signature verification failed:", err);
		return c.json({ error: "Invalid signature" }, 400);
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object;

		if (session.payment_status !== "paid") {
			return c.json({ received: true });
		}

		const metadata = session.metadata ?? {};
		const credits = Number(metadata.credits);
		const eventId = event.id;

		if (metadata.flow === "guest_checkout") {
			// Guest checkout flow
			const email = metadata.email;
			const prompt = metadata.prompt;

			if (!email || !credits) {
				console.error("Missing guest checkout metadata:", metadata);
				return c.json({ received: true });
			}

			try {
				const user = await getOrCreateGuestUser(email);
				await ensureCreditAccount(user.id);
				const added = await addCreditsFromPurchase(user.id, credits, eventId);

				if (added && prompt) {
					await storePendingGeneration(session.id, user.id, prompt);
				}

				const { trackServerEvent } = await import("../lib/posthog/server.js");
				trackServerEvent(user.id, "guest_checkout_completed", {
					credits,
					amount_cents: session.amount_total,
					is_new_user: !user.encrypted_password,
				});
			} catch (err) {
				console.error("Guest checkout processing failed:", err);
			}
		} else {
			// Authenticated user flow
			const userId = metadata.user_id;
			if (!userId || !credits) {
				console.error("Missing checkout metadata:", metadata);
				return c.json({ received: true });
			}

			try {
				const added = await addCreditsFromPurchase(userId, credits, eventId);
				if (added) {
					const { trackServerEvent } = await import("../lib/posthog/server.js");
					trackServerEvent(userId, "credits_purchased", {
						credits,
						pack_id: metadata.pack_id,
						amount_cents: session.amount_total,
					});
				}
			} catch (err) {
				console.error("Credit addition failed:", err);
			}
		}
	}

	return c.json({ received: true });
});

export default webhook;
