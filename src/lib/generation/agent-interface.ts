import type { AgentEvent, AgentTool } from "@mariozechner/pi-agent-core";
import type { SiteSpec } from "./types";

export interface AgentLike {
  subscribe(cb: (e: AgentEvent) => void): () => void;
  prompt(input: string): Promise<void>;
}

export type AgentFactory = (
  config: {
    systemPrompt: string;
    model: unknown;
    tools: AgentTool[];
    thinkingLevel?: "low" | "medium" | "high";
    messages?: unknown[];
  },
  getApiKey: () => string | undefined,
) => AgentLike;

export interface GenerationDeps {
  agentFactory?: AgentFactory;
  model?: unknown;
  apiKey?: string;
}

export interface GenerationState {
  spec: SiteSpec | null;
  pages: Record<string, string>;
  validationPassed: boolean;
}

export interface PageDetails {
  filename: string;
  html: string;
  valid?: boolean;
  issues?: string[];
}

export function createDefaultAgentFactory(): AgentFactory {
  const { Agent } = require("@mariozechner/pi-agent-core");
  return (config, getApiKey) => new Agent({ initialState: config, getApiKey });
}

/**
 * Approved image sources that are guaranteed to work.
 * All other external image URLs will be flagged as validation errors.
 */
export const APPROVED_IMAGE_SOURCES = [
  "illustrations.popsy.co", // Popsy SVG illustrations
  "data:", // Inline data URIs (SVGs, base64)
] as const;

/**
 * Check if an image URL is from an approved source.
 */
export function isApprovedImageSource(url: string): boolean {
  const trimmedUrl = url.trim();

  // Data URIs are always allowed
  if (trimmedUrl.startsWith("data:")) {
    return true;
  }

  // Check against approved domains
  return APPROVED_IMAGE_SOURCES.some(
    (source) => source !== "data:" && trimmedUrl.includes(source),
  );
}

/**
 * Extract all image URLs from HTML (img src, background-image, etc.)
 */
export function extractImageUrls(html: string): string[] {
  const urls: string[] = [];

  // Match img src attributes
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  for (const match of html.matchAll(imgSrcRegex)) {
    urls.push(match[1]);
  }

  // Match CSS background-image url()
  const bgImageRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
  for (const match of html.matchAll(bgImageRegex)) {
    urls.push(match[1]);
  }

  // Match inline style background-image
  const styleUrlRegex = /url\(["']?(https?:\/\/[^"')]+)["']?\)/gi;
  for (const match of html.matchAll(styleUrlRegex)) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  return urls;
}

/**
 * Validate image URLs in HTML against approved sources.
 */
export function validateImageUrls(html: string): {
  valid: boolean;
  issues: string[];
  unapprovedUrls: string[];
} {
  const urls = extractImageUrls(html);
  const unapprovedUrls = urls.filter((url) => {
    // Skip placeholder/empty values
    if (url === "#" || url === "" || url.startsWith("/")) {
      return false;
    }
    return !isApprovedImageSource(url);
  });

  if (unapprovedUrls.length === 0) {
    return { valid: true, issues: [], unapprovedUrls: [] };
  }

  const issues = unapprovedUrls.map(
    (url) =>
      `Unapproved image source: "${url.substring(0, 60)}${url.length > 60 ? "..." : ""}". Use Popsy SVGs (https://illustrations.popsy.co/{color}/{name}.svg) or inline SVGs instead.`,
  );

  return { valid: false, issues, unapprovedUrls };
}

/**
 * Valid Popsy illustration color options
 */
const POPSY_COLORS = [
  "amber",
  "blue",
  "cyan",
  "emerald",
  "fuchsia",
  "gray",
  "green",
  "indigo",
  "lime",
  "neutral",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "sky",
  "slate",
  "stone",
  "teal",
  "violet",
  "yellow",
  "zinc",
] as const;

/**
 * Check for duplicate consecutive section types
 */
function checkDuplicateSections(html: string): string[] {
  const warnings: string[] = [];

  // Extract section order from HTML by looking for section/div with identifying classes
  const sectionRegex =
    /<(?:section|div)[^>]*class="[^"]*\b(hero|features?|testimonials?|pricing|faq|cta|footer|about|contact|header|nav)\b[^"]*"[^>]*>/gi;
  const sections: string[] = [];
  for (const match of html.matchAll(sectionRegex)) {
    const sectionType = match[1].toLowerCase().replace(/s$/, ""); // normalize plurals
    sections.push(sectionType);
  }

  // Check for consecutive duplicates
  for (let i = 1; i < sections.length; i++) {
    if (sections[i] === sections[i - 1]) {
      warnings.push(
        `Duplicate consecutive "${sections[i]}" sections detected - consider combining or varying section types`,
      );
    }
  }

  return warnings;
}

