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

type SiteSpec = {
  name: string;
  tagline: string;
  type: string;
  industry: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

type CreditBalance = {
  availableCredits: number;
  reservedCredits: number;
  generationCost: {
    min: number;
    typical: number;
    max: number;
  };
};

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

function BuyCreditsModal({
  onClose,
  availableCredits,
  requiredCredits,
}: {
  onClose: () => void;
  availableCredits: number;
  requiredCredits: number;
}) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const packs = [
    { id: "starter", name: "Starter", credits: 50, price: 5 },
    { id: "basic", name: "Basic", credits: 220, price: 20, popular: true },
    { id: "pro", name: "Pro", credits: 600, price: 50 },
    { id: "max", name: "Max", credits: 1300, price: 100 },
  ];

  async function buyPack(packId: string) {
    setIsLoading(packId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setIsLoading(null);
      }
    } catch {
      alert("Failed to start checkout");
      setIsLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">⚡</div>
          <h2 className="text-xl font-semibold text-white">
            You need credits to generate
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            You have{" "}
            <span className="font-medium text-white">{availableCredits}</span>{" "}
            credits, but generation requires up to{" "}
            <span className="font-medium text-white">{requiredCredits}</span>.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Typical generation costs ~47 credits. Unused credits are refunded.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {packs.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => buyPack(pack.id)}
              disabled={isLoading !== null}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                pack.popular
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
              } ${isLoading === pack.id ? "opacity-70" : ""}`}
            >
              {pack.popular && (
                <span className="absolute -top-2 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-black">
                  Popular
                </span>
              )}
              <div className="text-lg font-semibold text-white">
                {pack.credits} credits
              </div>
              <div className="text-2xl font-bold text-white">${pack.price}</div>
              <div className="mt-1 text-xs text-zinc-400">
                ${((pack.price / pack.credits) * 100).toFixed(1)}¢ per credit
              </div>
              {isLoading === pack.id && (
                <div className="mt-2 text-xs text-zinc-400">Redirecting...</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function BuilderContent() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(
    null,
  );
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [insufficientCreditsInfo, setInsufficientCreditsInfo] = useState<{
    available: number;
    required: number;
  } | null>(null);
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
  const [siteSpec, setSiteSpec] = useState<SiteSpec | null>(null);
  const [generationPhase, setGenerationPhase] = useState<string>("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [liveUsage, setLiveUsage] = useState<{
    inputTokens: number;
    outputTokens: number;
    estimatedCredits: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didAutoSendRef = useRef(false);
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
      setAuthChecked(true);
    });
  }, [supabase.auth]);

  // Fetch credit balance when user is loaded
  useEffect(() => {
    if (user) {
      fetch("/api/credits/balance")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setCreditBalance(data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

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

  // Refresh balance after returning from Stripe
  // biome-ignore lint/correctness/useExhaustiveDependencies: sendMessage is stable, we want to trigger on pendingPrompt change
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true" && user) {
      fetch("/api/credits/balance")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setCreditBalance(data);
            // If we had a pending prompt, try again
            if (pendingPrompt) {
              const prompt = pendingPrompt;
              setPendingPrompt(null);
              sendMessage(prompt);
            }
          }
        });
      // Clean URL
      router.replace("/builder");
    }
  }, [searchParams, user, router, pendingPrompt]);

  async function sendMessage(text: string) {
    if (!text.trim() || isGenerating) return;

    if (!user) {
      const returnUrl = encodeURIComponent(
        `/builder?prompt=${encodeURIComponent(text.trim())}`,
      );
      router.push(`/auth/login?redirect=${returnUrl}`);
      return;
    }

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);
    setError(null);
    setLiveUsage(null);

    try {
      setGenerationPhase("Starting...");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          currentPages: Object.keys(pages).length > 0 ? pages : undefined,
          existingSpec: siteSpec,
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      // Handle insufficient credits
      if (response.status === 402) {
        const data = await response.json();
        if (data.error === "INSUFFICIENT_CREDITS") {
          setInsufficientCreditsInfo({
            available: data.availableCredits || 0,
            required: data.requiredCredits || 150,
          });
          setPendingPrompt(text.trim());
          setShowBuyCredits(true);
          // Remove the user message since we didn't actually generate
          setMessages(messages);
          setIsGenerating(false);
          setGenerationPhase("");
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || !line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case "status":
                setGenerationPhase(event.message);
                break;

              case "spec":
                setSiteSpec(event.spec);
                if (event.spec.name && event.spec.name !== "Website") {
                  setProjectName(event.spec.name);
                }
                break;

              case "page":
                if (
                  event.html &&
                  typeof event.html === "string" &&
                  event.html.toLowerCase().includes("<!doctype")
                ) {
                  setPages((prev) => ({
                    ...prev,
                    [event.filename]: event.html,
                  }));
                  if (event.filename === "index.html") {
                    setCurrentPage("index.html");
                  }
                }
                break;

              case "usage":
                // Real-time token usage update
                if (event.usage) {
                  const base = 5;
                  const inputCost = event.usage.inputTokens * 0.001;
                  const outputCost = event.usage.outputTokens * 0.005;
                  const estimated = Math.ceil(base + inputCost + outputCost);
                  setLiveUsage({
                    inputTokens: event.usage.inputTokens,
                    outputTokens: event.usage.outputTokens,
                    estimatedCredits: estimated,
                  });
                }
                break;

              case "complete":
                if (event.pages && typeof event.pages === "object") {
                  const validPages: Record<string, string> = {};
                  for (const [filename, html] of Object.entries(event.pages)) {
                    if (
                      typeof html === "string" &&
                      html.toLowerCase().includes("<!doctype")
                    ) {
                      validPages[filename] = html;
                    }
                  }
                  if (Object.keys(validPages).length > 0) {
                    setPages(validPages);
                  }
                }
                if (event.spec) {
                  setSiteSpec(event.spec);
                  if (event.spec.name && event.spec.name !== "Website") {
                    setProjectName(event.spec.name);
                  }
                }
                // Clear live usage and refresh actual balance
                setLiveUsage(null);
                fetch("/api/credits/balance")
                  .then((res) => res.json())
                  .then((data) => {
                    if (!data.error) setCreditBalance(data);
                  });
                break;

              case "error":
                setError(event.error);
                setLiveUsage(null);
                break;
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: "Updated the website." },
      ]);
      setGenerationPhase("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSend() {
    await sendMessage(input);
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
    setCreditBalance(null);
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once to bootstrap from URL prompt after auth check
  useEffect(() => {
    if (didAutoSendRef.current) return;
    if (!authChecked) return;

    const project = searchParams.get("project");
    if (project) {
      didAutoSendRef.current = true;
      return;
    }

    // Don't auto-send if returning from Stripe
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success || canceled) {
      didAutoSendRef.current = true;
      return;
    }

    const prompt = searchParams.get("prompt")?.trim();
    if (!prompt) {
      didAutoSendRef.current = true;
      return;
    }

    didAutoSendRef.current = true;
    router.replace("/builder");
    sendMessage(prompt);
  }, [searchParams, router, authChecked]);

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
      {/* Buy Credits Modal */}
      {showBuyCredits && insufficientCreditsInfo && (
        <BuyCreditsModal
          onClose={() => {
            setShowBuyCredits(false);
            setInsufficientCreditsInfo(null);
          }}
          availableCredits={insufficientCreditsInfo.available}
          requiredCredits={insufficientCreditsInfo.required}
        />
      )}

      {/* Left Panel - Chat */}
      <div className="flex w-96 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <div>
            <Link href="/" className="text-lg font-semibold text-white">
              Pennysite
            </Link>
            <p className="text-sm text-zinc-400">Chat with your website</p>
          </div>
          <div className="text-right">
            {user ? (
              <div className="flex flex-col items-end gap-1">
                {creditBalance && (
                  <div className="flex flex-col items-end gap-0.5">
                    <Link
                      href="/billing"
                      className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-600"
                    >
                      <span className="text-emerald-400">⚡</span>
                      {creditBalance.availableCredits} credits
                    </Link>
                    {isGenerating && liveUsage && (
                      <span className="text-xs text-amber-400">
                        ~{liveUsage.estimatedCredits} used
                      </span>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Sign out
                </button>
              </div>
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

        {/* Project name & spec */}
        {pageNames.length > 0 && (
          <div className="border-b border-zinc-800 px-4 py-3">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-zinc-200 focus:outline-none"
              placeholder="Project name..."
            />
            {siteSpec && (
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {siteSpec.type}
                </span>
                <span className="text-xs text-zinc-500">
                  {siteSpec.industry}
                </span>
                <div className="ml-auto flex gap-1">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: siteSpec.colorPalette.primary }}
                    title="Primary"
                  />
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: siteSpec.colorPalette.secondary }}
                    title="Secondary"
                  />
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: siteSpec.colorPalette.accent }}
                    title="Accent"
                  />
                </div>
              </div>
            )}
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
              {user &&
                creditBalance &&
                creditBalance.availableCredits < 150 && (
                  <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs text-amber-200">
                      You have {creditBalance.availableCredits} credits. Buy
                      more to start generating.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setInsufficientCreditsInfo({
                          available: creditBalance.availableCredits,
                          required: 150,
                        });
                        setShowBuyCredits(true);
                      }}
                      className="mt-2 rounded bg-amber-500 px-3 py-1 text-xs font-medium text-black hover:bg-amber-400"
                    >
                      Buy Credits
                    </button>
                  </div>
                )}
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
                    {generationPhase || "Generating..."}
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
