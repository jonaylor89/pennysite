import Link from "next/link";
import { Footer } from "@/app/components/Footer";
import { buttonClass } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

const packs = [
  { id: "starter", name: "Starter", credits: 100, price: 5 },
  { id: "basic", name: "Basic", credits: 440, price: 20, popular: true },
  { id: "pro", name: "Pro", credits: 1200, price: 50 },
  { id: "max", name: "Max", credits: 2600, price: 100 },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink-900">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-600">
          <Link href="/project/new" className="hover:text-ink-900">
            Builder
          </Link>
          <Link href="/auth/login" className={buttonClass("nav", "sm")}>
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex-1 max-w-4xl px-6 py-12">
        <h1 className="font-serif text-3xl tracking-[-0.02em]">Pricing</h1>
        <p className="mt-2 text-ink-600">
          Simple pay-per-use pricing. No subscriptions. Credits never expire.
        </p>

        {/* Credit Packs */}
        <h2 className="mt-12 font-serif text-xl">Credit Packs</h2>
        <p className="mt-1 text-sm text-ink-600">
          One-time purchase. Use credits whenever you want.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-xl border p-6 text-left ${
                pack.popular
                  ? "border-accent/50 bg-accent-light"
                  : "border-border bg-surface"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                  Best value
                </span>
              )}
              <div className="text-sm text-ink-600">{pack.name}</div>
              <div className="mt-1 text-2xl font-bold">
                {pack.credits} credits
              </div>
              <div className="mt-2 text-3xl font-bold">${pack.price}</div>
              <div className="mt-1 text-xs text-ink-400">
                ${((pack.price / pack.credits) * 100).toFixed(1)}¢ per credit
              </div>
              <div className="mt-3 text-xs text-ink-400">
                ~{Math.floor(pack.credits / 47)} generations
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/auth/login?redirect=/billing"
            className={buttonClass("primary", "lg")}
          >
            Sign in to buy credits
          </Link>
        </div>

        {/* Pricing Info */}
        <Card className="mt-12 bg-surface">
          <h3 className="font-semibold">How pricing works</h3>
          <div className="mt-4 space-y-3 text-sm text-ink-600">
            <div className="flex justify-between">
              <span>Base cost per generation</span>
              <span className="text-ink-900">5 credits</span>
            </div>
            <div className="flex justify-between">
              <span>Input tokens (your prompt)</span>
              <span className="text-ink-900">0.1¢ per 100 tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Output tokens (generated HTML)</span>
              <span className="text-ink-900">0.5¢ per 100 tokens</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span>Typical generation (3 pages)</span>
                <span className="text-accent-text">~100 credits ($5.00)</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-400">
            We reserve up to 150 credits before generation starts, then refund
            unused credits based on actual token usage.
          </p>
        </Card>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="font-serif text-xl">Frequently Asked Questions</h3>
          <div className="mt-6 space-y-6 text-sm">
            <div>
              <h4 className="font-medium text-ink-900">Do credits expire?</h4>
              <p className="mt-1 text-ink-600">
                No. Credits never expire. Use them whenever you want.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-ink-900">
                Is there a subscription?
              </h4>
              <p className="mt-1 text-ink-600">
                No. All purchases are one-time. Buy credits when you need them.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-ink-900">
                Why does generation cost vary?
              </h4>
              <p className="mt-1 text-ink-600">
                Costs depend on the complexity of your prompt and the generated
                output. Simple pages cost less; complex multi-section pages cost
                more.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
