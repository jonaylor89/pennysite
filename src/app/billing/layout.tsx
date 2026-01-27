import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits & Pricing",
  description:
    "Buy credits for AI website generation. Pay only for what you use—no subscriptions. Credits never expire.",
  openGraph: {
    title: "Pennysite Credits & Pricing",
    description:
      "Buy credits for AI website generation. Pay only for what you use—no subscriptions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
