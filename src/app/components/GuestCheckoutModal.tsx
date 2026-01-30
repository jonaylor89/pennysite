"use client";

import { useState } from "react";

interface GuestCheckoutModalProps {
  prompt: string;
  onClose: () => void;
}

export function GuestCheckoutModal({
  prompt,
  onClose,
}: GuestCheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/guest-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), prompt }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🚀</div>
          <h2 className="text-xl font-semibold text-white">
            Generate Your Website
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Get 100 credits to create your first site. That's enough for a full
            multi-page website with room to iterate.
          </p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label htmlFor="guest-email" className="sr-only">
              Email address
            </label>
            <input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Redirecting to checkout..."
              : "Continue to Payment — $5"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <a
              href={`/auth/login?redirect=${encodeURIComponent("/project/new")}`}
              className="text-white underline hover:text-zinc-300"
            >
              Sign in
            </a>
          </p>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-zinc-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
