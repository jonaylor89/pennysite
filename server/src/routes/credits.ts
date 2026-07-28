import { Hono } from "hono";
import { getCreditBalance } from "../db/credits.js";
import {
	ENHANCE_RESERVED_CREDITS,
	estimateGenerationCredits,
} from "../lib/billing/config.js";
import type { Env } from "../types.js";

const credits = new Hono<Env>();

/**
 * GET /api/credits/balance
 */
credits.get("/balance", async (c) => {
	const user = c.get("user");
	const balance = await getCreditBalance(user.id);
	const estimates = estimateGenerationCredits();

	return c.json({
		...balance,
		estimates: {
			generation: estimates,
			enhance: {
				typical: ENHANCE_RESERVED_CREDITS,
			},
		},
	});
});

export default credits;
