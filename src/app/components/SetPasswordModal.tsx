"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SetPasswordModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function SetPasswordModal({
  onComplete,
  onSkip,
}: SetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { needs_password: false },
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        onComplete();
      }
    } catch {
      setError("Failed to set password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <h2 className="text-xl font-semibold text-white">
            Your site is ready!
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Set a password to access your projects from any device.
          </p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="sr-only">
              Password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              minLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full rounded-lg bg-white py-3 font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Set Password"}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full text-center text-sm text-zinc-400 hover:text-white"
          >
            Skip for now
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          You can always set a password later from your account settings.
        </p>
      </div>
    </div>
  );
}
