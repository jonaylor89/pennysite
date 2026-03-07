"use client";

import { useState } from "react";

export type ActivityItem = {
  id: string;
  type: "tool" | "thinking" | "status";
  toolName?: string;
  status: "running" | "complete" | "error";
  message: string;
  details?: string;
  timestamp: number;
};

type AgentActivityLogProps = {
  activities: ActivityItem[];
  isGenerating: boolean;
  currentPhase?: string;
};

const TOOL_DISPLAY_NAMES: Record<string, { name: string; icon: string }> = {
  plan_site: { name: "Planning site structure", icon: "📋" },
  write_page: { name: "Writing page", icon: "📄" },
  edit_page: { name: "Editing page", icon: "✏️" },
  read_page: { name: "Reading page", icon: "👁" },
  validate_site: { name: "Validating site", icon: "✓" },
};

export function AgentActivityLog({
  activities,
  isGenerating,
  currentPhase,
}: AgentActivityLogProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const runningCount = activities.filter((a) => a.status === "running").length;
  const completeCount = activities.filter(
    (a) => a.status === "complete",
  ).length;

  if (activities.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <div className="mr-4 overflow-hidden rounded-control border border-border-hover bg-surface-alt">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-fg-strong transition-colors hover:bg-surface-hover/50"
      >
        <div className="flex items-center gap-2">
          {isGenerating ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-success-muted opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-pill bg-success" />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-pill bg-fg-subtle" />
          )}
          <span className="font-medium">
            {isGenerating ? "Agent Working" : "Generation Complete"}
          </span>
          {activities.length > 0 && (
            <span className="text-xs text-fg-subtle">
              {completeCount}/{activities.length} steps
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-fg-subtle transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="max-h-64 overflow-y-auto border-t border-border-hover">
          {activities.length === 0 && isGenerating && currentPhase && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-fg-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-success" />
              {currentPhase}
            </div>
          )}
          {activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
          {isGenerating && runningCount === 0 && activities.length > 0 && (
            <div className="flex items-center gap-2 border-t border-border-hover/50 px-3 py-2 text-sm text-fg-subtle">
              <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-success" />
              {currentPhase || "Processing..."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const [showDetails, setShowDetails] = useState(false);

  const toolInfo = activity.toolName
    ? TOOL_DISPLAY_NAMES[activity.toolName]
    : null;
  const icon = toolInfo?.icon || "⚡";

  return (
    <div className="border-t border-border-hover/50 first:border-t-0">
      <button
        type="button"
        onClick={() => activity.details && setShowDetails(!showDetails)}
        disabled={!activity.details}
        className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm ${
          activity.details
            ? "cursor-pointer hover:bg-surface-hover/30"
            : "cursor-default"
        }`}
      >
        <span className="mt-0.5 flex-shrink-0">
          {activity.status === "running" ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-pill border-2 border-fg-subtle border-t-success" />
          ) : activity.status === "error" ? (
            <span className="text-danger-muted">✗</span>
          ) : (
            <span className="text-success-muted">✓</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span>{icon}</span>
            <span
              className={`${
                activity.status === "running"
                  ? "text-fg-strong"
                  : activity.status === "error"
                    ? "text-danger-muted"
                    : "text-fg-muted"
              }`}
            >
              {activity.message}
            </span>
          </div>
        </div>
        {activity.details && (
          <svg
            className={`h-4 w-4 flex-shrink-0 text-fg-subtle transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>
      {showDetails && activity.details && (
        <div className="bg-surface-alt px-3 py-2 font-mono text-xs text-fg-subtle">
          {activity.details}
        </div>
      )}
    </div>
  );
}
