import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { Env } from "../types.js";
import {
  calculateCreditsFromTokens,
  MAX_RESERVED_CREDITS,
} from "../lib/billing/config.js";
import {
  getCreditBalance,
  reserveCreditsForGeneration,
  finalizeGenerationCredits,
} from "../db/credits.js";
import type { SiteSpec } from "../lib/generation/types.js";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: { data: string; mimeType: string }[];
};

const generate = new Hono<Env>();

/**
 * POST /api/generate
 * Main SSE streaming generation endpoint.
 */
generate.post("/", async (c) => {
  const user = c.get("user");

  const { messages, currentPages, existingSpec, idempotencyKey, projectId } =
    await c.req.json<{
      messages: Message[];
      currentPages?: Record<string, string>;
      existingSpec?: SiteSpec;
      idempotencyKey?: string;
      projectId?: string;
    }>();

  const lastMessage = messages[messages.length - 1];
  const userRequest = lastMessage.content;
  const userImages = lastMessage.images;

  const key = idempotencyKey || crypto.randomUUID();

  // Check credit balance
  const balance = await getCreditBalance(user.id);
  if (balance.availableCredits < MAX_RESERVED_CREDITS) {
    return c.json(
      {
        type: "error",
        error: "INSUFFICIENT_CREDITS",
        availableCredits: balance.availableCredits,
        requiredCredits: MAX_RESERVED_CREDITS,
      },
      402,
    );
  }

  // Reserve credits
  let generationId: string;
  try {
    generationId = await reserveCreditsForGeneration(
      user.id,
      MAX_RESERVED_CREDITS,
      key,
      projectId,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reserve credits";
    return c.json({ type: "error", error: message }, 402);
  }

  const { trackServerEvent } = await import("../lib/posthog/server.js");
  trackServerEvent(user.id, "generation_started", {
    project_id: projectId,
    has_existing_pages: !!currentPages,
    existing_page_count: currentPages ? Object.keys(currentPages).length : 0,
  });

  return streamSSE(c, async (stream) => {
    // Import generation dynamically to avoid loading AI deps at startup
    const { generateWebsite } = await import("../lib/generation/agent.js");
    const { aggregateSiteQuality } = await import(
      "../lib/analytics/html-quality.js"
    );

    let finalUsage:
      | { inputTokens: number; outputTokens: number; totalTokens: number }
      | undefined;
    let finalToolMetrics:
      | {
          editPageCalls: number;
          totalToolCalls: number;
          writePageCalls: number;
          pagesPassedValidation: number;
          pagesFailedValidation: number;
        }
      | undefined;
    let finalPages: Record<string, string> | undefined;
    let finalSpec: SiteSpec | undefined;
    let generationSuccess = false;
    let generationError: string | undefined;

    try {
      // Send generation ID first
      await stream.writeSSE({
        data: JSON.stringify({ type: "generation_id", generationId }),
      });

      for await (const event of generateWebsite(
        userRequest,
        existingSpec,
        currentPages,
        undefined,
        userImages,
      )) {
        if (event.type === "complete") {
          finalUsage = event.usage;
          finalToolMetrics = event.toolMetrics;
          finalPages = event.pages;
          finalSpec = event.spec;
          generationSuccess = true;
        } else if (event.type === "error") {
          finalUsage = event.usage;
          finalToolMetrics = event.toolMetrics;
          generationError = event.error;
        }

        await stream.writeSSE({ data: JSON.stringify(event) });
      }
    } catch (err) {
      console.error("Generation error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      generationError = errorMsg;
      await stream.writeSSE({
        data: JSON.stringify({ type: "error", error: errorMsg }),
      });
    } finally {
      // Finalize credits
      try {
        const actualCredits = finalUsage
          ? calculateCreditsFromTokens(
              finalUsage.inputTokens,
              finalUsage.outputTokens,
            )
          : undefined;

        await finalizeGenerationCredits(
          user.id,
          generationId,
          generationSuccess,
          actualCredits,
          finalUsage?.inputTokens,
          finalUsage?.outputTokens,
          finalUsage?.totalTokens,
          generationError,
        );
      } catch (finalizeErr) {
        console.error("Failed to finalize credits:", finalizeErr);
      }

      // Analytics
      const qualityMetrics =
        finalPages && finalSpec
          ? aggregateSiteQuality(finalPages, finalSpec.colorPalette)
          : null;

      const totalPages = finalPages ? Object.keys(finalPages).length : 0;
      const htmlValidityPercent =
        finalToolMetrics && finalToolMetrics.writePageCalls > 0
          ? Math.round(
              (finalToolMetrics.pagesPassedValidation /
                finalToolMetrics.writePageCalls) *
                100,
            )
          : 0;

      if (generationSuccess) {
        trackServerEvent(user.id, "generation_completed", {
          project_id: projectId,
          input_tokens: finalUsage?.inputTokens,
          output_tokens: finalUsage?.outputTokens,
          credits_used: finalUsage
            ? calculateCreditsFromTokens(
                finalUsage.inputTokens,
                finalUsage.outputTokens,
              )
            : undefined,
          total_pages: totalPages,
          edit_page_calls: finalToolMetrics?.editPageCalls ?? 0,
          total_tool_calls: finalToolMetrics?.totalToolCalls ?? 0,
          pages_passed_validation:
            finalToolMetrics?.pagesPassedValidation ?? 0,
          pages_failed_validation:
            finalToolMetrics?.pagesFailedValidation ?? 0,
          html_validity_percent: htmlValidityPercent,
          avg_palette_consistency:
            qualityMetrics?.avgPaletteConsistency ?? 0,
          structure_quality_percent:
            qualityMetrics?.structureQualityPercent ?? 0,
          cta_clarity_percent: qualityMetrics?.ctaClarityPercent ?? 0,
        });
      } else {
        trackServerEvent(user.id, "generation_failed", {
          project_id: projectId,
          error: generationError,
          edit_page_calls: finalToolMetrics?.editPageCalls ?? 0,
          total_tool_calls: finalToolMetrics?.totalToolCalls ?? 0,
        });
      }

      await stream.writeSSE({ data: "[DONE]" });
    }
  });
});

export default generate;
