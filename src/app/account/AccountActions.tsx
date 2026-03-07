"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/app/components/ui/Alert";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export function AccountActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (confirmText !== "delete my account") return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete account");
        setIsDeleting(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to delete account");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-6">
        <Button variant="ghost" size="md" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Card variant="danger" className="mt-8">
        <h2 className="font-semibold text-danger-muted">Danger Zone</h2>

        <Card variant="default" padding="md" className="mt-4">
          <div className="font-medium">Delete account</div>
          <div className="mt-1 text-sm text-fg-muted">
            Permanently delete your account and all your projects. This action
            cannot be undone.
          </div>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          {showDeleteConfirm ? (
            <div className="mt-4">
              <p className="text-sm text-fg-muted">
                Type{" "}
                <span className="font-mono text-fg">delete my account</span> to
                confirm:
              </p>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-2"
                placeholder="delete my account"
                disabled={isDeleting}
              />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText("");
                    setError(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={isDeleting}
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "delete my account"}
                >
                  Delete My Account
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="danger-outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          )}
        </Card>
      </Card>
    </>
  );
}
