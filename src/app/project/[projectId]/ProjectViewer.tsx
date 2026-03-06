"use client";

import Link from "next/link";
import { useState } from "react";

type Message =
  | {
      role: "user" | "assistant";
      content: string;
      images?: { data: string; mimeType: string }[];
      imageCount?: number;
    }
  | {
      role: "enhance";
      skillId: string;
      skillName: string;
      skillIcon: string;
      filename: string;
      status: "pending" | "complete" | "error";
      error?: string;
      creditsUsed?: number;
    };

type Props = {
  projectName: string;
  pages: Record<string, string>;
  conversation: Message[];
  deployedUrl?: string | null;
};

export function ProjectViewer({
  projectName,
  pages,
  conversation,
  deployedUrl,
}: Props) {
  const pageNames = Object.keys(pages);
  const [currentPage, setCurrentPage] = useState(
    pageNames.includes("index.html") ? "index.html" : pageNames[0] || "",
  );
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("preview");

  const displayHtml = pages[currentPage] || "";

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* ===== HEADER (Desktop) ===== */}
      <header className="hidden shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 lg:flex">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-bold text-white hover:text-zinc-200"
          >
            Pennysite
          </Link>
          <span className="text-zinc-600">·</span>
          <span className="text-lg font-semibold text-white">
            {projectName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {deployedUrl && (
            <a
              href={deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              🌐 View Live Site
            </a>
          )}
        </div>
      </header>

      {/* ===== HEADER (Mobile) ===== */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-white">
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <span className="max-w-[200px] truncate font-medium text-white">
            {projectName}
          </span>
        </div>
        {deployedUrl && (
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View Live
          </a>
        )}
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex min-h-0 flex-1 flex-row">
        {/* ===== LEFT PANEL - CONVERSATION (Desktop) ===== */}
        <div className="hidden w-96 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 lg:flex">
          {/* Chat Header */}
          <div className="border-b border-zinc-800 p-4">
            <h2 className="font-semibold text-white">Conversation</h2>
          </div>

          {/* Shared project banner */}
          <div className="border-b border-zinc-800 bg-zinc-800/50 px-4 py-2.5">
            <p className="text-xs text-zinc-400">
              👁 You&apos;re viewing a shared project
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {conversation.map((msg, i) => {
                if (msg.role === "enhance") {
                  return (
                    <div
                      key={`enhance-${msg.skillId}-${i}`}
                      className={`mr-4 rounded-lg border p-3 ${
                        msg.status === "pending"
                          ? "border-zinc-700 bg-zinc-800"
                          : msg.status === "complete"
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{msg.skillIcon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {msg.skillName}
                            </span>
                            {msg.status === "pending" && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                Enhancing...
                              </span>
                            )}
                            {msg.status === "complete" && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                                ✓ Applied
                              </span>
                            )}
                            {msg.status === "error" && (
                              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                                Failed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">
                            {msg.status === "pending" &&
                              `Applying to ${msg.filename}...`}
                            {msg.status === "complete" && (
                              <>
                                Enhanced {msg.filename}
                                {msg.creditsUsed
                                  ? ` · ${msg.creditsUsed} credits`
                                  : ""}
                              </>
                            )}
                            {msg.status === "error" &&
                              (msg.error || "Enhancement failed")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={`${msg.role}-${i}`}
                    className={`text-sm ${
                      msg.role === "user"
                        ? "ml-4 rounded-lg bg-zinc-700 p-3 text-white"
                        : "mr-4 rounded-lg bg-zinc-800 p-3 text-zinc-300"
                    }`}
                  >
                    {msg.role === "user" &&
                      msg.images &&
                      msg.images.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {msg.images.map((img, imgIdx) => (
                            // biome-ignore lint/performance/noImgElement: base64 data URLs not supported by next/image
                            <img
                              key={`msg-img-${i}-${imgIdx}`}
                              src={`data:${img.mimeType};base64,${img.data}`}
                              alt={`Attachment ${imgIdx + 1}`}
                              className="h-12 w-12 rounded border border-zinc-600 object-cover"
                            />
                          ))}
                        </div>
                      )}
                    {msg.role === "user" &&
                      !msg.images &&
                      msg.imageCount &&
                      msg.imageCount > 0 && (
                        <div className="mb-1.5 inline-flex items-center gap-1 rounded bg-zinc-600/50 px-2 py-0.5 text-xs text-zinc-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          {msg.imageCount} image
                          {msg.imageCount > 1 ? "s" : ""} attached
                        </div>
                      )}
                    {msg.content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL - PREVIEW ===== */}
        <div
          className={`min-h-0 flex-1 flex-col ${mobileTab === "preview" ? "flex" : "hidden lg:flex"}`}
        >
          {/* Page tabs */}
          {pageNames.length > 1 && (
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-900 px-4 py-2">
              {pageNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCurrentPage(name)}
                  className={`shrink-0 rounded px-3 py-1 text-sm transition-colors ${
                    currentPage === name
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Preview header (desktop only) */}
          <div className="hidden shrink-0 items-center border-b border-zinc-800 bg-zinc-900 px-4 py-2 lg:flex">
            <span className="text-sm text-zinc-400">
              Preview{currentPage ? `: ${currentPage}` : ""}
            </span>
          </div>

          {/* Preview iframe */}
          <div className="relative min-h-0 flex-1 bg-zinc-950">
            <div className="h-full w-full">
              {displayHtml ? (
                <iframe
                  className="h-full w-full border-0 bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={displayHtml}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-zinc-400">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">🏗️</div>
                    <p className="text-base">No preview available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== MOBILE CONVERSATION PANEL ===== */}
        <div
          className={`min-h-0 flex-1 flex-col bg-zinc-900 ${mobileTab === "chat" ? "flex lg:hidden" : "hidden"}`}
        >
          {/* Shared project banner */}
          <div className="border-b border-zinc-800 bg-zinc-800/50 px-4 py-2.5">
            <p className="text-xs text-zinc-400">
              👁 You&apos;re viewing a shared project
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {conversation.map((msg, i) => {
                if (msg.role === "enhance") {
                  return (
                    <div
                      key={`mobile-enhance-${msg.skillId}-${i}`}
                      className={`mr-4 rounded-lg border p-3 ${
                        msg.status === "pending"
                          ? "border-zinc-700 bg-zinc-800"
                          : msg.status === "complete"
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{msg.skillIcon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {msg.skillName}
                            </span>
                            {msg.status === "pending" && (
                              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                              </span>
                            )}
                            {msg.status === "complete" && (
                              <span className="text-xs text-emerald-400">
                                ✓
                              </span>
                            )}
                            {msg.status === "error" && (
                              <span className="text-xs text-red-400">✗</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">
                            {msg.status === "pending" && "Enhancing..."}
                            {msg.status === "complete" && msg.filename}
                            {msg.status === "error" && (msg.error || "Failed")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={`mobile-${msg.role}-${i}`}
                    className={`text-sm ${
                      msg.role === "user"
                        ? "ml-4 rounded-lg bg-zinc-700 p-3 text-white"
                        : "mr-4 rounded-lg bg-zinc-800 p-3 text-zinc-300"
                    }`}
                  >
                    {msg.role === "user" &&
                      msg.images &&
                      msg.images.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {msg.images.map((img, imgIdx) => (
                            // biome-ignore lint/performance/noImgElement: base64 data URLs not supported by next/image
                            <img
                              key={`mobile-msg-img-${i}-${imgIdx}`}
                              src={`data:${img.mimeType};base64,${img.data}`}
                              alt={`Attachment ${imgIdx + 1}`}
                              className="h-10 w-10 rounded border border-zinc-600 object-cover"
                            />
                          ))}
                        </div>
                      )}
                    {msg.role === "user" &&
                      !msg.images &&
                      msg.imageCount &&
                      msg.imageCount > 0 && (
                        <div className="mb-1.5 inline-flex items-center gap-1 rounded bg-zinc-600/50 px-2 py-0.5 text-xs text-zinc-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          {msg.imageCount} image
                          {msg.imageCount > 1 ? "s" : ""} attached
                        </div>
                      )}
                    {msg.content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <div className="flex shrink-0 items-center justify-around border-t border-zinc-800 bg-zinc-900 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            mobileTab === "chat"
              ? "text-white"
              : "text-zinc-400 hover:text-white"
          }`}
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
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          <span className="text-xs">Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${
            mobileTab === "preview"
              ? "text-white"
              : "text-zinc-400 hover:text-white"
          }`}
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
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
          </svg>
          <span className="text-xs">Preview</span>
        </button>
      </div>
    </div>
  );
}
