import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/app/components/Footer";
import { buttonClass } from "@/app/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Pennysite is an AI website builder that lets you create and publish sites for pennies — no subscriptions, no bloat.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink-900">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-600">
          <Link href="/pricing" className="hover:text-ink-900">
            Pricing
          </Link>
          <Link href="/project/new" className="hover:text-ink-900">
            Builder
          </Link>
          <Link href="/auth/login" className={buttonClass("nav", "sm")}>
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex-1 max-w-4xl px-6 py-12">
        <h1 className="font-serif text-3xl tracking-[-0.02em]">
          About Pennysite
        </h1>
        <p className="mt-2 text-ink-600">
          A website builder that respects your wallet.
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink-900">
          <section>
            <h2 className="font-serif text-xl text-ink-900">
              What is Pennysite?
            </h2>
            <p className="mt-3">
              Pennysite is an AI-powered website builder. Describe what you want
              in plain English, see it rendered in seconds, and publish it for
              free!
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">How it works</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2">
              <li>
                <span className="text-ink-900">
                  Write a prompt describing the site you want.
                </span>
              </li>
              <li>
                <span className="text-ink-900">
                  AI generates multi-page HTML with instant preview.
                </span>
              </li>
              <li>
                <span className="text-ink-900">
                  Publish with one click. Your site is live with free hosting
                  forever.
                </span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">
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
            <h2 className="font-serif text-xl text-ink-900">Free hosting</h2>
            <p className="mt-3">
              Every site you publish is hosted for free with no hidden fees, no
              bandwidth limits, no expiration date. Build it once, and it stays
              online.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">
              Want the backstory?
            </h2>
            <p className="mt-3">
              Why does Pennysite exists?{" "}
              <a
                href="https://www.jonaylor.com/blog/i-built-a-website-builder-that-costs-pennies"
                className="text-accent underline underline-offset-2 hover:text-accent-hover"
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
          <Link href="/project/new" className={buttonClass("primary", "lg")}>
            Start building
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
