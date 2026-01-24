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

  return { valid: issues.length === 0, issues };
}
