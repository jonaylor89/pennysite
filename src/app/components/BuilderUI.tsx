"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { captureEvent } from "@/lib/posthog/client";
import { createClient } from "@/lib/supabase/client";
import { AutoExpandTextarea } from "./AutoExpandTextarea";
import { RatingModal } from "./RatingModal";

type MobileView = "chat" | "preview";

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

type CustomDomainInfo = {
  customDomain: string | null;
  status: "pending" | "active" | "error" | null;
  instructions: {
    type: string;
    host: string;
    target: string;
    instructions: string;
  } | null;
  customDomainUrl: string | null;
};

type BuilderUIProps = {
  projectId: string | null;
  initialName?: string;
  initialPages?: Pages;
  initialConversation?: Message[];
  initialPrompt?: string;
  initialDeployedUrl?: string | null;
  initialCfProjectName?: string | null;
  initialCustomDomain?: string | null;
  initialCustomDomainStatus?: "pending" | "active" | "error" | null;
};

type EditingElement = {
  selector: string;
  tagName: string;
  text: string;
  href?: string;
};

function injectNavigationScript(html: string): string {
  const script = `
<script>
(function() {
  // Generate a unique selector path for an element
  function getSelector(el) {
    if (el.id) return '#' + el.id;
    const parts = [];
    while (el && el.nodeType === 1) {
      let selector = el.tagName.toLowerCase();
      if (el.id) {
        parts.unshift('#' + el.id);
        break;
      }
      const siblings = el.parentNode ? Array.from(el.parentNode.children).filter(function(c) { return c.tagName === el.tagName; }) : [];
      if (siblings.length > 1) {
        const idx = siblings.indexOf(el) + 1;
        selector += ':nth-of-type(' + idx + ')';
      }
      parts.unshift(selector);
      el = el.parentNode;
    }
    return parts.join(' > ');
  }

  // Editable text elements
  const editableTags = ['H1','H2','H3','H4','H5','H6','P','SPAN','A','LI','BUTTON','LABEL'];

  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href')) {
      const href = link.getAttribute('href');
      // Always prevent default to stop any navigation in iframe
      e.preventDefault();
      // Handle internal page links
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        window.parent.postMessage({ type: 'navigate', href: href }, '*');
      }
      // For hash links, handle scroll within iframe
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Double-click to edit text/links
  document.addEventListener('dblclick', function(e) {
    const el = e.target;
    if (!el || !editableTags.includes(el.tagName)) return;
    e.preventDefault();
    const data = {
      type: 'edit-element',
      selector: getSelector(el),
      tagName: el.tagName,
      text: el.innerText || el.textContent || ''
    };
    if (el.tagName === 'A') {
      data.href = el.getAttribute('href') || '';
    }
    window.parent.postMessage(data, '*');
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

function CustomDomainModal({
  projectId,
  cfProjectName,
  existingDomain,
  onClose,
  onSuccess,
}: {
  projectId: string;
  cfProjectName: string;
  existingDomain: CustomDomainInfo | null;
  onClose: () => void;
  onSuccess: (info: CustomDomainInfo) => void;
}) {
  const [domain, setDomain] = useState(existingDomain?.customDomain || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainInfo, setDomainInfo] = useState<CustomDomainInfo | null>(
    existingDomain,
  );

  async function handleAddDomain() {
    if (!domain.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add domain");
        return;
      }

      const info: CustomDomainInfo = {
        customDomain: data.customDomain,
        status: data.status,
        instructions: data.instructions,
        customDomainUrl: data.customDomainUrl,
      };
      setDomainInfo(info);
      onSuccess(info);
    } catch {
      setError("Failed to add domain");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveDomain() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/domain`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to remove domain");
        return;
      }

      setDomainInfo(null);
      setDomain("");
      onSuccess({
        customDomain: null,
        status: null,
        instructions: null,
        customDomainUrl: null,
      });
    } catch {
      setError("Failed to remove domain");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckStatus() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/domain`);
      const data = await res.json();
      if (data.customDomain) {
        const info: CustomDomainInfo = {
          customDomain: data.customDomain,
          status: data.status,
          instructions: data.instructions,
          customDomainUrl: data.customDomainUrl,
        };
        setDomainInfo(info);
        onSuccess(info);
      }
    } catch {
      setError("Failed to check status");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Custom Domain</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {domainInfo?.customDomain ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {domainInfo.customDomain}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    domainInfo.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {domainInfo.status === "active" ? "Active" : "Pending"}
                </span>
              </div>

              {domainInfo.status === "active" && domainInfo.customDomainUrl && (
                <a
                  href={domainInfo.customDomainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-sm text-emerald-400 hover:underline"
                >
                  {domainInfo.customDomainUrl}
                </a>
              )}
            </div>

            {domainInfo.status === "pending" && domainInfo.instructions && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="mb-2 text-sm font-medium text-amber-200">
                  Configure your DNS:
                </p>
                <div className="space-y-2 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Type:</span>
                    <code className="rounded bg-zinc-800 px-2 py-0.5 text-amber-300">
                      {domainInfo.instructions.type}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Name:</span>
                    <code className="rounded bg-zinc-800 px-2 py-0.5 text-amber-300">
                      {domainInfo.instructions.host}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Target:</span>
                    <code className="rounded bg-zinc-800 px-2 py-0.5 text-amber-300">
                      {domainInfo.instructions.target}
                    </code>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-400">
                  {domainInfo.instructions.instructions}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {domainInfo.status === "pending" && (
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={isLoading}
                  className="flex-1 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
                >
                  {isLoading ? "Checking..." : "Check Status"}
                </button>
              )}
              <button
                type="button"
                onClick={handleRemoveDomain}
                disabled={isLoading}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="domain"
                className="mb-1 block text-sm text-zinc-400"
              >
                Enter your domain
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="blog.example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Your project will be accessible at https://
                {domain || "your-domain.com"}
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDomain}
                disabled={isLoading || !domain.trim()}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Domain"}
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              After adding, you&apos;ll need to configure a CNAME record with
              your DNS provider pointing to{" "}
              <code className="text-zinc-400">{cfProjectName}.pages.dev</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BuilderUI({
  projectId: initialProjectId,
  initialName = "Untitled",
  initialPages = {},
  initialConversation = [],
  initialPrompt,
  initialDeployedUrl,
  initialCfProjectName,
  initialCustomDomain,
  initialCustomDomainStatus,
}: BuilderUIProps) {
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
  const [projectId, setProjectId] = useState<string | null>(initialProjectId);
  const [projectName, setProjectName] = useState(initialName);
  const [messages, setMessages] = useState<Message[]>(initialConversation);
  const [input, setInput] = useState("");
  const [pages, setPages] = useState<Pages>(initialPages);
  const [currentPage, setCurrentPage] = useState("index.html");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(
    initialDeployedUrl ?? null,
  );
  const [cfProjectName, setCfProjectName] = useState<string | null>(
    initialCfProjectName ?? null,
  );
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [customDomainInfo, setCustomDomainInfo] =
    useState<CustomDomainInfo | null>(
      initialCustomDomain
        ? {
            customDomain: initialCustomDomain,
            status: initialCustomDomainStatus ?? null,
            instructions: null,
            customDomainUrl: `https://${initialCustomDomain}`,
          }
        : null,
    );
  const [siteSpec, setSiteSpec] = useState<SiteSpec | null>(null);
  const [generationPhase, setGenerationPhase] = useState<string>("");
  const [_pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [liveUsage, setLiveUsage] = useState<{
    inputTokens: number;
    outputTokens: number;
    estimatedCredits: number;
  } | null>(null);

  // Analytics state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRatedFirstGen, setHasRatedFirstGen] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const firstGenTimeRef = useRef<number | null>(null);
  const hasTrackedFirstGenRef = useRef(false);

  // Mobile responsive state
  const [mobileView, setMobileView] = useState<MobileView>("chat");

  // Click-to-edit state
  const [editingElement, setEditingElement] = useState<EditingElement | null>(
    null,
  );
  const [editText, setEditText] = useState("");
  const [editHref, setEditHref] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didAutoSendRef = useRef(false);
  const router = useRouter();
  const supabase = createClient();

  const pageNames = Object.keys(pages);
  const currentHtml = pages[currentPage] || "";
  const displayHtml = currentHtml ? injectNavigationScript(currentHtml) : "";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthChecked(true);
    });
  }, [supabase.auth]);

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
      if (e.data?.type === "edit-element" && e.data.selector) {
        setEditingElement({
          selector: e.data.selector,
          tagName: e.data.tagName,
          text: e.data.text,
          href: e.data.href,
        });
        setEditText(e.data.text);
        setEditHref(e.data.href || "");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pages]);

  function applyElementEdit() {
    if (!editingElement) return;
    const html = pages[currentPage];
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const el = doc.querySelector(editingElement.selector);
    if (!el) {
      setEditingElement(null);
      return;
    }

    el.textContent = editText;
    if (editingElement.tagName === "A" && editHref) {
      el.setAttribute("href", editHref);
    }

    const serializer = new XMLSerializer();
    const newHtml =
      "<!DOCTYPE html>\n" + serializer.serializeToString(doc.documentElement);
    setPages((prev) => ({ ...prev, [currentPage]: newHtml }));
    setEditingElement(null);
  }

  async function createProjectAndRedirect(
    name: string,
    generatedPages: Pages,
    conversation: Message[],
    generationId?: string | null,
  ): Promise<string | null> {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pages: generatedPages, conversation }),
    });
    const data = await res.json();
    if (data.project) {
      setProjectId(data.project.id);
      router.replace(`/project/${data.project.id}`);

      // Link the generation to the newly created project
      if (generationId) {
        fetch(`/api/generations/${generationId}/link-project`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: data.project.id }),
        }).catch(console.error);
      }

      return data.project.id;
    }
    return null;
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isGenerating) return;

    if (!user) {
      const returnUrl = encodeURIComponent(
        `/project/new?prompt=${encodeURIComponent(text.trim())}`,
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
          projectId: projectId ?? undefined,
        }),
      });

      if (response.status === 402) {
        const data = await response.json();
        if (data.error === "INSUFFICIENT_CREDITS") {
          setInsufficientCreditsInfo({
            available: data.availableCredits || 0,
            required: data.requiredCredits || 150,
          });
          setPendingPrompt(text.trim());
          setShowBuyCredits(true);
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
      let finalPages: Pages = { ...pages };
      let _finalSpec: SiteSpec | null = siteSpec;
      let finalName = projectName;
      let currentGenerationId: string | null = null;

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
              case "generation_id":
                currentGenerationId = event.generationId;
                break;

              case "status":
                setGenerationPhase(event.message);
                break;

              case "spec":
                setSiteSpec(event.spec);
                _finalSpec = event.spec;
                if (event.spec.name && event.spec.name !== "Website") {
                  setProjectName(event.spec.name);
                  finalName = event.spec.name;
                }
                break;

              case "page":
                if (
                  event.html &&
                  typeof event.html === "string" &&
                  event.html.toLowerCase().includes("<!doctype")
                ) {
                  setPages((prev) => {
                    const updated = { ...prev, [event.filename]: event.html };
                    finalPages = updated;
                    return updated;
                  });
                  if (event.filename === "index.html") {
                    setCurrentPage("index.html");
                  }
                }
                break;

              case "usage":
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
                    finalPages = validPages;
                  }
                }
                if (event.spec) {
                  setSiteSpec(event.spec);
                  _finalSpec = event.spec;
                  if (event.spec.name && event.spec.name !== "Website") {
                    setProjectName(event.spec.name);
                    finalName = event.spec.name;
                  }
                }
                setLiveUsage(null);
                fetch("/api/credits/balance")
                  .then((res) => res.json())
                  .then((data) => {
                    if (!data.error) setCreditBalance(data);
                  });

                // Track first generation complete and show rating modal
                if (!hasTrackedFirstGenRef.current) {
                  hasTrackedFirstGenRef.current = true;
                  firstGenTimeRef.current = Date.now();
                  const timeToFirstGen =
                    Date.now() - sessionStartTimeRef.current;
                  captureEvent("first_generation_complete", {
                    project_id: projectId,
                    time_to_first_gen_ms: timeToFirstGen,
                    total_pages: Object.keys(finalPages).length,
                  });
                  // Show rating modal after first generation
                  if (!hasRatedFirstGen) {
                    setTimeout(() => setShowRatingModal(true), 1500);
                  }
                } else {
                  // Track regeneration
                  setRegenerationCount((prev) => {
                    const newCount = prev + 1;
                    const secondsSinceFirst = firstGenTimeRef.current
                      ? (Date.now() - firstGenTimeRef.current) / 1000
                      : 0;
                    captureEvent("regeneration_requested", {
                      project_id: projectId,
                      regeneration_count: newCount,
                      seconds_since_first_gen: secondsSinceFirst,
                    });
                    return newCount;
                  });
                }
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

      const finalMessages = [
        ...newMessages,
        { role: "assistant" as const, content: "Updated the website." },
      ];
      setMessages(finalMessages);
      setGenerationPhase("");

      // If this is a new project (no projectId), create it now
      if (!projectId && Object.keys(finalPages).length > 0) {
        await createProjectAndRedirect(
          finalName,
          finalPages,
          finalMessages,
          currentGenerationId,
        );
      } else if (projectId) {
        // Auto-save existing project
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: finalName,
            pages: finalPages,
            conversation: finalMessages,
          }),
        });
      }
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
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectName,
            pages,
            conversation: messages,
          }),
        });
        setSaveStatus("Saved!");
      } else {
        await createProjectAndRedirect(projectName, pages, messages);
        setSaveStatus("Saved!");
      }

      // Track save event
      const isFirstGen = regenerationCount === 0;
      const secondsSinceFirst = firstGenTimeRef.current
        ? (Date.now() - firstGenTimeRef.current) / 1000
        : 0;
      captureEvent("project_saved", {
        project_id: projectId,
        is_first_gen: isFirstGen,
        seconds_since_first_gen: secondsSinceFirst,
        total_pages: Object.keys(pages).length,
      });
    } catch {
      setSaveStatus("Save failed");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }

  async function handlePublish() {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!projectId || Object.keys(pages).length === 0) return;

    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.deployedUrl) {
        setDeployedUrl(data.deployedUrl);
        if (data.cfProjectName) {
          setCfProjectName(data.cfProjectName);
        }
        setPublishStatus("Published!");

        // Track time to publish
        const timeToPublish = Date.now() - sessionStartTimeRef.current;
        captureEvent("time_to_publish", {
          project_id: projectId,
          time_to_publish_ms: timeToPublish,
          regeneration_count: regenerationCount,
          total_pages: Object.keys(pages).length,
        });
      } else {
        setPublishStatus(data.error || "Publish failed");
      }
    } catch {
      setPublishStatus("Publish failed");
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishStatus(null), 3000);
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once to bootstrap from initial prompt
  useEffect(() => {
    if (didAutoSendRef.current) return;
    if (!authChecked) return;
    if (!initialPrompt) {
      didAutoSendRef.current = true;
      return;
    }

    didAutoSendRef.current = true;
    sendMessage(initialPrompt);
  }, [authChecked, initialPrompt]);

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

  const handleRatingSubmit = useCallback(
    (rating: number) => {
      setHasRatedFirstGen(true);
      const isFirstGen = regenerationCount === 0;
      const secondsSinceFirst = firstGenTimeRef.current
        ? (Date.now() - firstGenTimeRef.current) / 1000
        : 0;
      captureEvent("draft_rated", {
        project_id: projectId,
        rating,
        is_first_gen: isFirstGen,
        seconds_since_first_gen: secondsSinceFirst,
      });
    },
    [projectId, regenerationCount],
  );

  return (
    <div className="flex h-screen flex-col bg-zinc-950 lg:flex-row">
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

      {/* Custom Domain Modal */}
      {showDomainModal && projectId && cfProjectName && (
        <CustomDomainModal
          projectId={projectId}
          cfProjectName={cfProjectName}
          existingDomain={customDomainInfo}
          onClose={() => setShowDomainModal(false)}
          onSuccess={(info) => {
            setCustomDomainInfo(info);
          }}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          projectId={projectId}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}

      {/* Click-to-Edit Modal */}
      {editingElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Edit {editingElement.tagName.toLowerCase()}
            </h3>
            <label className="mb-1 block text-sm text-zinc-400">Text</label>
            <textarea
              className="mb-4 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            {editingElement.tagName === "A" && (
              <>
                <label className="mb-1 block text-sm text-zinc-400">
                  Link URL
                </label>
                <input
                  type="text"
                  className="mb-4 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  value={editHref}
                  onChange={(e) => setEditHref(e.target.value)}
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingElement(null)}
                className="rounded bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyElementEdit}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile View Toggle */}
      <div className="flex shrink-0 border-b border-zinc-800 bg-zinc-900 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView("chat")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            mobileView === "chat"
              ? "border-b-2 border-white text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Chat
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            mobileView === "preview"
              ? "border-b-2 border-white text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Preview
            {isGenerating && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            )}
          </span>
        </button>
      </div>

      {/* Left Panel - Chat */}
      <div
        className={`flex min-h-0 flex-1 flex-col border-r border-zinc-800 bg-zinc-900 lg:w-96 lg:flex-none ${
          mobileView === "chat" ? "flex" : "hidden lg:flex"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <Link
              href="/"
              className="text-base font-semibold text-white sm:text-lg"
            >
              Pennysite
            </Link>
            <p className="hidden text-sm text-zinc-400 sm:block">
              Chat with your website
            </p>
          </div>
          <div className="shrink-0 text-right">
            {user ? (
              <div className="flex flex-col items-end gap-1">
                {creditBalance && (
                  <div className="flex flex-col items-end gap-0.5">
                    <Link
                      href="/billing"
                      className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-600"
                    >
                      <span className="text-emerald-400">⚡</span>
                      <span className="hidden xs:inline">
                        {creditBalance.availableCredits} credits
                      </span>
                      <span className="xs:hidden">
                        {creditBalance.availableCredits}
                      </span>
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
          <div className="border-b border-zinc-800 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-zinc-200 focus:outline-none"
                placeholder="Project name..."
              />
              {projectId && (
                <Link
                  href={`/project/${projectId}/settings`}
                  className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  title="Project settings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
              )}
            </div>
            {siteSpec && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {siteSpec.type}
                </span>
                <span className="hidden text-xs text-zinc-500 sm:inline">
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {messages.length === 0 ? (
            <div className="text-sm text-zinc-500">
              <p className="mb-3 text-xs sm:text-sm">
                Describe the website you want to create:
              </p>
              <div className="space-y-2 text-xs">
                <p className="rounded bg-zinc-800 p-2">
                  "A landing page for a developer tools startup with features,
                  pricing, and documentation"
                </p>
                <p className="hidden rounded bg-zinc-800 p-2 sm:block">
                  "Personal site for an executive coach with about, services,
                  and booking page"
                </p>
                <p className="rounded bg-zinc-800 p-2">
                  "A consulting agency website with case studies and contact
                  form"
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
            <div className="space-y-2 sm:space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`text-xs sm:text-sm ${
                    msg.role === "user"
                      ? "ml-2 rounded-lg bg-zinc-700 p-2 text-white sm:ml-4 sm:p-3"
                      : "mr-2 rounded-lg bg-zinc-800 p-2 text-zinc-300 sm:mr-4 sm:p-3"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isGenerating && (
                <div className="mr-2 rounded-lg bg-zinc-800 p-2 text-xs text-zinc-400 sm:mr-4 sm:p-3 sm:text-sm">
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
        <div className="border-t border-zinc-800 p-3 sm:p-4">
          {error && <div className="mb-2 text-xs text-red-400">{error}</div>}
          <div className="flex flex-col gap-2">
            <AutoExpandTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.length === 0
                  ? "Describe your website..."
                  : "Ask for changes..."
              }
              rows={1}
              maxHeight={120}
              className="max-h-30 min-h-[38px] w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none sm:max-h-40"
              disabled={isGenerating}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isGenerating || !input.trim()}
              className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Send"}
            </button>
          </div>
        </div>

        {/* Actions */}
        {pageNames.length > 0 && (
          <div className="border-t border-zinc-800 p-3 sm:p-4">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-white px-2 py-2 text-xs font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50 sm:px-3 sm:text-sm"
                >
                  {isSaving ? "Saving..." : saveStatus || "Save"}
                </button>
                <button
                  type="button"
                  onClick={downloadAll}
                  className="rounded-lg border border-zinc-700 px-2 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 sm:px-3 sm:text-sm"
                >
                  Download
                </button>
              </div>
              {projectId && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 sm:text-sm"
                >
                  {isPublishing
                    ? "Publishing..."
                    : publishStatus || "Publish to Web"}
                </button>
              )}
              {deployedUrl && (
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-lg border border-emerald-700 bg-emerald-900/30 px-2 py-2 text-xs text-emerald-300 transition-colors hover:bg-emerald-900/50 sm:px-3 sm:text-sm"
                >
                  <span>🌐</span>
                  <span className="max-w-[180px] truncate sm:max-w-none">
                    {deployedUrl}
                  </span>
                </a>
              )}
              {/* Custom Domain */}
              {deployedUrl && cfProjectName && (
                <button
                  type="button"
                  onClick={() => setShowDomainModal(true)}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors sm:px-3 sm:text-sm ${
                    customDomainInfo?.status === "active"
                      ? "border-purple-700 bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                      : customDomainInfo?.customDomain
                        ? "border-amber-700 bg-amber-900/30 text-amber-300 hover:bg-amber-900/50"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <span>🔗</span>
                  {customDomainInfo?.customDomain ? (
                    <span className="max-w-[150px] truncate sm:max-w-none">
                      {customDomainInfo.customDomain}
                      {customDomainInfo.status === "pending" && " (pending)"}
                    </span>
                  ) : (
                    <span>Custom Domain</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          mobileView === "preview" ? "flex" : "hidden lg:flex"
        }`}
      >
        {/* Page tabs */}
        {pageNames.length > 1 && (
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-900 px-3 py-2 sm:px-4">
            {pageNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCurrentPage(name)}
                className={`shrink-0 rounded px-2 py-1 text-xs transition-colors sm:px-3 sm:text-sm ${
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

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 sm:text-sm">
              Preview{currentPage ? `: ${currentPage}` : ""}
            </span>
            {displayHtml && (
              <span className="hidden text-xs text-zinc-500 sm:inline">
                (double-click text to edit)
              </span>
            )}
          </div>
          {isGenerating && (
            <span className="flex items-center gap-2 text-xs text-zinc-500 sm:text-sm">
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
            <div className="flex h-full items-center justify-center bg-zinc-950 p-4 text-zinc-400">
              <div className="text-center">
                <div className="mb-2 text-4xl">🏗️</div>
                <p className="text-sm sm:text-base">
                  Your website will appear here
                </p>
                <p className="mt-2 hidden text-xs text-zinc-500 sm:block">
                  Describe your website in the chat to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
