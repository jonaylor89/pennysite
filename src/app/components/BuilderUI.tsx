"use client";

import type { User } from "@supabase/supabase-js";
import { CircleUserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useFeatureFlag } from "@/lib/featureflags";
import { getAllSkills, getSkill, type SkillId } from "@/lib/generation/skills";
import { captureEvent } from "@/lib/posthog/client";
import { createClient } from "@/lib/supabase/client";
import { type ActivityItem, AgentActivityLog } from "./AgentActivityLog";
import { AutoExpandTextarea } from "./AutoExpandTextarea";
import { GuestCheckoutModal } from "./GuestCheckoutModal";
import { RatingModal } from "./RatingModal";
import { SetPasswordModal } from "./SetPasswordModal";

type ViewportSize = "desktop" | "tablet" | "mobile";

type ImageAttachment = { data: string; mimeType: string };

type Message =
  | {
      role: "user" | "assistant";
      content: string;
      images?: ImageAttachment[];
      imageCount?: number;
    }
  | {
      role: "enhance";
      skillId: SkillId;
      skillName: string;
      skillIcon: string;
      filename: string;
      status: "pending" | "complete" | "error";
      error?: string;
      creditsUsed?: number;
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
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  bgImage?: string;
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
  const editableTags = ['H1','H2','H3','H4','H5','H6','P','SPAN','A','LI','BUTTON','LABEL', 'IMG'];

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

  // Double-click to edit text/links/images
  document.addEventListener('dblclick', function(e) {
    let el = e.target;
    if (!el) return;

    // Check if it's a direct editable tag or an image
    let editableEl = el.closest(editableTags.join(','));
    
    // Also check if el or any ancestor has a background image
    let bgEl = el;
    while (bgEl && bgEl !== document.body) {
      const style = window.getComputedStyle(bgEl);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        break;
      }
      bgEl = bgEl.parentElement;
    }
    if (bgEl === document.body) bgEl = null;

    if (!editableEl && !bgEl) return;

    e.preventDefault();
    
    // We favor the editable element (text/img) if it exists, otherwise the background element
    const target = editableEl || bgEl;
    if (!target) return;

    const data = {
      type: 'edit-element',
      selector: getSelector(target),
      tagName: target.tagName,
    };

    if (target.tagName === 'IMG') {
      data.src = target.getAttribute('src') || '';
      data.alt = target.getAttribute('alt') || '';
    } else {
      data.text = target.innerText || target.textContent || '';
      if (target.tagName === 'A') {
        data.href = target.getAttribute('href') || '';
      }
      
      const style = window.getComputedStyle(target);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        // Extract URL from background-image: url("...")
        const urlMatch = style.backgroundImage.match(/url(["']?([^"']+)["']?)/);
        if (urlMatch) {
          data.bgImage = urlMatch[1];
        }
      }
    }
    
    window.parent.postMessage(data, '*');
  });

  // Handle broken images on load
  function handleBrokenImages() {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.hasErrorListener) return;
      img.dataset.hasErrorListener = 'true';
      img.addEventListener('error', function() {
        if (this.src.includes('placehold.co')) return;
        this.src = 'https://placehold.co/600x400?text=' + encodeURIComponent(this.alt || 'Image Placeholder');
      });
      // If already broken
      if (img.naturalWidth === 0 && img.src) {
        img.dispatchEvent(new Event('error'));
      }
    });
  }

  // Run on load and whenever DOM might change
  handleBrokenImages();
  const observer = new MutationObserver(handleBrokenImages);
  observer.observe(document.body, { childList: true, subtree: true });
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
    { id: "starter", name: "Starter", credits: 100, price: 5 },
    { id: "basic", name: "Basic", credits: 440, price: 20, popular: true },
    { id: "pro", name: "Pro", credits: 1200, price: 50 },
    { id: "max", name: "Max", credits: 2600, price: 100 },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">⚡</div>
          <h2 className="font-serif text-xl text-ink-900">
            You need credits to generate
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            You have{" "}
            <span className="font-medium text-ink-900">{availableCredits}</span>{" "}
            credits, but generation requires up to{" "}
            <span className="font-medium text-ink-900">{requiredCredits}</span>.
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Typical generation costs ~100 credits. Unused credits are refunded.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {packs.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => buyPack(pack.id)}
              disabled={isLoading !== null}
              className={`relative rounded-2xl border p-4 text-left transition-all ${
                pack.popular
                  ? "border-accent/50 bg-accent-light"
                  : "border-border-strong bg-surface hover:border-fg-subtle"
              } ${isLoading === pack.id ? "opacity-70" : ""}`}
            >
              {pack.popular && (
                <span className="absolute -top-2 right-3 rounded-full bg-accent-hover px-2 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <div className="text-lg font-semibold text-ink-900">
                {pack.credits} credits
              </div>
              <div className="text-2xl font-bold text-ink-900">
                ${pack.price}
              </div>
              <div className="mt-1 text-xs text-ink-600">
                ${((pack.price / pack.credits) * 100).toFixed(1)}¢ per credit
              </div>
              {isLoading === pack.id && (
                <div className="mt-2 text-xs text-ink-600">Redirecting...</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink-600 hover:text-ink-900"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Custom Domain</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-600 hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        {domainInfo?.customDomain ? (
          <div className="space-y-4">
            <div className="rounded-md border border-border-strong bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-900">
                  {domainInfo.customDomain}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    domainInfo.status === "active"
                      ? "bg-accent-light text-accent-text"
                      : "bg-gold-light text-gold-text"
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
                  className="mt-2 block text-sm text-accent-text hover:underline"
                >
                  {domainInfo.customDomainUrl}
                </a>
              )}
            </div>

            {domainInfo.status === "pending" && domainInfo.instructions && (
              <div className="rounded-md border border-gold/30 bg-gold-light p-4">
                <p className="mb-2 text-sm font-medium text-gold-text">
                  Configure your DNS:
                </p>
                <div className="space-y-2 text-sm text-ink-900">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-400">Type:</span>
                    <code className="rounded bg-surface-2 px-2 py-0.5 text-gold-text">
                      {domainInfo.instructions.type}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-400">Name:</span>
                    <code className="rounded bg-surface-2 px-2 py-0.5 text-gold-text">
                      {domainInfo.instructions.host}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-400">Target:</span>
                    <code className="rounded bg-surface-2 px-2 py-0.5 text-gold-text">
                      {domainInfo.instructions.target}
                    </code>
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink-600">
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
                  className="flex-1 rounded-md bg-surface-2 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-400 disabled:opacity-50"
                >
                  {isLoading ? "Checking..." : "Check Status"}
                </button>
              )}
              <button
                type="button"
                onClick={handleRemoveDomain}
                disabled={isLoading}
                className="rounded-md border border-error/30 px-4 py-2 text-sm text-error hover:bg-error/10 disabled:opacity-50"
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
                className="mb-1 block text-sm text-ink-600"
              >
                Enter your domain
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="blog.example.com"
                className="w-full rounded-md border border-border-strong bg-surface-2 px-3 py-2 text-ink-900 placeholder-ink-400 focus:border-accent focus:outline-none"
              />
              <p className="mt-1 text-xs text-ink-400">
                Your project will be accessible at https://
                {domain || "your-domain.com"}
              </p>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-border-strong px-4 py-2 text-sm text-ink-900 hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDomain}
                disabled={isLoading || !domain.trim()}
                className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink-900 hover:bg-accent-hover disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Domain"}
              </button>
            </div>

            <p className="text-xs text-ink-400">
              After adding, you&apos;ll need to configure a CNAME record with
              your DNS provider pointing to{" "}
              <code className="text-ink-600">{cfProjectName}.pages.dev</code>
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
  const editTextId = useId();
  const editLinkUrlId = useId();
  const [siteSpec, setSiteSpec] = useState<SiteSpec | null>(null);
  const [generationPhase, setGenerationPhase] = useState<string>("");
  const [agentActivities, setAgentActivities] = useState<ActivityItem[]>([]);
  const activityIdCounter = useRef(0);
  const [_pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [liveUsage, setLiveUsage] = useState<{
    inputTokens: number;
    outputTokens: number;
    estimatedCredits: number;
  } | null>(null);

  // Guest checkout state
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [pendingGuestPrompt, setPendingGuestPrompt] = useState<string | null>(
    null,
  );

  // Analytics state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRatedFirstGen, setHasRatedFirstGen] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const firstGenTimeRef = useRef<number | null>(null);
  const hasTrackedFirstGenRef = useRef(false);

  // Mobile responsive state
  const [showChatSheet, setShowChatSheet] = useState(false);
  const [showDeployMenu, setShowDeployMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");

  // Enhance panel state
  const [showEnhancePanel, setShowEnhancePanel] = useState(false);
  const [enhancingSkill, setEnhancingSkill] = useState<SkillId | null>(null);
  const [appliedSkills, setAppliedSkills] = useState<Set<SkillId>>(new Set());

  // Click-to-edit state
  const [editingElement, setEditingElement] = useState<EditingElement | null>(
    null,
  );
  const [editText, setEditText] = useState("");
  const [editHref, setEditHref] = useState("");
  const [editAsLink, setEditAsLink] = useState(false);
  const [editImgSrc, setEditImgSrc] = useState("");
  const [editImgAlt, setEditImgAlt] = useState("");
  const [editBgImage, setEditBgImage] = useState("");

  const [attachedImages, setAttachedImages] = useState<
    { data: string; mimeType: string; preview: string }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multimodalEnabled = useFeatureFlag("multimodal-prompt");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didAutoSendRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const pageNames = Object.keys(pages);
  const currentHtml = pages[currentPage] || "";
  const displayHtml = currentHtml ? injectNavigationScript(currentHtml) : "";

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isGenerating]);

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

  // Pick up images stashed by the landing page PromptForm
  useEffect(() => {
    if (!multimodalEnabled) return;
    try {
      const raw = sessionStorage.getItem("pennysite:prompt-images");
      if (!raw) return;
      sessionStorage.removeItem("pennysite:prompt-images");
      const imgs: { data: string; mimeType: string }[] = JSON.parse(raw);
      setAttachedImages(
        imgs.map((img) => ({
          ...img,
          preview: `data:${img.mimeType};base64,${img.data}`,
        })),
      );
    } catch {
      // ignore
    }
  }, [multimodalEnabled]);

  // Handle return from Stripe guest checkout
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    // Clean up URL immediately
    const url = new URL(window.location.href);
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.pathname + url.search);

    async function handlePostCheckoutReturn() {
      try {
        const res = await fetch(
          `/api/billing/session-status?session_id=${sessionId}`,
        );
        const data = await res.json();

        if (data.error) {
          setError("Session expired or already used. Please try again.");
          return;
        }

        // Establish session via magic link token
        if (data.authToken && data.email) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: data.authToken,
            type: "magiclink",
          });

          if (verifyError) {
            console.error("Failed to verify magic link:", verifyError);
            setError("Failed to sign in. Please try again.");
            return;
          }
        }

        // Refresh user state
        const {
          data: { user: newUser },
        } = await supabase.auth.getUser();
        setUser(newUser);
        setAuthChecked(true);

        // Refresh credit balance
        const balanceRes = await fetch("/api/credits/balance");
        const balanceData = await balanceRes.json();
        if (!balanceData.error) {
          setCreditBalance(balanceData);
        }

        // Set prompt and auto-trigger generation
        if (data.prompt) {
          setInput(data.prompt);
          // Small delay to let state settle, then auto-send
          setTimeout(() => {
            const sendButton = document.querySelector(
              '[data-testid="send-button"]',
            ) as HTMLButtonElement;
            if (sendButton) {
              sendButton.click();
            }
          }, 100);
        }
      } catch (err) {
        console.error("Post-checkout error:", err);
        setError("Failed to restore session. Please try again.");
      }
    }

    handlePostCheckoutReturn();
  }, [searchParams, supabase.auth]);

  // Show set password modal for passwordless users after first generation
  useEffect(() => {
    if (
      user?.user_metadata?.needs_password &&
      pageNames.length > 0 &&
      !showSetPassword &&
      !showRatingModal
    ) {
      // Delay showing to not overlap with other modals
      const timer = setTimeout(() => {
        setShowSetPassword(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, pageNames.length, showSetPassword, showRatingModal]);

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
      if (
        e.data?.type === "edit-element" &&
        e.data.selector &&
        !isGeneratingRef.current
      ) {
        const isLink = e.data.tagName === "A";
        setEditingElement({
          selector: e.data.selector,
          tagName: e.data.tagName,
          text: e.data.text,
          href: e.data.href,
          src: e.data.src,
          alt: e.data.alt,
          bgImage: e.data.bgImage,
        });
        setEditText(e.data.text || "");
        setEditHref(e.data.href || "");
        setEditAsLink(isLink);
        setEditImgSrc(e.data.src || "");
        setEditImgAlt(e.data.alt || "");
        setEditBgImage(e.data.bgImage || "");
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
    const el = doc.querySelector(editingElement.selector) as HTMLElement | null;
    if (!el) {
      setEditingElement(null);
      return;
    }

    if (editingElement.tagName === "IMG") {
      el.setAttribute("src", editImgSrc);
      el.setAttribute("alt", editImgAlt);
    } else {
      const wasLink = editingElement.tagName === "A";
      const wantsLink = editAsLink;

      if (wasLink && !wantsLink) {
        // Convert link to span (preserve inline nature)
        const span = doc.createElement("span");
        span.textContent = editText;
        // Copy classes if any
        if (el.className) span.className = el.className;
        el.replaceWith(span);
      } else if (!wasLink && wantsLink) {
        // Convert element to link
        const link = doc.createElement("a");
        link.textContent = editText;
        link.setAttribute("href", editHref || "#");
        // Copy classes if any
        if (el.className) link.className = el.className;
        el.replaceWith(link);
      } else {
        // Same type - just update content
        el.textContent = editText;
        if (wasLink && editHref) {
          el.setAttribute("href", editHref);
        }
      }

      // Handle background image update if it was edited
      if (editBgImage) {
        el.style.backgroundImage = `url('${editBgImage}')`;
      }
    }

    const serializer = new XMLSerializer();
    const newHtml = `<!DOCTYPE html>\n${serializer.serializeToString(
      doc.documentElement,
    )}`;
    setPages((prev) => ({ ...prev, [currentPage]: newHtml }));
    setEditingElement(null);
  }

  function stripImageData(msgs: Message[]): Message[] {
    return msgs.map((msg) => {
      if (msg.role === "enhance") return msg;
      if (!msg.images || msg.images.length === 0) return msg;
      const { images, ...rest } = msg;
      return { ...rest, imageCount: images.length };
    });
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
      body: JSON.stringify({
        name,
        pages: generatedPages,
        conversation: stripImageData(conversation),
      }),
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
    if ((!text.trim() && attachedImages.length === 0) || isGenerating) return;

    if (!user) {
      // Show guest checkout modal instead of redirecting to login
      setPendingGuestPrompt(text.trim());
      setShowGuestCheckout(true);
      return;
    }

    const images =
      attachedImages.length > 0
        ? attachedImages.map(({ data, mimeType }) => ({ data, mimeType }))
        : undefined;
    const userMessage: Message = {
      role: "user",
      content: text.trim(),
      ...(images && { images }),
    };
    setAttachedImages([]);
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);
    setEditingElement(null);
    setError(null);
    setLiveUsage(null);
    setAgentActivities([]);
    activityIdCounter.current = 0;

    try {
      setGenerationPhase("Starting...");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => {
            if (m.role !== "enhance" && m.images) {
              return { role: m.role, content: m.content, images: m.images };
            }
            return m.role === "enhance"
              ? m
              : { role: m.role, content: m.content };
          }),
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

              case "tool_activity": {
                const toolDisplayNames: Record<string, string> = {
                  plan_site: "Planning site structure",
                  write_page: "Writing page",
                  edit_page: "Editing page",
                  read_page: "Reading page",
                  validate_site: "Validating site",
                };
                if (event.status === "start") {
                  const toolName = event.toolName as string;
                  let message = toolDisplayNames[toolName] || toolName;
                  if (toolName === "write_page" && event.args?.filename) {
                    message = `Writing ${event.args.filename}`;
                  } else if (toolName === "edit_page" && event.args?.filename) {
                    message = `Editing ${event.args.filename}`;
                  } else if (toolName === "read_page" && event.args?.filename) {
                    message = `Reading ${event.args.filename}`;
                  }
                  const rawDetails = event.args
                    ? JSON.stringify(event.args, null, 2)
                    : undefined;
                  const details =
                    rawDetails && rawDetails.length > 800
                      ? `${rawDetails.slice(0, 800)}...`
                      : rawDetails;
                  const newActivity: ActivityItem = {
                    id: `tool-${activityIdCounter.current++}`,
                    type: "tool",
                    toolName,
                    status: "running",
                    message,
                    details,
                    timestamp: Date.now(),
                  };
                  setAgentActivities((prev) => [...prev, newActivity]);
                } else if (event.status === "end") {
                  setAgentActivities((prev) =>
                    prev.map((a) =>
                      a.type === "tool" &&
                      a.toolName === event.toolName &&
                      a.status === "running"
                        ? {
                            ...a,
                            status: event.result?.success
                              ? "complete"
                              : "error",
                          }
                        : a,
                    ),
                  );
                }
                break;
              }

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
            conversation: stripImageData(finalMessages),
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

  function handleImageUpload(files: FileList | null) {
    if (!files) return;
    const MAX_IMAGES = 4;
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB per image

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_SIZE) return;

      setAttachedImages((prev) => {
        if (prev.length >= MAX_IMAGES) return prev;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const base64 = dataUrl.split(",")[1];
          setAttachedImages((current) => {
            if (current.length >= MAX_IMAGES) return current;
            return [
              ...current,
              { data: base64, mimeType: file.type, preview: dataUrl },
            ];
          });
        };
        reader.readAsDataURL(file);
        return prev;
      });
    });
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (!multimodalEnabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      const dt = new DataTransfer();
      for (const f of imageFiles) dt.items.add(f);
      handleImageUpload(dt.files);
    }
  }

  function removeAttachedImage(index: number) {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragOver(e: React.DragEvent) {
    if (!multimodalEnabled) return;
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!multimodalEnabled) return;
    handleImageUpload(e.dataTransfer.files);
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
            conversation: stripImageData(messages),
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

  async function downloadAll() {
    const JSZip = (await import("jszip")).default;
    const { saveAs } = await import("file-saver");

    const zip = new JSZip();
    for (const [filename, content] of Object.entries(pages)) {
      zip.file(filename, content);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${projectName || "website"}.zip`);
  }
  async function handleEnhance(skillId: SkillId) {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!currentHtml || enhancingSkill) return;

    const skill = getSkill(skillId);
    if (!skill) return;

    // Close the modal immediately
    setShowEnhancePanel(false);
    setEnhancingSkill(skillId);
    setError(null);

    // Add pending enhancement message to chat
    const enhanceMessage: Message = {
      role: "enhance",
      skillId,
      skillName: skill.name,
      skillIcon: skill.icon,
      filename: currentPage,
      status: "pending",
    };
    setMessages((prev) => [...prev, enhanceMessage]);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId,
          html: currentHtml,
          filename: currentPage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "INSUFFICIENT_CREDITS") {
          setInsufficientCreditsInfo({
            available: data.availableCredits,
            required: data.requiredCredits,
          });
          setShowBuyCredits(true);
          // Update message to error state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.role === "enhance" &&
              msg.skillId === skillId &&
              msg.status === "pending"
                ? {
                    ...msg,
                    status: "error" as const,
                    error: "Insufficient credits",
                  }
                : msg,
            ),
          );
          return;
        }
        throw new Error(data.error || "Enhancement failed");
      }

      // Update the page with enhanced HTML
      setPages((prev) => ({
        ...prev,
        [currentPage]: data.html,
      }));

      // Mark skill as applied
      setAppliedSkills((prev) => new Set([...prev, skillId]));

      // Update message to complete state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.role === "enhance" &&
          msg.skillId === skillId &&
          msg.status === "pending"
            ? {
                ...msg,
                status: "complete" as const,
                creditsUsed: data.creditsUsed,
              }
            : msg,
        ),
      );

      // Track enhancement
      captureEvent("page_enhanced", {
        project_id: projectId,
        skill_id: skillId,
        filename: currentPage,
        credits_used: data.creditsUsed,
      });

      // Refresh credit balance
      fetch("/api/credits/balance")
        .then((r) => r.json())
        .then((balance) => {
          if (!balance.error) {
            setCreditBalance(balance);
          }
        });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enhancement failed";
      // Update message to error state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.role === "enhance" &&
          msg.skillId === skillId &&
          msg.status === "pending"
            ? { ...msg, status: "error" as const, error: message }
            : msg,
        ),
      );
      setError(message);
    } finally {
      setEnhancingSkill(null);
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

  const viewportClasses = {
    desktop: "w-full",
    tablet: "max-w-[768px] mx-auto",
    mobile: "max-w-[375px] mx-auto",
  };

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* ===== TOP NAVBAR (Desktop) ===== */}
      <header className="hidden shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 lg:flex">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-ink-600 hover:text-ink-900"
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-lg font-semibold text-ink-900 focus:outline-none"
              placeholder="Untitled"
            />
            {siteSpec && (
              <span className="rounded bg-surface-2 px-2 py-0.5 text-xs text-ink-600">
                {siteSpec.type}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Credits */}
          {user && creditBalance && (
            <Link
              href="/billing"
              className="flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-2 px-3 py-1.5 text-sm text-ink-900 hover:border-fg-subtle"
            >
              <span className="text-accent-text">⚡</span>
              {creditBalance.availableCredits} credits
            </Link>
          )}
          {!user && (
            <Link
              href="/auth/login"
              className="text-sm text-ink-600 hover:text-ink-900"
            >
              Sign in
            </Link>
          )}
          {/* Enhance Button */}
          <button
            type="button"
            onClick={() => setShowEnhancePanel(true)}
            disabled={pageNames.length === 0}
            className="flex items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm text-ink-900 transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>✨</span>
            Enhance
          </button>
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || pageNames.length === 0}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : saveStatus || "Save"}
          </button>
          {/* Deploy Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDeployMenu(!showDeployMenu)}
              disabled={!projectId || pageNames.length === 0}
              className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : publishStatus || "Deploy"}
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
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {showDeployMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border-strong bg-surface py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    handlePublish();
                    setShowDeployMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                >
                  🚀 Publish to Web
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadAll();
                    setShowDeployMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                >
                  📥 Download ZIP
                </button>
                {deployedUrl && (
                  <>
                    <div className="my-1 border-t border-border-strong" />
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-accent-text hover:bg-surface-2"
                      onClick={() => setShowDeployMenu(false)}
                    >
                      🌐 View Live Site
                    </a>
                  </>
                )}
                {deployedUrl && cfProjectName && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDomainModal(true);
                      setShowDeployMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                  >
                    🔗 Custom Domain
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Account */}
          {user && (
            <Link
              href="/account"
              className="rounded-full p-2 text-ink-600 hover:bg-surface-2 hover:text-ink-900"
              title="Account"
            >
              <CircleUserIcon size={20} />
            </Link>
          )}
        </div>
      </header>

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-ink-600 hover:text-ink-900">
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
          <span className="max-w-[200px] truncate font-medium text-ink-900">
            {projectName}
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="rounded-md p-2 text-ink-600 hover:bg-surface-2 hover:text-ink-900"
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
          {showMoreMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border-strong bg-surface py-1 shadow-xl">
              {user && creditBalance && (
                <Link
                  href="/billing"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                  onClick={() => setShowMoreMenu(false)}
                >
                  <span className="text-accent-text">⚡</span>
                  {creditBalance.availableCredits} credits
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  setShowMoreMenu(false);
                }}
                disabled={isSaving}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2 disabled:opacity-50"
              >
                💾 {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadAll();
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
              >
                📥 Download
              </button>
              {deployedUrl && (
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-accent-text hover:bg-surface-2"
                  onClick={() => setShowMoreMenu(false)}
                >
                  🌐 View Live
                </a>
              )}
              {deployedUrl && cfProjectName && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDomainModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                >
                  🔗 Custom Domain
                </button>
              )}
              <div className="my-1 border-t border-border-strong" />
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    setShowMoreMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-900 hover:bg-surface-2"
                  onClick={() => setShowMoreMenu(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

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

      {/* Guest Checkout Modal */}
      {showGuestCheckout && pendingGuestPrompt && (
        <GuestCheckoutModal
          prompt={pendingGuestPrompt}
          onClose={() => {
            setShowGuestCheckout(false);
            setPendingGuestPrompt(null);
          }}
        />
      )}

      {/* Set Password Modal */}
      {showSetPassword && (
        <SetPasswordModal
          onComplete={() => {
            setShowSetPassword(false);
            // Refresh user to update metadata
            supabase.auth.getUser().then(({ data: { user: updatedUser } }) => {
              setUser(updatedUser);
            });
          }}
          onSkip={() => setShowSetPassword(false)}
        />
      )}

      {/* Click-to-Edit Modal */}
      {editingElement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-md rounded-md border border-border-strong bg-surface p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-ink-900">
              Edit {editingElement.tagName.toLowerCase()}
            </h3>

            {editingElement.tagName === "IMG" ? (
              <>
                <label
                  htmlFor="edit-img-src"
                  className="mb-1 block text-sm text-ink-600"
                >
                  Image URL
                </label>
                <input
                  id="edit-img-src"
                  type="text"
                  className="mb-2 w-full rounded border border-border-strong bg-surface-2 px-3 py-2 text-ink-900 focus:border-blue-500 focus:outline-none"
                  value={editImgSrc}
                  onChange={(e) => setEditImgSrc(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                />
                <p className="mb-4 text-xs text-ink-400 leading-relaxed">
                  Tip: We recommend hosting images on{" "}
                  <a
                    href="https://cloudinary.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Cloudinary
                  </a>{" "}
                  or{" "}
                  <a
                    href="https://imgbb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    ImgBB
                  </a>
                  . Paste the &quot;Direct Link&quot; here.
                </p>
                <label
                  htmlFor="edit-img-alt"
                  className="mb-1 block text-sm text-ink-600"
                >
                  Alt Text (Description)
                </label>
                <input
                  id="edit-img-alt"
                  type="text"
                  className="mb-4 w-full rounded border border-border-strong bg-surface-2 px-3 py-2 text-ink-900 focus:border-blue-500 focus:outline-none"
                  value={editImgAlt}
                  onChange={(e) => setEditImgAlt(e.target.value)}
                  placeholder="A descriptive caption"
                />
              </>
            ) : (
              <>
                <label
                  className="mb-1 block text-sm text-ink-600"
                  htmlFor={editTextId}
                >
                  Text
                </label>
                <textarea
                  id={editTextId}
                  className="mb-4 w-full rounded border border-border-strong bg-surface-2 px-3 py-2 text-ink-900 focus:border-blue-500 focus:outline-none"
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />

                {editingElement.bgImage !== undefined && (
                  <>
                    <label
                      htmlFor="edit-bg-image"
                      className="mb-1 block text-sm text-ink-600"
                    >
                      Background Image URL
                    </label>
                    <input
                      id="edit-bg-image"
                      type="text"
                      className="mb-2 w-full rounded border border-border-strong bg-surface-2 px-3 py-2 text-ink-900 focus:border-blue-500 focus:outline-none"
                      value={editBgImage}
                      onChange={(e) => setEditBgImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mb-4 text-xs text-ink-400 leading-relaxed">
                      Tip: We recommend hosting images on{" "}
                      <a
                        href="https://cloudinary.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Cloudinary
                      </a>{" "}
                      or{" "}
                      <a
                        href="https://imgbb.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        ImgBB
                      </a>
                      .
                    </p>
                  </>
                )}

                <label className="mb-3 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editAsLink}
                    onChange={(e) => {
                      setEditAsLink(e.target.checked);
                      if (e.target.checked && !editHref) {
                        setEditHref("#");
                      }
                    }}
                    className="h-4 w-4 rounded border-fg-subtle bg-surface-2 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-ink-900">Make this a link</span>
                </label>
                {editAsLink && (
                  <>
                    <label
                      className="mb-1 block text-sm text-ink-600"
                      htmlFor={editLinkUrlId}
                    >
                      Link URL
                    </label>
                    <input
                      type="text"
                      id={editLinkUrlId}
                      className="mb-4 w-full rounded border border-border-strong bg-surface-2 px-3 py-2 text-ink-900 focus:border-blue-500 focus:outline-none"
                      value={editHref}
                      onChange={(e) => setEditHref(e.target.value)}
                      placeholder="https://example.com or #section"
                    />
                  </>
                )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingElement(null)}
                className="rounded bg-surface-2 px-4 py-2 text-sm text-ink-900 hover:bg-ink-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyElementEdit}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-ink-900 hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhance Panel Modal */}
      {showEnhancePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-strong bg-surface p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-ink-900">
                  ✨ Enhance Your Site
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  Apply improvements to {currentPage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEnhancePanel(false)}
                className="rounded-md p-2 text-ink-600 hover:bg-surface-2 hover:text-ink-900"
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {getAllSkills().map((skill) => {
                const isApplied = appliedSkills.has(skill.id);
                const isEnhancing = enhancingSkill === skill.id;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleEnhance(skill.id)}
                    disabled={isEnhancing || enhancingSkill !== null}
                    className={`flex w-full items-center gap-4 rounded-md border p-4 text-left transition-all ${
                      isApplied
                        ? "border-accent/50 bg-accent-light"
                        : "border-border-strong bg-surface hover:border-fg-subtle hover:bg-surface-2"
                    } ${isEnhancing || enhancingSkill !== null ? "opacity-70" : ""}`}
                  >
                    <span className="text-2xl">{skill.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink-900">
                          {skill.name}
                        </span>
                        {isApplied && (
                          <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs text-accent-text">
                            Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-600">
                        {skill.description}
                      </p>
                    </div>
                    {isEnhancing ? (
                      <span className="shrink-0 text-sm text-ink-600">
                        Enhancing...
                      </span>
                    ) : (
                      <span className="shrink-0 rounded bg-surface-2 px-2 py-1 text-xs text-ink-900">
                        ~30 credits
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-error/30 bg-error/10 p-3 text-sm text-error">
                {error}
              </div>
            )}

            <p className="mt-4 text-center text-xs text-ink-400">
              Enhancements modify {currentPage}. You can apply multiple skills.
            </p>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex min-h-0 flex-1 flex-row">
        {/* ===== LEFT PANEL - CHAT (Desktop only) ===== */}
        <div className="hidden w-96 shrink-0 flex-col border-r border-border bg-surface lg:flex">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="font-semibold text-ink-900">Chat</h2>
              <p className="text-sm text-ink-600">Describe your changes</p>
            </div>
            {isGenerating && liveUsage && (
              <span className="text-xs text-gold-text">
                ~{liveUsage.estimatedCredits} credits used
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-sm text-ink-400">
                <p className="mb-3">Describe the website you want to create:</p>
                <div className="space-y-2 text-xs">
                  <p className="rounded bg-surface-2 p-2">
                    "A landing page for a developer tools startup with features,
                    pricing, and documentation"
                  </p>
                  <p className="rounded bg-surface-2 p-2">
                    "Personal site for an executive coach with about, services,
                    and booking page"
                  </p>
                  <p className="rounded bg-surface-2 p-2">
                    "A consulting agency website with case studies and contact
                    form"
                  </p>
                </div>
                {user &&
                  creditBalance &&
                  creditBalance.availableCredits < 150 && (
                    <div className="mt-4 rounded-md border border-gold/30 bg-gold-light p-3">
                      <p className="text-xs text-gold-text">
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
                        className="mt-2 rounded bg-warning px-3 py-1 text-xs font-medium text-white hover:bg-warning-muted"
                      >
                        Buy Credits
                      </button>
                    </div>
                  )}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => {
                  if (msg.role === "enhance") {
                    return (
                      <div
                        key={`enhance-${msg.skillId}-${i}`}
                        className={`mr-4 rounded-md border p-3 ${
                          msg.status === "pending"
                            ? "border-border-strong bg-surface-2"
                            : msg.status === "complete"
                              ? "border-accent/30 bg-accent-light"
                              : "border-error/30 bg-error/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{msg.skillIcon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-ink-900">
                                {msg.skillName}
                              </span>
                              {msg.status === "pending" && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
                                  Enhancing...
                                </span>
                              )}
                              {msg.status === "complete" && (
                                <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs text-accent-text">
                                  ✓ Applied
                                </span>
                              )}
                              {msg.status === "error" && (
                                <span className="rounded-full bg-error/20 px-2 py-0.5 text-xs text-error">
                                  Failed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-ink-600">
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
                          ? "ml-4 rounded-md bg-surface-2 p-3 text-ink-900"
                          : "mr-4 rounded-md bg-surface-2 p-3 text-ink-900"
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
                                className="h-12 w-12 rounded border border-fg-subtle object-cover"
                              />
                            ))}
                          </div>
                        )}
                      {msg.role === "user" &&
                        !msg.images &&
                        msg.imageCount &&
                        msg.imageCount > 0 && (
                          <div className="mb-1.5 inline-flex items-center gap-1 rounded bg-fg-subtle/50 px-2 py-0.5 text-xs text-ink-600">
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
                {(isGenerating || agentActivities.length > 0) && (
                  <AgentActivityLog
                    activities={agentActivities}
                    isGenerating={isGenerating}
                    currentPhase={generationPhase}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop target */}
          <div
            className={`border-t border-border p-4 transition ${isDragging ? "ring-2 ring-inset ring-accent/50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {error && <div className="mb-2 text-xs text-error">{error}</div>}
            {multimodalEnabled && attachedImages.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachedImages.map((img, i) => (
                  <div key={`attached-${i}`} className="group relative">
                    {/* biome-ignore lint/performance/noImgElement: blob preview URLs not supported by next/image */}
                    <img
                      src={img.preview}
                      alt={`Attachment ${i + 1}`}
                      className="h-16 w-16 rounded-md border border-border-strong object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachedImage(i)}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-fg-subtle text-[10px] text-ink-900 opacity-0 transition-opacity hover:bg-error-hover group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <AutoExpandTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  messages.length === 0
                    ? "Describe your website..."
                    : "Ask for changes..."
                }
                rows={1}
                maxHeight={120}
                className="min-h-[38px] w-full resize-none rounded-md border border-border-strong bg-surface-2 px-3 py-2 font-mono text-sm text-ink-900 placeholder-ink-400 focus:border-accent focus:outline-none"
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between">
                {multimodalEnabled ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating || attachedImages.length >= 4}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong text-ink-600 transition-colors hover:border-fg-subtle hover:text-ink-900 disabled:opacity-30"
                      title="Attach image (or paste a screenshot)"
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
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    isGenerating ||
                    (!input.trim() && attachedImages.length === 0)
                  }
                  data-testid="send-button"
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL - PREVIEW ===== */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Page tabs */}
          {pageNames.length > 1 && (
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-surface px-4 py-2">
              {pageNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCurrentPage(name)}
                  className={`shrink-0 rounded px-3 py-1 text-sm transition-colors ${
                    currentPage === name
                      ? "bg-surface-2 text-ink-900"
                      : "text-ink-600 hover:bg-surface-2 hover:text-ink-900"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Preview header with viewport toggles (desktop only) */}
          <div className="hidden shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-2 lg:flex">
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-600">
                Preview{currentPage ? `: ${currentPage}` : ""}
              </span>
              {displayHtml && (
                <span className="text-xs text-ink-400">
                  (double-click text to edit)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isGenerating && (
                <span className="flex items-center gap-2 text-sm text-ink-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  Streaming...
                </span>
              )}
              {/* Viewport size toggles */}
              <div className="flex rounded-md border border-border-strong p-0.5">
                <button
                  type="button"
                  onClick={() => setViewportSize("desktop")}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    viewportSize === "desktop"
                      ? "bg-surface-2 text-ink-900"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                  title="Desktop"
                >
                  🖥
                </button>
                <button
                  type="button"
                  onClick={() => setViewportSize("tablet")}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    viewportSize === "tablet"
                      ? "bg-surface-2 text-ink-900"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                  title="Tablet"
                >
                  📱
                </button>
                <button
                  type="button"
                  onClick={() => setViewportSize("mobile")}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    viewportSize === "mobile"
                      ? "bg-surface-2 text-ink-900"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                  title="Mobile"
                >
                  📲
                </button>
              </div>
            </div>
          </div>

          {/* Preview iframe */}
          <div className="relative min-h-0 flex-1 bg-canvas">
            <div className={`h-full ${viewportClasses[viewportSize]}`}>
              {displayHtml ? (
                <iframe
                  className="h-full w-full border-0 bg-accent"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={displayHtml}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-ink-600">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">🏗️</div>
                    <p className="text-base">Your website will appear here</p>
                    <p className="mt-2 text-xs text-ink-400">
                      Describe your website in the chat to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM BAR ===== */}
      <div className="flex shrink-0 items-center justify-around border-t border-border bg-surface py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setShowChatSheet(true)}
          className="flex flex-col items-center gap-1 px-4 py-2 text-ink-600 hover:text-ink-900"
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
          onClick={() => setShowEnhancePanel(true)}
          disabled={pageNames.length === 0}
          className="flex flex-col items-center gap-1 px-4 py-2 text-ink-600 hover:text-ink-900 disabled:text-ink-400"
        >
          <span className="text-xl">✨</span>
          <span className="text-xs">Enhance</span>
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={!projectId || isPublishing}
          className="flex flex-col items-center gap-1 px-4 py-2 text-accent-text hover:text-accent-text disabled:text-ink-400"
        >
          <span className="text-xl">🚀</span>
          <span className="text-xs">{isPublishing ? "..." : "Deploy"}</span>
        </button>
      </div>

      {/* ===== MOBILE CHAT BOTTOM SHEET ===== */}
      {showChatSheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-overlay"
            onClick={() => setShowChatSheet(false)}
            aria-label="Close chat"
          />
          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border-strong bg-surface">
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-12 rounded-full bg-fg-subtle" />
            </div>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-border px-4 pb-3">
              <h2 className="font-semibold text-ink-900">Chat</h2>
              <button
                type="button"
                onClick={() => setShowChatSheet(false)}
                className="rounded-md p-1 text-ink-600 hover:bg-surface-2 hover:text-ink-900"
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-sm text-ink-400">
                  <p className="mb-3">
                    Describe the website you want to create:
                  </p>
                  <div className="space-y-2 text-xs">
                    <p className="rounded bg-surface-2 p-2">
                      "A landing page for a startup"
                    </p>
                    <p className="rounded bg-surface-2 p-2">
                      "A portfolio for a photographer"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => {
                    if (msg.role === "enhance") {
                      return (
                        <div
                          key={`mobile-enhance-${msg.skillId}-${i}`}
                          className={`mr-4 rounded-md border p-3 ${
                            msg.status === "pending"
                              ? "border-border-strong bg-surface-2"
                              : msg.status === "complete"
                                ? "border-accent/30 bg-accent-light"
                                : "border-error/30 bg-error/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{msg.skillIcon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-ink-900">
                                  {msg.skillName}
                                </span>
                                {msg.status === "pending" && (
                                  <span className="inline-flex items-center gap-1 text-xs text-ink-600">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
                                  </span>
                                )}
                                {msg.status === "complete" && (
                                  <span className="text-xs text-accent-text">
                                    ✓
                                  </span>
                                )}
                                {msg.status === "error" && (
                                  <span className="text-xs text-error">✗</span>
                                )}
                              </div>
                              <p className="text-xs text-ink-600">
                                {msg.status === "pending" && "Enhancing..."}
                                {msg.status === "complete" && msg.filename}
                                {msg.status === "error" &&
                                  (msg.error || "Failed")}
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
                            ? "ml-4 rounded-md bg-surface-2 p-3 text-ink-900"
                            : "mr-4 rounded-md bg-surface-2 p-3 text-ink-900"
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
                                  className="h-10 w-10 rounded border border-fg-subtle object-cover"
                                />
                              ))}
                            </div>
                          )}
                        {msg.role === "user" &&
                          !msg.images &&
                          msg.imageCount &&
                          msg.imageCount > 0 && (
                            <div className="mb-1.5 inline-flex items-center gap-1 rounded bg-fg-subtle/50 px-2 py-0.5 text-xs text-ink-600">
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
                  {(isGenerating || agentActivities.length > 0) && (
                    <AgentActivityLog
                      activities={agentActivities}
                      isGenerating={isGenerating}
                      currentPhase={generationPhase}
                    />
                  )}
                </div>
              )}
            </div>
            {/* Input */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop target */}
            <div
              className={`border-t border-border p-4 transition ${isDragging ? "ring-2 ring-inset ring-accent/50" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {error && <div className="mb-2 text-xs text-error">{error}</div>}
              {multimodalEnabled && attachedImages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachedImages.map((img, i) => (
                    <div
                      key={`mobile-attached-${i}`}
                      className="group relative"
                    >
                      {/* biome-ignore lint/performance/noImgElement: blob preview URLs not supported by next/image */}
                      <img
                        src={img.preview}
                        alt={`Attachment ${i + 1}`}
                        className="h-12 w-12 rounded-md border border-border-strong object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachedImage(i)}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-fg-subtle text-[10px] text-ink-900 hover:bg-error-hover"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <AutoExpandTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={
                    messages.length === 0
                      ? "Describe your website..."
                      : "Ask for changes..."
                  }
                  rows={1}
                  maxHeight={80}
                  className="min-h-[38px] w-full resize-none rounded-md border border-border-strong bg-surface-2 px-3 py-2 font-mono text-sm text-ink-900 placeholder-ink-400 focus:border-accent focus:outline-none"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between">
                  {multimodalEnabled ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating || attachedImages.length >= 4}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-border-strong text-ink-600 transition-colors hover:border-fg-subtle hover:text-ink-900 disabled:opacity-30"
                      title="Attach image (or paste a screenshot)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={
                      isGenerating ||
                      (!input.trim() && attachedImages.length === 0)
                    }
                    data-testid="send-button-mobile"
                    className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
