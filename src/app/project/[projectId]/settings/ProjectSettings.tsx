"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Database } from "@/lib/supabase/types";
import type { ProjectStats } from "./page";

type Project = Database["public"]["Tables"]["projects"]["Row"];

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {subValue && (
        <div className="mt-0.5 text-xs text-zinc-500">{subValue}</div>
      )}
    </div>
  );
}

export function ProjectSettings({
  project,
  stats,
}: {
  project: Project;
  stats: ProjectStats;
}) {
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

  const domainStatusColor = {
    pending: "text-yellow-400",
    active: "text-emerald-400",
    error: "text-red-400",
  };

  const domainStatusLabel = {
    pending: "Pending DNS verification",
    active: "Active",
    error: "DNS verification failed",
  };

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

        {/* Deployment Status */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold">Deployment</h2>
          {project.deployed_url ? (
            <>
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
              {project.last_deployed_at && (
                <div className="mt-2 text-xs text-zinc-500">
                  Last deployed {formatDate(project.last_deployed_at)}
                </div>
              )}
            </>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
              <span className="text-sm text-zinc-400">Not published</span>
            </div>
          )}
        </div>

        {/* Custom Domain */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold">Custom Domain</h2>
          {project.custom_domain ? (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    project.custom_domain_status === "active"
                      ? "bg-emerald-500"
                      : project.custom_domain_status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-zinc-300">
                  {project.custom_domain}
                </span>
              </div>
              <div
                className={`mt-1 text-xs ${domainStatusColor[project.custom_domain_status ?? "pending"]}`}
              >
                {domainStatusLabel[project.custom_domain_status ?? "pending"]}
              </div>
              {project.custom_domain_added_at && (
                <div className="mt-1 text-xs text-zinc-500">
                  Added {formatDate(project.custom_domain_added_at)}
                </div>
              )}
              {project.custom_domain_status === "pending" && (
                <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-xs text-zinc-400">
                  <p className="font-medium text-zinc-300">DNS Configuration</p>
                  <p className="mt-1">
                    Add a CNAME record pointing to{" "}
                    <code className="rounded bg-zinc-700 px-1 py-0.5 text-emerald-400">
                      {project.cf_project_name}.pages.dev
                    </code>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 text-sm text-zinc-400">
              {project.deployed_url
                ? "No custom domain configured. Add one from the editor."
                : "Publish your project first to add a custom domain."}
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold">Usage</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard
              label="Credits Used"
              value={formatNumber(stats.totalCreditsUsed)}
              subValue={`$${(stats.totalCreditsUsed * 0.1).toFixed(2)} value`}
            />
            <StatCard
              label="Generations"
              value={stats.totalGenerations}
              subValue={
                stats.failedGenerations > 0
                  ? `${stats.failedGenerations} failed`
                  : undefined
              }
            />
            <StatCard
              label="Input Tokens"
              value={formatNumber(stats.totalInputTokens)}
              subValue="prompts & context"
            />
            <StatCard
              label="Output Tokens"
              value={formatNumber(stats.totalOutputTokens)}
              subValue="generated HTML"
            />
          </div>
          {stats.lastGenerationAt && (
            <div className="mt-4 text-xs text-zinc-500">
              Last generation: {formatDate(stats.lastGenerationAt)}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold">Project Info</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Created</span>
              <span>{formatDate(project.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Last updated</span>
              <span>{formatDate(project.updated_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Project ID</span>
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                {project.id}
              </code>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
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
