"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="font-semibold text-red-400">Danger Zone</h2>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="font-medium">Delete account</div>
          <div className="mt-1 text-sm text-zinc-400">
            Permanently delete your account and all your projects. This action
            cannot be undone.
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {showDeleteConfirm ? (
            <div className="mt-4">
              <p className="text-sm text-zinc-400">
                Type{" "}
                <span className="font-mono text-white">delete my account</span>{" "}
                to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                placeholder="delete my account"
                disabled={isDeleting}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText("");
                    setError(null);
                  }}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== "delete my account"}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete My Account"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </>
  );
}
