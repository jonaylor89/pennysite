import Link from "next/link";

const packs = [
  { id: "starter", name: "Starter", credits: 50, price: 5 },
  { id: "basic", name: "Basic", credits: 220, price: 20, popular: true },
  { id: "pro", name: "Pro", credits: 600, price: 50 },
  { id: "max", name: "Max", credits: 1300, price: 100 },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/project/new" className="hover:text-white">
            Builder
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-white hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-2 text-zinc-400">
          Simple pay-per-use pricing. No subscriptions. Credits never expire.
        </p>

        {/* Credit Packs */}
        <h2 className="mt-12 text-xl font-semibold">Credit Packs</h2>
        <p className="mt-1 text-sm text-zinc-400">
          One-time purchase. Use credits whenever you want.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-2xl border p-6 text-left ${
                pack.popular
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-black">
                  Best value
                </span>
              )}
              <div className="text-sm text-zinc-400">{pack.name}</div>
              <div className="mt-1 text-2xl font-bold">
                {pack.credits} credits
              </div>
              <div className="mt-2 text-3xl font-bold">${pack.price}</div>
              <div className="mt-1 text-xs text-zinc-500">
                ${((pack.price / pack.credits) * 100).toFixed(1)}¢ per credit
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                ~{Math.floor(pack.credits / 47)} generations
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/auth/login?redirect=/billing"
            className="inline-block rounded-full bg-emerald-500 px-6 py-3 font-medium text-black hover:bg-emerald-400"
          >
            Sign in to buy credits
          </Link>
        </div>

        {/* Pricing Info */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="font-semibold">How pricing works</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <div className="flex justify-between">
              <span>Base cost per generation</span>
              <span className="text-white">5 credits</span>
            </div>
            <div className="flex justify-between">
              <span>Input tokens (your prompt)</span>
              <span className="text-white">0.1¢ per 100 tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Output tokens (generated HTML)</span>
              <span className="text-white">0.5¢ per 100 tokens</span>
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <div className="flex justify-between">
                <span>Typical generation</span>
                <span className="text-emerald-400">~47 credits ($4.70)</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            We reserve up to 150 credits before generation starts, then refund
            unused credits based on actual token usage.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
          <div className="mt-6 space-y-6 text-sm">
            <div>
              <h4 className="font-medium text-white">Do credits expire?</h4>
              <p className="mt-1 text-zinc-400">
                No. Credits never expire. Use them whenever you want.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">
                Is there a subscription?
              </h4>
              <p className="mt-1 text-zinc-400">
                No. All purchases are one-time. Buy credits when you need them.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white">
                Why does generation cost vary?
              </h4>
              <p className="mt-1 text-zinc-400">
                Costs depend on the complexity of your prompt and the generated
                output. Simple pages cost less; complex multi-section pages cost
                more.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
