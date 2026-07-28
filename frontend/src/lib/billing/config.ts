// Client-side billing config — just the constants needed for display
export const MAX_RESERVED_CREDITS = 150;
export const ENHANCE_RESERVED_CREDITS = 30;

export const CREDIT_PACKS = [
	{ id: "starter", name: "Starter", credits: 100, price: 5, popular: false },
	{ id: "basic", name: "Basic", credits: 440, price: 20, popular: true },
	{ id: "pro", name: "Pro", credits: 1200, price: 50, popular: false },
	{ id: "max", name: "Max", credits: 2600, price: 100, popular: false },
] as const;

export function estimateGenerationCredits() {
	return {
		min: 30,
		typical: 100,
		max: MAX_RESERVED_CREDITS,
	};
}
