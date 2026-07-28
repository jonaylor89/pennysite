import { Link } from "react-router";
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

export function ProjectViewer({ projectName, pages, conversation, deployedUrl }: Props) {
  const pageNames = Object.keys(pages);
  const [currentPage, setCurrentPage] = useState(
    pageNames.includes("index.html") ? "index.html" : pageNames[0] || "",
  );
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("preview");
  const displayHtml = pages[currentPage] || "";

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <header className="hidden shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 lg:flex">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold text-ink-900 hover:text-ink-900">Pennysite</Link>
          <span className="text-ink-400">·</span>
          <span className="text-lg font-semibold text-ink-900">{projectName}</span>
        </div>
        <div className="flex items-center gap-3">
          {deployedUrl && (
            <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover">View Live Site</a>
          )}
        </div>
      </header>

      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-ink-400 hover:text-ink-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <span className="max-w-[200px] truncate font-medium text-ink-900">{projectName}</span>
        </div>
        {deployedUrl && (
          <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-text hover:text-accent">View Live</a>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-row">
        <div className="hidden w-96 shrink-0 flex-col border-r border-border bg-surface lg:flex">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-ink-900">Conversation</h2>
          </div>
          <div className="border-b border-border bg-surface-2 px-4 py-2.5">
            <p className="text-xs text-ink-400">You're viewing a shared project</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {conversation.map((msg, i) => {
                if (msg.role === "enhance") {
                  return (
                    <div key={`enhance-${msg.skillId}-${i}`} className={`mr-4 rounded-lg border p-3 ${msg.status === "complete" ? "border-accent/30 bg-accent-light" : msg.status === "error" ? "border-error/30 bg-error/10" : "border-border bg-surface"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{msg.skillIcon}</span>
                        <div>
                          <span className="font-medium text-ink-900">{msg.skillName}</span>
                          <p className="text-xs text-ink-400">{msg.filename}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={`${msg.role}-${i}`} className={`text-sm ${msg.role === "user" ? "ml-4 rounded-lg bg-surface-2 p-3 text-ink-900" : "mr-4 rounded-lg bg-surface-2 p-3 text-ink-900"}`}>
                    {msg.content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`min-h-0 flex-1 flex-col ${mobileTab === "preview" ? "flex" : "hidden lg:flex"}`}>
          {pageNames.length > 1 && (
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-surface px-4 py-2">
              {pageNames.map((name) => (
                <button key={name} type="button" onClick={() => setCurrentPage(name)} className={`shrink-0 rounded px-3 py-1 text-sm transition-colors ${currentPage === name ? "bg-surface-2 text-ink-900" : "text-ink-400 hover:bg-surface-2 hover:text-ink-900"}`}>{name}</button>
              ))}
            </div>
          )}
          <div className="relative min-h-0 flex-1 bg-canvas">
            <div className="h-full w-full">
              {displayHtml ? (
                <iframe className="h-full w-full border-0 bg-white" title="Preview" sandbox="allow-scripts allow-same-origin" srcDoc={displayHtml} />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-ink-400">
                  <p>No preview available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-around border-t border-border bg-surface py-2 lg:hidden">
        <button type="button" onClick={() => setMobileTab("chat")} className={`flex flex-col items-center gap-1 px-4 py-2 ${mobileTab === "chat" ? "text-ink-900" : "text-ink-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
          <span className="text-xs">Chat</span>
        </button>
        <button type="button" onClick={() => setMobileTab("preview")} className={`flex flex-col items-center gap-1 px-4 py-2 ${mobileTab === "preview" ? "text-ink-900" : "text-ink-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /></svg>
          <span className="text-xs">Preview</span>
        </button>
      </div>
    </div>
  );
}
