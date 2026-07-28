import { Hono } from "hono";
import type { Env } from "../types.js";
import { getCreditBalance } from "../db/credits.js";
import {
  estimateGenerationCredits,
  ENHANCE_RESERVED_CREDITS,
} from "../lib/billing/config.js";

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
