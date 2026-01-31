import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  calculateCreditsFromTokens,
  ENHANCE_RESERVED_CREDITS,
} from "@/lib/billing/config";
import {
  finalizeGenerationCredits,
  getCreditBalance,
  reserveCreditsForGeneration,
} from "@/lib/billing/credits";
import { getSkill, type SkillId } from "@/lib/generation/skills";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { skillId, html, filename } = (await req.json()) as {
    skillId: SkillId;
    html: string;
    filename: string;
  };

  const skill = getSkill(skillId);
  if (!skill) {
    return new Response(JSON.stringify({ error: "Invalid skill" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!html || typeof html !== "string") {
    return new Response(JSON.stringify({ error: "HTML content required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check credit balance
  const balance = await getCreditBalance(user.id);
  if (balance.availableCredits < ENHANCE_RESERVED_CREDITS) {
    return new Response(
      JSON.stringify({
        error: "INSUFFICIENT_CREDITS",
        availableCredits: balance.availableCredits,
        requiredCredits: ENHANCE_RESERVED_CREDITS,
      }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  // Reserve credits
  let generationId: string;
  try {
    generationId = await reserveCreditsForGeneration(
      user.id,
      ENHANCE_RESERVED_CREDITS,
      crypto.randomUUID(),
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reserve credits";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const systemPrompt = `You are a web development expert. You will receive HTML and a specific task to improve it.

CRITICAL RULES:
1. Return ONLY the complete, valid HTML - no explanations, no markdown, no code blocks
2. Your response must start with <!DOCTYPE html>
3. Preserve ALL existing functionality, styles, and content
4. Only make changes relevant to the improvement task
5. Do not remove or break any existing features`;

    const userPrompt = `${skill.prompt}

## Current HTML for ${filename}:
${html}

Return the complete improved HTML:`;

    let enhancedHtml: string;
    let inputTokens = 0;
    let outputTokens = 0;

    // Try Anthropic first, fall back to OpenAI
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      enhancedHtml = textBlock?.type === "text" ? textBlock.text : "";
      inputTokens = response.usage.input_tokens;
      outputTokens = response.usage.output_tokens;
    } else if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 16000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      enhancedHtml = response.choices[0]?.message?.content || "";
      inputTokens = response.usage?.prompt_tokens || 0;
      outputTokens = response.usage?.completion_tokens || 0;
    } else {
      throw new Error("No AI API key configured");
    }

    // Clean up response - remove markdown code blocks if present
    enhancedHtml = enhancedHtml.trim();
    if (enhancedHtml.startsWith("```html")) {
      enhancedHtml = enhancedHtml.slice(7);
    } else if (enhancedHtml.startsWith("```")) {
      enhancedHtml = enhancedHtml.slice(3);
    }
    if (enhancedHtml.endsWith("```")) {
      enhancedHtml = enhancedHtml.slice(0, -3);
    }
    enhancedHtml = enhancedHtml.trim();

    // Validate response starts with DOCTYPE
    if (!enhancedHtml.toLowerCase().startsWith("<!doctype html")) {
      throw new Error("Invalid HTML response from AI");
    }

    // Calculate and finalize credits
    const creditsUsed = calculateCreditsFromTokens(inputTokens, outputTokens);
    await finalizeGenerationCredits(
      user.id,
      generationId,
      true, // success
      creditsUsed,
      inputTokens,
      outputTokens,
      inputTokens + outputTokens,
    );

    return new Response(
      JSON.stringify({
        html: enhancedHtml,
        filename,
        skillId,
        creditsUsed,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Enhancement failed";

    // Refund credits on error
    await finalizeGenerationCredits(
      user.id,
      generationId,
      false, // failed
      0,
      0,
      0,
      0,
      errorMessage,
    );

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
