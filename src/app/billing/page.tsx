"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CreditBalance = {
  availableCredits: number;
  reservedCredits: number;
  generationCost: {
    min: number;
    typical: number;
    max: number;
  };
};

const packs = [
  { id: "starter", name: "Starter", credits: 50, price: 5 },
  { id: "basic", name: "Basic", credits: 220, price: 20, popular: true },
  { id: "pro", name: "Pro", credits: 600, price: 50 },
  { id: "max", name: "Max", credits: 1300, price: 100 },
];

function BillingContent() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingPack, setBuyingPack] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=/billing");
        return;
      }

      const res = await fetch("/api/credits/balance");
      const data = await res.json();
      if (!data.error) {
        setBalance(data);
      }
      setIsLoading(false);
    }
    load();
  }, [supabase.auth, router]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({ type: "success", text: "Credits added successfully!" });
      // Refresh balance
      fetch("/api/credits/balance")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setBalance(data);
        });
      router.replace("/billing");
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "Purchase was canceled." });
      router.replace("/billing");
    }
  }, [searchParams, router]);

  async function buyPack(packId: string) {
    setBuyingPack(packId);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "Failed to checkout" });
        setBuyingPack(null);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to start checkout" });
      setBuyingPack(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading...
      </div>
    );
  }

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
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Credits</h1>
        <p className="mt-2 text-zinc-400">
          Buy credits to generate websites. Pay only for what you use.
        </p>

        {message && (
          <div
            className={`mt-6 rounded-lg p-4 ${
              message.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Current Balance */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-sm text-zinc-400">Your balance</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-emerald-400">
              {balance?.availableCredits ?? 0}
            </span>
            <span className="text-zinc-400">credits</span>
          </div>
          {balance && balance.reservedCredits > 0 && (
            <div className="mt-2 text-sm text-zinc-500">
              {balance.reservedCredits} credits reserved for active generations
            </div>
          )}
          <div className="mt-4 text-sm text-zinc-500">
            Typical generation costs ~{balance?.generationCost.typical ?? 47}{" "}
            credits
          </div>
        </div>

        {/* Credit Packs */}
        <h2 className="mt-12 text-xl font-semibold">Buy Credits</h2>
        <p className="mt-1 text-sm text-zinc-400">
          One-time purchase. No subscription. Credits never expire.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => buyPack(pack.id)}
              disabled={buyingPack !== null}
              className={`relative rounded-2xl border p-6 text-left transition-all ${
                pack.popular
                  ? "border-emerald-500/50 bg-emerald-500/10 hover:border-emerald-500"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              } ${buyingPack === pack.id ? "opacity-70" : ""} disabled:cursor-wait`}
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
              {buyingPack === pack.id && (
                <div className="mt-2 text-xs text-emerald-400">
                  Redirecting to checkout...
                </div>
              )}
            </button>
          ))}
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
      </main>
    </div>
  );
}

export default function Billing() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          Loading...
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
