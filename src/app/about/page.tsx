import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Pennysite is an AI website builder that lets you create and publish sites for pennies — no subscriptions, no bloat.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
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
        <h1 className="text-3xl font-semibold">About Pennysite</h1>
        <p className="mt-2 text-zinc-400">
          A website builder that respects your wallet.
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              What is Pennysite?
            </h2>
            <p className="mt-3">
              Pennysite is an AI-powered website builder. Describe what you want
              in plain English, see it rendered in seconds, and publish it for
              free!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">How it works</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2">
              <li>
                <span className="text-zinc-300">
                  Write a prompt describing the site you want.
                </span>
              </li>
              <li>
                <span className="text-zinc-300">
                  AI generates multi-page HTML with instant preview.
                </span>
              </li>
              <li>
                <span className="text-zinc-300">
                  Publish with one click. Your site is live with free hosting
                  forever.
                </span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              No subscriptions, ever
            </h2>
            <p className="mt-3">
              Most website builders lock you into monthly plans whether you
              build anything or not. Pennysite flips that model: you buy credits
              when you need them, and you only pay for what you generate.
              Credits never expire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Free hosting</h2>
            <p className="mt-3">
              Every site you publish is hosted for free with no hidden fees, no
              bandwidth limits, no expiration date. Build it once, and it stays
              online.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Want the backstory?
            </h2>
            <p className="mt-3">
              Why does Pennysite exists?{" "}
              <a
                href="https://www.jonaylor.com/blog/i-built-a-website-builder-that-costs-pennies"
                className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the blog post
              </a>{" "}
              about why I built a website builder that doesn't require a
              subscription.
            </p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/project/new"
            className="inline-block rounded-full bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Start building
          </Link>
        </div>
      </main>
    </div>
  );
}
