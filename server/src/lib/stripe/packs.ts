export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  stripePriceId: string;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    priceUsd: 5,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "",
  },
  {
    id: "basic",
    name: "Basic",
    credits: 440,
    priceUsd: 20,
    stripePriceId: process.env.STRIPE_PRICE_BASIC || "",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 1200,
    priceUsd: 50,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "",
  },
  {
    id: "max",
    name: "Max",
    credits: 2600,
    priceUsd: 100,
    stripePriceId: process.env.STRIPE_PRICE_MAX || "",
  },
];

export function getPackById(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === packId);
}

export function getPackByPriceId(priceId: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.stripePriceId === priceId);
}
