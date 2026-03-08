import { LaptopIcon, MegaphoneIcon, RocketIcon } from "lucide-react";
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
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "5",
      priceCurrency: "USD",
      description: "100 credits",
    },
    {
      "@type": "Offer",
      name: "Basic",
      price: "20",
      priceCurrency: "USD",
      description: "440 credits",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "50",
      priceCurrency: "USD",
      description: "1200 credits",
    },
    {
      "@type": "Offer",
      name: "Max",
      price: "100",
      priceCurrency: "USD",
      description: "2600 credits",
    },
  ],
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
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-fg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-1/2 top-[-10%] h-[1000px] w-[1000px] -translate-x-1/2 rounded-pill bg-gradient-to-b from-accent/10 via-fuchsia-500/10 to-transparent blur-3xl" />
        </div>

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/about" className="text-sm font-semibold tracking-wide">
            What is Pennysite
          </Link>
          <HeaderNav />
        </header>

        <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-3xl text-center">
            <h1 className="font-serif text-balance text-5xl tracking-[-0.02em] sm:text-6xl">
              What do you want to build?
            </h1>
            <p className="mt-6 text-lg text-fg-muted">
              Prompt, build, and deploy websites instantly.
            </p>

            <PromptForm />

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/project/new?prompt=A+landing+page+for+a+developer+tools+startup+with+features+pricing+and+docs+link"
                className="flex flex-row justify-center items-center rounded-pill border border-border bg-surface-alt px-4 py-2 text-sm text-fg-muted transition hover:border-border-hover hover:bg-surface hover:text-fg"
              >
                <RocketIcon size={14} className="mr-2" />
                Dev tools startup
              </Link>
              <Link
                href="/project/new?prompt=A+personal+site+for+an+executive+coach+with+about+services+and+booking+page"
                className="flex flex-row justify-center items-center rounded-pill border border-border bg-surface-alt px-4 py-2 text-sm text-fg-muted transition hover:border-border-hover hover:bg-surface hover:text-fg"
              >
                <MegaphoneIcon size={14} className="mr-2" />
                Coaching practice
              </Link>
              <Link
                href="/project/new?prompt=A+simple+landing+page+for+my+SaaS+app+with+features+pricing+FAQ+and+testimonials"
                className="flex flex-row justify-center items-center  rounded-pill border border-border bg-surface-alt px-4 py-2 text-sm text-fg-muted transition hover:border-border-hover hover:bg-surface hover:text-fg"
              >
                <LaptopIcon size={14} className="mr-2" />
                SaaS landing page
              </Link>
            </div>
          </div>
        </main>

        <footer className="relative mx-auto w-full max-w-7xl px-6 py-10 text-center text-xs text-fg-subtle">
          Build websites without a subscription. Free hosting forever.
        </footer>
      </div>
    </>
  );
}
