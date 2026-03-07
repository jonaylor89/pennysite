"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";

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
    <Modal onClose={onClose} size="md">
      <div className="mb-6 text-center">
        <div className="mb-3 text-4xl">🚀</div>
        <h2 className="font-serif text-xl text-fg">Generate Your Website</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Get 100 credits to create your first site. That's enough for a full
          multi-page website with room to iterate.
        </p>
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        <div>
          <label htmlFor="guest-email" className="sr-only">
            Email address
          </label>
          <Input
            id="guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
            invalid={!!error}
          />
        </div>

        {error && (
          <p className="text-sm text-danger-muted" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="success"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!email.trim()}
        >
          {loading ? "Redirecting to checkout..." : "Continue to Payment — $5"}
        </Button>

        <p className="text-center text-xs text-fg-subtle">
          Already have an account?{" "}
          <a
            href={`/auth/login?redirect=${encodeURIComponent("/project/new")}`}
            className="text-fg underline hover:text-fg-muted"
          >
            Sign in
          </a>
        </p>
      </form>

      <Button
        variant="link"
        fullWidth
        onClick={onClose}
        className="mt-4 text-sm"
      >
        Cancel
      </Button>
    </Modal>
  );
}
