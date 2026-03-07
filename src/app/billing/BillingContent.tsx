"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Alert } from "@/app/components/ui/Alert";
import { Card } from "@/app/components/ui/Card";

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
  { id: "starter", name: "Starter", credits: 100, price: 5 },
  { id: "basic", name: "Basic", credits: 440, price: 20, popular: true },
  { id: "pro", name: "Pro", credits: 1200, price: 50 },
  { id: "max", name: "Max", credits: 2600, price: 100 },
];

type Props = {
  initialBalance: CreditBalance;
};

function BillingContentInner({ initialBalance }: Props) {
  const [balance, setBalance] = useState<CreditBalance>(initialBalance);
  const [buyingPack, setBuyingPack] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({ type: "success", text: "Credits added successfully!" });
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

  return (
    <>
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          className="mt-6"
        >
          {message.text}
        </Alert>
      )}

      {/* Current Balance */}
      <Card className="mt-8">
        <div className="text-sm text-fg-muted">Your balance</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-success-muted">
            {balance.availableCredits}
          </span>
          <span className="text-fg-muted">credits</span>
        </div>
        {balance.reservedCredits > 0 && (
          <div className="mt-2 text-sm text-fg-subtle">
            {balance.reservedCredits} credits reserved for active generations
          </div>
        )}
        <div className="mt-4 text-sm text-fg-subtle">
          Typical generation costs ~{balance.generationCost.typical} credits
        </div>
      </Card>

      {/* Credit Packs */}
      <h2 className="mt-12 font-serif text-xl">Buy Credits</h2>
      <p className="mt-1 text-sm text-fg-muted">
        One-time purchase. No subscription. Credits never expire.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => buyPack(pack.id)}
            disabled={buyingPack !== null}
            className={`relative rounded-modal border p-6 text-left transition-all ${
              pack.popular
                ? "border-success/50 bg-success/10 hover:border-success"
                : "border-border bg-surface hover:border-border-hover"
            } ${buyingPack === pack.id ? "opacity-70" : ""} disabled:cursor-wait`}
          >
            {pack.popular && (
              <span className="absolute -top-2.5 right-4 rounded-pill bg-success px-2 py-0.5 text-xs font-medium text-primary-fg">
                Best value
              </span>
            )}
            <div className="text-sm text-fg-muted">{pack.name}</div>
            <div className="mt-1 text-2xl font-bold">
              {pack.credits} credits
            </div>
            <div className="mt-2 text-3xl font-bold">${pack.price}</div>
            <div className="mt-1 text-xs text-fg-subtle">
              ${((pack.price / pack.credits) * 100).toFixed(1)}¢ per credit
            </div>
            <div className="mt-3 text-xs text-fg-subtle">
              ~{Math.floor(pack.credits / 47)} generations
            </div>
            {buyingPack === pack.id && (
              <div className="mt-2 text-xs text-success-muted">
                Redirecting to checkout...
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Pricing Info */}
      <Card className="mt-12 bg-surface-alt">
        <h3 className="font-semibold">How pricing works</h3>
        <div className="mt-4 space-y-3 text-sm text-fg-muted">
          <div className="flex justify-between">
            <span>Base cost per generation</span>
            <span className="text-fg">5 credits</span>
          </div>
          <div className="flex justify-between">
            <span>Input tokens (your prompt)</span>
            <span className="text-fg">0.1¢ per 100 tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Output tokens (generated HTML)</span>
            <span className="text-fg">0.5¢ per 100 tokens</span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between">
              <span>Typical generation (3 pages)</span>
              <span className="text-success-muted">~100 credits ($5.00)</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-fg-subtle">
          We reserve up to 150 credits before generation starts, then refund
          unused credits based on actual token usage.
        </p>
      </Card>
    </>
  );
}

export function BillingContent({ initialBalance }: Props) {
  return (
    <Suspense fallback={null}>
      <BillingContentInner initialBalance={initialBalance} />
    </Suspense>
  );
}
