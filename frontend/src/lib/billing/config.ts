// Client-side billing config — just the constants needed for display
export const MAX_RESERVED_CREDITS = 150;
export const ENHANCE_RESERVED_CREDITS = 30;

export const CREDIT_PACKS = [
	{ id: "starter", name: "Starter", credits: 100, priceUsd: 5 },
	{ id: "basic", name: "Basic", credits: 440, priceUsd: 20 },
	{ id: "pro", name: "Pro", credits: 1200, priceUsd: 50 },
	{ id: "max", name: "Max", credits: 2600, priceUsd: 100 },
] as const;

export function estimateGenerationCredits() {
	return {
		min: 30,
		typical: 100,
		max: MAX_RESERVED_CREDITS,
	};
}
