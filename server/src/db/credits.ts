import { sql } from "./pool.js";

export interface CreditBalance {
	availableCredits: number;
	reservedCredits: number;
}

export async function getCreditBalance(userId: string): Promise<CreditBalance> {
	const rows = await sql`SELECT * FROM get_credit_balance(${userId}::uuid)`;
	const row = rows[0];
	return {
		availableCredits: row?.available_credits ?? 0,
		reservedCredits: row?.reserved_credits ?? 0,
	};
}

export async function reserveCreditsForGeneration(
	userId: string,
	reservedCredits: number,
	idempotencyKey: string,
	projectId?: string,
): Promise<string> {
	const rows = await sql`
    SELECT reserve_credits_for_generation(
      ${userId}::uuid,
      ${reservedCredits}::integer,
      ${idempotencyKey}::text,
      ${projectId ?? null}::uuid
    )
  `;
	const result = rows[0]?.reserve_credits_for_generation;
	if (!result) {
		throw new Error("Failed to reserve credits");
	}
	return result as string;
}

export async function finalizeGenerationCredits(
	userId: string,
	generationId: string,
	success: boolean,
	actualCredits?: number,
	inputTokens?: number,
	outputTokens?: number,
	totalTokens?: number,
	errorMessage?: string,
): Promise<void> {
	await sql`
    SELECT finalize_generation_credits(
      ${userId}::uuid,
      ${generationId}::uuid,
      ${success}::boolean,
      ${actualCredits ?? null}::integer,
      ${inputTokens ?? null}::integer,
      ${outputTokens ?? null}::integer,
      ${totalTokens ?? null}::integer,
      ${errorMessage ?? null}::text
    )
  `;
}

export async function addCreditsFromPurchase(
	userId: string,
	credits: number,
	stripeEventId: string,
): Promise<boolean> {
	const rows = await sql`
    SELECT add_credits_from_purchase(
      ${userId}::uuid,
      ${credits}::integer,
      ${stripeEventId}::text
    )
  `;
	return (rows[0]?.add_credits_from_purchase as boolean) ?? false;
}

export async function updateGenerationProjectId(
	generationId: string,
	projectId: string,
): Promise<void> {
	await sql`
    UPDATE generations
    SET project_id = ${projectId}::uuid
    WHERE id = ${generationId}::uuid
  `;
}

export async function getOrCreateStripeCustomer(
	userId: string,
	email: string,
): Promise<string> {
	// Check if customer exists
	const existing = await sql`
    SELECT stripe_customer_id
    FROM stripe_customers
    WHERE user_id = ${userId}::uuid
    LIMIT 1
  `;

	if (existing[0]?.stripe_customer_id) {
		return existing[0].stripe_customer_id as string;
	}

	// Create new Stripe customer
	const { getStripe } = await import("../lib/stripe/stripe.js");
	const stripe = getStripe();

	const customer = await stripe.customers.create({
		email,
		metadata: { user_id: userId },
	});

	// Store mapping
	await sql`
    INSERT INTO stripe_customers (user_id, stripe_customer_id)
    VALUES (${userId}::uuid, ${customer.id})
    ON CONFLICT (user_id) DO NOTHING
  `;

	return customer.id;
}
