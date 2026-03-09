"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";

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
        className="rounded p-1 text-ink-400 hover:bg-surface-2 hover:text-ink-900"
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
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-border bg-surface py-1 shadow-xl">
          <Link
            href={`/project/${project.id}/settings`}
            className="block px-3 py-2 text-sm text-ink-900 hover:bg-surface-2"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          {project.deployed_url && (
            <a
              href={project.deployed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm text-ink-900 hover:bg-surface-2"
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
            className="block w-full px-3 py-2 text-left text-sm text-error hover:bg-surface-2"
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
      className="pointer-events-none relative overflow-hidden bg-canvas"
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
      className="flex w-full items-center justify-center bg-surface"
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
        className="text-border-strong"
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
    <div className="overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong">
      <Link href={`/project/${project.id}`} className="block">
        <div className="border-b border-border">
          {project.previewHtml ? (
            <PreviewFrame html={project.previewHtml} />
          ) : (
            <PreviewPlaceholder />
          )}
        </div>
      </Link>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Link href={`/project/${project.id}`} className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-ink-900">
            {project.name}
          </h2>
          <p className="mt-0.5 truncate text-xs text-ink-400">
            {dateFmt.format(new Date(project.updated_at))}
            {project.deployed_url && (
              <span className="ml-1.5 text-accent-text">• Live</span>
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
        <Modal size="sm" onClose={() => setConfirmDeleteId(null)}>
          <h3 className="text-lg font-semibold text-ink-900">
            Delete Project?
          </h3>
          <p className="mt-2 text-sm text-ink-600">
            This will permanently delete the project and all its data. If the
            project is published, the live site will also be removed.
          </p>
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteId(null)}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deletingId === confirmDeleteId}
              onClick={() => handleDelete(confirmDeleteId)}
              disabled={deletingId !== null}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