/**
 * Check that hero sections have a CTA (link or button)
 */
function checkHeroCta(html: string): string[] {
  const warnings: string[] = [];

  // Find hero sections
  const heroRegex =
    /<(?:section|div)[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>([\s\S]*?)(?=<(?:section|div)[^>]*class="|<\/body|<footer)/gi;

  for (const match of html.matchAll(heroRegex)) {
    const heroContent = match[1];
    // Check for links or buttons
    const hasLink = /<a\s[^>]*href=/i.test(heroContent);
    const hasButton = /<button/i.test(heroContent);

    if (!hasLink && !hasButton) {
      warnings.push(
        "Hero section appears to be missing a CTA (link or button)",
      );
    }
  }

  return warnings;
}

/**
 * Check for inconsistent section spacing
 */
function checkSpacingConsistency(html: string): string[] {
  const warnings: string[] = [];

  // Extract py- values from sections
  const pyRegex = /<(?:section|div)[^>]*class="[^"]*\bpy-(\d+)\b[^"]*"[^>]*>/gi;
  const pyValues: number[] = [];

  for (const match of html.matchAll(pyRegex)) {
    pyValues.push(Number.parseInt(match[1], 10));
  }

  if (pyValues.length >= 2) {
    // Check for large inconsistencies (more than 3x difference between adjacent sections)
    for (let i = 1; i < pyValues.length; i++) {
      const ratio =
        Math.max(pyValues[i], pyValues[i - 1]) /
        Math.max(Math.min(pyValues[i], pyValues[i - 1]), 1);
      if (ratio > 3) {
        warnings.push(
          `Inconsistent section spacing: py-${pyValues[i - 1]} followed by py-${pyValues[i]} - consider more uniform padding`,
        );
      }
    }
  }

  return warnings;
}

/**
 * Basic color contrast check (light on light, dark on dark)
 */
function checkColorContrast(html: string): string[] {
  const warnings: string[] = [];

  const lightBgColors = [
    "bg-white",
    "bg-gray-50",
    "bg-gray-100",
    "bg-slate-50",
    "bg-slate-100",
    "bg-neutral-50",
    "bg-neutral-100",
    "bg-stone-50",
    "bg-stone-100",
    "bg-zinc-50",
    "bg-zinc-100",
  ];
  const lightTextColors = [
    "text-white",
    "text-gray-50",
    "text-gray-100",
    "text-gray-200",
    "text-slate-50",
    "text-slate-100",
    "text-slate-200",
  ];

  const darkBgColors = [
    "bg-black",
    "bg-gray-900",
    "bg-gray-800",
    "bg-slate-900",
    "bg-slate-800",
    "bg-neutral-900",
    "bg-neutral-800",
    "bg-zinc-900",
    "bg-zinc-800",
  ];
  const darkTextColors = [
    "text-black",
    "text-gray-900",
    "text-gray-800",
    "text-gray-700",
    "text-slate-900",
    "text-slate-800",
    "text-slate-700",
  ];

  // Check for light text on light background in same element
  for (const lightBg of lightBgColors) {
    for (const lightText of lightTextColors) {
      const pattern = new RegExp(
        `class="[^"]*\\b${lightBg}\\b[^"]*\\b${lightText}\\b[^"]*"|class="[^"]*\\b${lightText}\\b[^"]*\\b${lightBg}\\b[^"]*"`,
        "gi",
      );
      if (pattern.test(html)) {
        warnings.push(
          `Potential contrast issue: ${lightText} on ${lightBg} may be hard to read`,
        );
        break;
      }
    }
  }

  // Check for dark text on dark background in same element
  for (const darkBg of darkBgColors) {
    for (const darkText of darkTextColors) {
      const pattern = new RegExp(
        `class="[^"]*\\b${darkBg}\\b[^"]*\\b${darkText}\\b[^"]*"|class="[^"]*\\b${darkText}\\b[^"]*\\b${darkBg}\\b[^"]*"`,
        "gi",
      );
      if (pattern.test(html)) {
        warnings.push(
          `Potential contrast issue: ${darkText} on ${darkBg} may be hard to read`,
        );
        break;
      }
    }
  }

  return warnings;
}

/**
 * Validate Popsy illustration URLs
 */
function checkPopsyUrls(html: string): string[] {
  const warnings: string[] = [];

  const popsyRegex =
    /https:\/\/illustrations\.popsy\.co\/([^/]+)\/([^."'\s]+)\.svg/gi;

  for (const match of html.matchAll(popsyRegex)) {
    const color = match[1].toLowerCase();
    const name = match[2].toLowerCase();

    if (!POPSY_COLORS.includes(color as (typeof POPSY_COLORS)[number])) {
      warnings.push(
        `Invalid Popsy color "${color}" - valid colors: ${POPSY_COLORS.slice(0, 5).join(", ")}...`,
      );
    }

    // Note: We don't strictly validate names since there are many valid ones
    // Just warn if it looks like a typo (very short or contains unusual characters)
    if (name.length < 2 || /[^a-z0-9-]/.test(name)) {
      warnings.push(
        `Suspicious Popsy illustration name "${name}" - check spelling`,
      );
    }
  }

  return warnings;
}

/**
 * Check accessibility basics
 */
function checkAccessibility(html: string): string[] {
  const warnings: string[] = [];

  // Check images have alt attributes
  const imgWithoutAlt = /<img(?![^>]*\balt=)[^>]*>/gi;
  const imagesWithoutAlt = html.match(imgWithoutAlt);
  if (imagesWithoutAlt && imagesWithoutAlt.length > 0) {
    warnings.push(
      `${imagesWithoutAlt.length} image(s) missing alt attribute for accessibility`,
    );
  }

  // Check for empty links
  const emptyLinkRegex = /<a[^>]*>(\s*)<\/a>/gi;
  const emptyLinks = html.match(emptyLinkRegex);
  if (emptyLinks && emptyLinks.length > 0) {
    warnings.push(
      `${emptyLinks.length} link(s) with no text content - add descriptive text or aria-label`,
    );
  }

  // Check heading hierarchy
  const headingRegex = /<h([1-6])[^>]*>/gi;
  const headings: number[] = [];
  for (const match of html.matchAll(headingRegex)) {
    headings.push(Number.parseInt(match[1], 10));
  }

  if (headings.length > 0) {
    // Check if h1 comes first
    if (headings[0] !== 1) {
      warnings.push(
        `First heading is h${headings[0]} - consider starting with h1 for proper document structure`,
      );
    }

    // Check for skipped heading levels
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] > headings[i - 1] + 1) {
        warnings.push(
          `Heading hierarchy skips from h${headings[i - 1]} to h${headings[i]} - avoid skipping levels`,
        );
        break; // Only report once
      }
    }
  }

  // Check for links that open in new tab without rel="noopener"
  const newTabLinks = /<a[^>]*target="_blank"(?![^>]*rel=)[^>]*>/gi;
  const unsafeNewTabLinks = html.match(newTabLinks);
  if (unsafeNewTabLinks && unsafeNewTabLinks.length > 0) {
    warnings.push(
      `${unsafeNewTabLinks.length} link(s) with target="_blank" missing rel="noopener noreferrer"`,
    );
  }

  return warnings;
}

export function validateHtml(html: string): {
  valid: boolean;
  issues: string[];
  qualityWarnings: string[];
} {
  const issues: string[] = [];
  const qualityWarnings: string[] = [];

  // === Critical issues (errors) ===
  if (!html.includes("<!DOCTYPE html>") && !html.includes("<!doctype html>")) {
    issues.push("Missing DOCTYPE declaration");
  }
  if (!html.includes("<html")) {
    issues.push("Missing <html> tag");
  }
  if (!html.includes("<head>") && !html.includes("<head ")) {
    issues.push("Missing <head> section");
  }
  if (!html.includes("<body>") && !html.includes("<body ")) {
    issues.push("Missing <body> section");
  }
  if (!html.includes("tailwindcss")) {
    issues.push("Missing Tailwind CSS CDN");
  }
  if (!html.includes("alpinejs")) {
    issues.push("Missing Alpine.js CDN");
  }

  // Validate image sources
  const imageValidation = validateImageUrls(html);
  if (!imageValidation.valid) {
    issues.push(...imageValidation.issues);
  }

  // === Quality warnings (non-fatal suggestions) ===
  qualityWarnings.push(...checkDuplicateSections(html));
  qualityWarnings.push(...checkHeroCta(html));
  qualityWarnings.push(...checkSpacingConsistency(html));
  qualityWarnings.push(...checkColorContrast(html));
  qualityWarnings.push(...checkPopsyUrls(html));
  qualityWarnings.push(...checkAccessibility(html));

  // Check for recommended CDNs (soft warnings)
  const hasAosCss = /aos\.css|aos@[^"']*\.css/i.test(html);
  const hasAosJs = /aos\.js|aos@[^"']*\.js/i.test(html);
  const hasLucide = /lucide/i.test(html);

  if (!hasAosCss) {
    qualityWarnings.push("Missing AOS CSS CDN (aos.css) for scroll animations");
  }
  if (!hasAosJs) {
    qualityWarnings.push("Missing AOS JS CDN (aos.js) for scroll animations");
  }
  if (!hasLucide) {
    qualityWarnings.push("Missing Lucide icons CDN for icon support");
  }

  return { valid: issues.length === 0, issues, qualityWarnings };
}
