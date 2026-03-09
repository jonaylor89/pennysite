import { CameraIcon, DumbbellIcon, GemIcon } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { Footer } from "./components/Footer";
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
      <div className="relative flex flex-col overflow-hidden bg-canvas text-ink-900">
        {/* Hero Section - Fills the viewport */}
        <div className="relative flex min-h-screen flex-col">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-1/2 top-[-10%] h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/8 to-transparent blur-3xl" />
          </div>

          <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/android-chrome-512x512.png"
                alt="Pennysite"
                width={56}
                height={56}
              />
            </Link>
            <HeaderNav />
          </header>

          <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(45,106,79,0.2)] bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-text">
                <span className="text-gold">✦</span> AI Website Builder - No
                subscription needed
              </div>
              <h1 className="font-serif text-balance text-5xl tracking-[-0.02em] sm:text-6xl">
                What do you want to make?
              </h1>
              <p className="mt-6 text-lg text-ink-600">
                Prompt, build, and deploy websites in minutes. Your site lives
                free, forever.
              </p>

              <PromptForm />

              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/project/new?prompt=A+warm+elegant+wedding+photography+site+with+a+full-screen+hero+gallery+about+me+section+packages+and+a+contact+form+to+book+a+session"
                  className="flex flex-row items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm text-ink-600 transition hover:border-accent hover:bg-accent-light hover:text-accent-text"
                >
                  <GemIcon size={14} className="mr-2" />
                  Wedding photographer
                </Link>
                <Link
                  href="/project/new?prompt=A+bold+motivating+site+for+a+personal+trainer+with+services+like+1-on-1+coaching+and+group+classes+transformation+testimonials+and+a+booking+page"
                  className="flex flex-row items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm text-ink-600 transition hover:border-accent hover:bg-accent-light hover:text-accent-text"
                >
                  <DumbbellIcon size={14} className="mr-2" />
                  Personal trainer
                </Link>
                <Link
                  href="/project/new?prompt=A+clean+modern+landing+page+for+an+indie+podcast+with+episode+highlights+listen-on+links+for+Spotify+and+Apple+a+host+bio+and+an+email+subscribe+form"
                  className="flex flex-row items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm text-ink-600 transition hover:border-accent hover:bg-accent-light hover:text-accent-text"
                >
                  <CameraIcon size={14} className="mr-2" />
                  Podcast landing page
                </Link>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
