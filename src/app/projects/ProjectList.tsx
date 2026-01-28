"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";

type Project = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deployed_url: string | null;
  previewHtml: string | null;
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const ProjectMenu = memo(function ProjectMenu({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        aria-label="Project menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
          <Link
            href={`/project/${project.id}/settings`}
            className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          {project.deployed_url && (
            <a
              href={project.deployed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              onClick={() => setIsOpen(false)}
            >
              View Live Site
            </a>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
              onDelete(project.id);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-800"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
});

/** Viewport we render the page at before scaling down */
const VIEWPORT_W = 1440;
const VIEWPORT_H = 900;

function PreviewFrame({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / VIEWPORT_W);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none relative overflow-hidden bg-zinc-950"
      style={{ aspectRatio: `${VIEWPORT_W}/${VIEWPORT_H}` }}
    >
      <iframe
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin"
        title="Preview"
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{
          width: VIEWPORT_W,
          height: VIEWPORT_H,
          transform: `scale(${scale})`,
          opacity: scale === 0 ? 0 : 1,
        }}
        tabIndex={-1}
        loading="lazy"
      />
    </div>
  );
}

function PreviewPlaceholder() {
  return (
    <div
      className="flex w-full items-center justify-center bg-zinc-900"
      style={{ aspectRatio: `${VIEWPORT_W}/${VIEWPORT_H}` }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-700"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 8 6 4-6 4Z" />
      </svg>
    </div>
  );
}

const ProjectCard = memo(function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700">
      <Link href={`/project/${project.id}`} className="block">
        <div className="border-b border-zinc-800">
          {project.previewHtml ? (
            <PreviewFrame html={project.previewHtml} />
          ) : (
            <PreviewPlaceholder />
          )}
        </div>
      </Link>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Link href={`/project/${project.id}`} className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-white">
            {project.name}
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {dateFmt.format(new Date(project.updated_at))}
            {project.deployed_url && (
              <span className="ml-1.5 text-emerald-500">• Live</span>
            )}
          </p>
        </Link>
        <ProjectMenu project={project} onDelete={onDelete} />
      </div>
    </div>
  );
});

export function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestDelete = useCallback((id: string) => {
    setConfirmDeleteId(id);
    setError(null);
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete project");
      }
    } catch {
      setError("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleRequestDelete}
          />
        ))}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold text-white">
              Delete Project?
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              This will permanently delete the project and all its data. If the
              project is published, the live site will also be removed.
            </p>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId !== null}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
