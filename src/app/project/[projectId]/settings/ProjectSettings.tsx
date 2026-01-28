"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function ProjectSettings({ project }: { project: Project }) {
  const router = useRouter();
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnpublish() {
    setIsUnpublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/unpublish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to unpublish");
        return;
      }
      router.refresh();
      setShowUnpublishConfirm(false);
    } catch {
      setError("Failed to unpublish");
    } finally {
      setIsUnpublishing(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete project");
        return;
      }
      router.push("/projects");
    } catch {
      setError("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Pennysite
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href={`/project/${project.id}`} className="hover:text-white">
            ← Back to Editor
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="mt-1 text-sm text-zinc-400">Project Settings</p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {project.deployed_url && (
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="font-semibold">Deployment</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-zinc-300">Published</span>
            </div>
            <a
              href={project.deployed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-emerald-400 hover:underline"
            >
              {project.deployed_url}
            </a>
            {project.custom_domain && (
              <div className="mt-2 text-sm text-zinc-400">
                Custom domain: {project.custom_domain}
                {project.custom_domain_status === "pending" && " (pending)"}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h2 className="font-semibold text-red-400">Danger Zone</h2>

          {project.deployed_url && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div>
                <div className="font-medium">Unpublish project</div>
                <div className="text-sm text-zinc-400">
                  Remove from the web. Your project files will be preserved.
                </div>
              </div>
              {showUnpublishConfirm ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUnpublishConfirm(false)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                    disabled={isUnpublishing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={isUnpublishing}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {isUnpublishing ? "Unpublishing..." : "Confirm"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUnpublishConfirm(true)}
                  className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                  Unpublish
                </button>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div>
              <div className="font-medium">Delete project</div>
              <div className="text-sm text-zinc-400">
                Permanently delete this project and all its data.
              </div>
            </div>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
              >
                Delete Project
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
