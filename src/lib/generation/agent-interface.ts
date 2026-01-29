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

export function validateHtml(html: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

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

  return { valid: issues.length === 0, issues };
}
