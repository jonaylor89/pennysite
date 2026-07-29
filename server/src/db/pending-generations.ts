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
	// Atomic UPDATE ... RETURNING to prevent double-consumption races
	const [row] = await sql`
    UPDATE pending_generations
    SET consumed_at = NOW()
    WHERE checkout_session_id = ${checkoutSessionId}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    RETURNING user_id, prompt_token
  `;

	if (!row) return null;

	return {
		userId: row.user_id as string,
		prompt: row.prompt_token as string,
	};
}
