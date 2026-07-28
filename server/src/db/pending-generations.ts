import { sql } from "./pool.js";

export async function storePendingGeneration(
	checkoutSessionId: string,
	userId: string,
	prompt: string,
): Promise<void> {
	await sql`
    INSERT INTO pending_generations (checkout_session_id, user_id, prompt_token)
    VALUES (${checkoutSessionId}, ${userId}::uuid, ${prompt})
  `;
}

export async function consumePendingGeneration(
	checkoutSessionId: string,
): Promise<{ userId: string; prompt: string } | null> {
	const rows = await sql`
    SELECT id, user_id, prompt_token
    FROM pending_generations
    WHERE checkout_session_id = ${checkoutSessionId}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;

	if (!rows[0]) return null;

	const pending = rows[0];

	await sql`
    UPDATE pending_generations
    SET consumed_at = NOW()
    WHERE id = ${pending.id}::uuid
  `;

	return {
		userId: pending.user_id as string,
		prompt: pending.prompt_token as string,
	};
}
