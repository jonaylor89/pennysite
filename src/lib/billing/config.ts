// Credit pricing configuration
// 1 credit = $0.10

// Base cost per generation (covers overhead)
export const BASE_CREDITS_PER_GENERATION = Number(
  process.env.BASE_CREDITS_PER_GENERATION || "5",
);

// Per-token costs (in credits)
// Input: 0.001 credits/token = $0.10 per 1000 tokens
// Output: 0.005 credits/token = $0.50 per 1000 tokens
export const CREDITS_PER_INPUT_TOKEN = Number(
  process.env.CREDITS_PER_INPUT_TOKEN || "0.001",
);

export const CREDITS_PER_OUTPUT_TOKEN = Number(
  process.env.CREDITS_PER_OUTPUT_TOKEN || "0.005",
);

// Maximum credits to reserve upfront (safety buffer)
// This should cover the largest expected generation
export const MAX_RESERVED_CREDITS = Number(
  process.env.MAX_RESERVED_CREDITS || "150",
);

// Credits to reserve for enhance operations (smaller, single-page)
export const ENHANCE_RESERVED_CREDITS = Number(
  process.env.ENHANCE_RESERVED_CREDITS || "30",
);

// Calculate credits from token usage
export function calculateCreditsFromTokens(
  inputTokens: number,
  outputTokens: number,
): number {
  const inputCost = inputTokens * CREDITS_PER_INPUT_TOKEN;
  const outputCost = outputTokens * CREDITS_PER_OUTPUT_TOKEN;
  const total = BASE_CREDITS_PER_GENERATION + inputCost + outputCost;

  // Round up to nearest integer
  return Math.ceil(total);
}

// Estimate credits for display purposes
export function estimateGenerationCredits(): {
  min: number;
  typical: number;
  max: number;
} {
  return {
    min: BASE_CREDITS_PER_GENERATION + 25, // ~1 page simple site
    typical: 100, // ~3 pages multi-page site
    max: MAX_RESERVED_CREDITS,
  };
}
