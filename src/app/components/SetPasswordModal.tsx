"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";

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
    <Modal size="md">
      <div className="mb-6 text-center">
        <div className="mb-3 text-4xl">🎉</div>
        <h2 className="font-serif text-xl text-fg">Your site is ready!</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Set a password to access your projects from any device.
        </p>
      </div>

      <form onSubmit={handleSetPassword} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="sr-only">
            Password
          </label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            minLength={6}
            disabled={loading}
            invalid={!!error}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="sr-only">
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            disabled={loading}
            invalid={!!error}
          />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!password || !confirm}
        >
          Set Password
        </Button>

        <Button variant="link" size="sm" fullWidth onClick={onSkip}>
          Skip for now
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-fg-subtle">
        You can always set a password later from your account settings.
      </p>
    </Modal>
  );
}
