import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pay-per-use pricing for AI website generation. No subscriptions. Credits never expire.",
  openGraph: {
    title: "Pennysite Pricing",
    description:
      "Simple pay-per-use pricing for AI website generation. No subscriptions.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
