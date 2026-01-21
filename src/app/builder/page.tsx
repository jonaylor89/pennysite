"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Pages = Record<string, string>;

function parsePages(raw: string): Pages {
  const pages: Pages = {};

  const filePattern = /---\s*FILE:\s*([^\s-]+)\s*---/gi;
  const matches = [...raw.matchAll(filePattern)];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const filename = match[1];
      const startIndex = (match.index ?? 0) + match[0].length;
      const endIndex = matches[i + 1]?.index ?? raw.length;
      let content = raw.slice(startIndex, endIndex).trim();

      if (content.startsWith("```html")) {
        content = content.slice(7);
      } else if (content.startsWith("```")) {
        content = content.slice(3);
      }
      if (content.endsWith("```")) {
        content = content.slice(0, -3);
      }
      content = content.trim();

      if (filename && content) {
        pages[filename] = content;
      }
    }
  }

  if (Object.keys(pages).length === 0 && raw.includes("<!DOCTYPE")) {
    let content = raw.trim();
    if (content.startsWith("```html")) content = content.slice(7);
    else if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);
    pages["index.html"] = content.trim();
  }

  return pages;
}

function injectNavigationScript(html: string): string {
  const script = `
<script>
(function() {
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        e.preventDefault();
        window.parent.postMessage({ type: 'navigate', href: href }, '*');
      }
    }
  });
})();
</script>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${script}</head>`);
  } else if (html.includes("<body")) {
    return html.replace("<body", `${script}<body`);
  }
  return script + html;
}

function BuilderContent() {
  const [user, setUser] = useState<User | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Untitled");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pages, setPages] = useState<Pages>({});
  const [currentPage, setCurrentPage] = useState("index.html");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const pageNames = Object.keys(pages);
  const currentHtml = pages[currentPage] || "";
  const displayHtml = currentHtml ? injectNavigationScript(currentHtml) : "";

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  // Load project if ID in URL
  useEffect(() => {
    const id = searchParams.get("project");
    if (id && user) {
      setProjectId(id);
      fetch(`/api/projects/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.project) {
            setProjectName(data.project.name);
            setPages(data.project.pages as Pages);
          }
        });
    }
  }, [searchParams, user]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "navigate" && e.data.href) {
        const href = e.data.href
          .replace(/^\.?\//, "")
          .split("?")[0]
          .split("#")[0];
        if (pages[href]) {
          setCurrentPage(href);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pages]);

  async function handleSend() {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          currentPages: Object.keys(pages).length > 0 ? pages : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        const parsed = parsePages(accumulated);
        if (Object.keys(parsed).length > 0) {
          setPages(parsed);
          if (!parsed[currentPage] && parsed["index.html"]) {
            setCurrentPage("index.html");
          }
        }
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: "Updated the website." },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (Object.keys(pages).length === 0) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (projectId) {
        // Update existing
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName, pages }),
        });
        setSaveStatus("Saved!");
      } else {
        // Create new
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: projectName, pages }),
        });
        const data = await res.json();
        if (data.project) {
          setProjectId(data.project.id);
          router.push(`/builder?project=${data.project.id}`);
          setSaveStatus("Saved!");
        }
      }
    } catch {
      setSaveStatus("Save failed");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function downloadAll() {
    for (const [filename, content] of Object.entries(pages)) {
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Left Panel - Chat */}
      <div className="flex w-96 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <div>
            <h1 className="text-lg font-semibold text-white">Pennysite</h1>
            <p className="text-sm text-zinc-400">Chat with your website</p>
          </div>
          <div className="text-right">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="text-xs text-zinc-400 hover:text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Project name */}
        {pageNames.length > 0 && (
          <div className="border-b border-zinc-800 px-4 py-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-300 focus:outline-none"
              placeholder="Project name..."
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-sm text-zinc-500">
              <p className="mb-3">Describe the website you want to create:</p>
              <div className="space-y-2 text-xs">
                <p className="rounded bg-zinc-800 p-2">
                  "A 3-page website for a Brooklyn coffee shop: home, menu, and
                  contact"
                </p>
                <p className="rounded bg-zinc-800 p-2">
                  "Portfolio site for a photographer with home, gallery, and
                  about pages"
                </p>
                <p className="rounded bg-zinc-800 p-2">
                  "Simple landing page for a SaaS product"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`text-sm ${
                    msg.role === "user"
                      ? "ml-4 rounded-lg bg-zinc-700 p-3 text-white"
                      : "mr-4 rounded-lg bg-zinc-800 p-3 text-zinc-300"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isGenerating && (
                <div className="mr-4 rounded-lg bg-zinc-800 p-3 text-sm text-zinc-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    Generating...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-4">
          {error && <div className="mb-2 text-xs text-red-400">{error}</div>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.length === 0
                  ? "Describe your website..."
                  : "Ask for changes..."
              }
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              disabled={isGenerating}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isGenerating || !input.trim()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

        {/* Actions */}
        {pageNames.length > 0 && (
          <div className="border-t border-zinc-800 p-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : saveStatus || "Save Project"}
              </button>
              <button
                type="button"
                onClick={downloadAll}
                className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Page tabs */}
        {pageNames.length > 1 && (
          <div className="flex shrink-0 gap-1 border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            {pageNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCurrentPage(name)}
                className={`rounded px-3 py-1 text-sm transition-colors ${
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

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="text-sm text-zinc-400">
            Preview{currentPage ? `: ${currentPage}` : ""}
          </span>
          {isGenerating && (
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Streaming...
            </span>
          )}
        </div>

        <div className="relative min-h-0 flex-1 bg-white">
          {displayHtml ? (
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={displayHtml}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <div className="text-center">
                <div className="mb-2 text-4xl">🏗️</div>
                <p>Your website will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Builder() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          Loading...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
