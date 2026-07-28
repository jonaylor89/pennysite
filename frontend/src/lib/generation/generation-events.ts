import type { SiteSpec } from "./types";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ToolCallMetrics {
  totalToolCalls: number;
  writePageCalls: number;
  editPageCalls: number;
  validateSiteCalls: number;
  pagesPassedValidation: number;
  pagesFailedValidation: number;
  fixAttemptsPerPage: Record<string, number>;
}

export type ToolActivityEvent = {
  type: "tool_activity";
  toolName: string;
  status: "start" | "end";
  args?: Record<string, unknown>;
  result?: {
    success: boolean;
    message?: string;
  };
};

export type GenerationEvent =
  | { type: "status"; message: string }
  | { type: "spec"; spec: SiteSpec }
  | { type: "page"; filename: string; html: string }
  | { type: "thinking"; content: string }
  | ToolActivityEvent
  | { type: "usage"; usage: TokenUsage }
  | {
      type: "complete";
      pages: Record<string, string>;
      spec: SiteSpec;
      usage: TokenUsage;
      toolMetrics: ToolCallMetrics;
    }
  | {
      type: "error";
      error: string;
      usage?: TokenUsage;
      toolMetrics?: ToolCallMetrics;
    };
