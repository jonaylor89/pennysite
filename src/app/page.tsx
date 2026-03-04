import Link from "next/link";
import Script from "next/script";
import { HeaderNav } from "./components/HeaderNav";
import { PromptForm } from "./components/PromptForm";

export const dynamic = "force-dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pennysite",
  description:
    "AI-powered website builder. Describe your website in plain English, see it instantly, and publish for free.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://pennysite.app",
  applicationCategory: "WebApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Pay-per-generation pricing starting at $0.10 per credit",
  },
  featureList: [
    "AI-powered website generation",
    "Real-time preview",
    "Multi-page website support",
    "Free hosting forever",
    "One-click publishing",
    "Download & export HTML",
  ],
};

export default function Home() {
  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-1/2 top-[-10%] h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/10 via-fuchsia-500/10 to-transparent blur-3xl" />
        </div>

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/about" className="text-sm font-semibold tracking-wide">
            What is Pennysite
          </Link>
          <HeaderNav />
        </header>

        <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-3xl text-center">
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
              What do you want to build?
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              Prompt, build, and deploy websites instantly.
            </p>

            <PromptForm />

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/project/new?prompt=A+landing+page+for+a+developer+tools+startup+with+features+pricing+and+docs+link"
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              >
                🚀 Dev tools startup
              </Link>
              <Link
                href="/project/new?prompt=A+personal+site+for+an+executive+coach+with+about+services+and+booking+page"
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              >
                🧘 Coaching practice
              </Link>
              <Link
                href="/project/new?prompt=A+simple+landing+page+for+my+SaaS+app+with+features+pricing+FAQ+and+testimonials"
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              >
                💻 SaaS landing page
              </Link>
            </div>
          </div>
        </main>

        <footer className="relative mx-auto w-full max-w-7xl px-6 py-10 text-center text-xs text-zinc-500">
          Build websites without a subscription. Free hosting forever.
        </footer>
      </div>
    </>
  );
}
