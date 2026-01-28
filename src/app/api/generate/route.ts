import { aggregateSiteQuality } from "@/lib/analytics/html-quality";
import {
  calculateCreditsFromTokens,
  MAX_RESERVED_CREDITS,
} from "@/lib/billing/config";
import {
  finalizeGenerationCredits,
  getCreditBalance,
  reserveCreditsForGeneration,
} from "@/lib/billing/credits";
import {
  generateWebsite,
  type TokenUsage,
  type ToolCallMetrics,
} from "@/lib/generation/agent";
import type { SiteSpec } from "@/lib/generation/types";
import { trackServerEvent } from "@/lib/posthog/server";
import { createClient } from "@/lib/supabase/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({ type: "error", error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages, currentPages, existingSpec, idempotencyKey, projectId } =
    (await req.json()) as {
      messages: Message[];
      currentPages?: Record<string, string>;
      existingSpec?: SiteSpec;
      idempotencyKey?: string;
      projectId?: string;
    };

  const lastMessage = messages[messages.length - 1];
  const userRequest = lastMessage.content;

  // Generate idempotency key if not provided
  const key = idempotencyKey || crypto.randomUUID();

  // Check credit balance first
  const balance = await getCreditBalance(user.id);
  if (balance.availableCredits < MAX_RESERVED_CREDITS) {
    return new Response(
      JSON.stringify({
        type: "error",
        error: "INSUFFICIENT_CREDITS",
        availableCredits: balance.availableCredits,
        requiredCredits: MAX_RESERVED_CREDITS,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  // Reserve credits before starting generation
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
    return new Response(JSON.stringify({ type: "error", error: message }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  // Track usage for finalization
  let finalUsage: TokenUsage | undefined;
  let finalToolMetrics: ToolCallMetrics | undefined;
  let finalPages: Record<string, string> | undefined;
  let finalSpec: SiteSpec | undefined;
  let generationSuccess = false;
  let generationError: string | undefined;

  trackServerEvent(user.id, "generation_started", {
    project_id: projectId,
    has_existing_pages: !!currentPages,
    existing_page_count: currentPages ? Object.keys(currentPages).length : 0,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generateWebsite(
          userRequest,
          existingSpec,
          currentPages,
        )) {
          // Track final usage from complete or error events
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

          const chunk = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        generationError = errorMsg;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`,
          ),
        );
      } finally {
        // Finalize credits based on actual usage
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

        // Calculate quality metrics for analytics
        const qualityMetrics =
          finalPages && finalSpec
            ? aggregateSiteQuality(finalPages, finalSpec.colorPalette)
            : null;

        const totalPages = finalPages ? Object.keys(finalPages).length : 0;
        const htmlValidityPercent =
          finalToolMetrics && finalToolMetrics.generatePageCalls > 0
            ? Math.round(
                (finalToolMetrics.pagesPassedValidation /
                  finalToolMetrics.generatePageCalls) *
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
            fix_page_calls: finalToolMetrics?.fixPageCalls ?? 0,
            total_tool_calls: finalToolMetrics?.totalToolCalls ?? 0,
            pages_passed_validation:
              finalToolMetrics?.pagesPassedValidation ?? 0,
            pages_failed_validation:
              finalToolMetrics?.pagesFailedValidation ?? 0,
            html_validity_percent: htmlValidityPercent,
            avg_palette_consistency: qualityMetrics?.avgPaletteConsistency ?? 0,
            structure_quality_percent:
              qualityMetrics?.structureQualityPercent ?? 0,
            cta_clarity_percent: qualityMetrics?.ctaClarityPercent ?? 0,
          });
        } else {
          trackServerEvent(user.id, "generation_failed", {
            project_id: projectId,
            error: generationError,
            fix_page_calls: finalToolMetrics?.fixPageCalls ?? 0,
            total_tool_calls: finalToolMetrics?.totalToolCalls ?? 0,
          });
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
