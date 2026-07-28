import { Hono } from "hono";
import {
	finalizeGenerationCredits,
	getCreditBalance,
	reserveCreditsForGeneration,
} from "../db/credits.js";
import {
	calculateCreditsFromTokens,
	ENHANCE_RESERVED_CREDITS,
} from "../lib/billing/config.js";
import type { Env } from "../types.js";

const enhance = new Hono<Env>();

/**
 * POST /api/enhance
 * Single-page skill enhancement (SEO, accessibility, performance, dark mode).
 */
enhance.post("/", async (c) => {
	const user = c.get("user");

	const { html, skill, projectId, idempotencyKey } = await c.req.json<{
		html: string;
		skill: string;
		projectId?: string;
		idempotencyKey?: string;
	}>();

	if (!html || !skill) {
		return c.json({ error: "html and skill are required" }, 400);
	}

	const key = idempotencyKey || crypto.randomUUID();

	// Check credits
	const balance = await getCreditBalance(user.id);
	if (balance.availableCredits < ENHANCE_RESERVED_CREDITS) {
		return c.json(
			{
				error: "INSUFFICIENT_CREDITS",
				availableCredits: balance.availableCredits,
				requiredCredits: ENHANCE_RESERVED_CREDITS,
			},
			402,
		);
	}

	let generationId: string;
	try {
		generationId = await reserveCreditsForGeneration(
			user.id,
			ENHANCE_RESERVED_CREDITS,
			key,
			projectId,
		);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "Failed to reserve credits";
		return c.json({ error: message }, 402);
	}

	try {
		const { SKILLS } = await import("../lib/generation/skills.js");
		const skillDef = Object.values(SKILLS).find((s) => s.id === skill);
		if (!skillDef) {
			throw new Error(`Unknown skill: ${skill}`);
		}

		const prompt = `${skillDef.prompt}\n\n## HTML to improve\n\n${html}`;
		let enhancedHtml: string;
		let inputTokens = 0;
		let outputTokens = 0;

		// Try Anthropic first, fall back to OpenAI
		if (process.env.ANTHROPIC_API_KEY) {
			const Anthropic = (await import("@anthropic-ai/sdk")).default;
			const client = new Anthropic();
			const response = await client.messages.create({
				model: "claude-sonnet-4-20250514",
				max_tokens: 16000,
				messages: [{ role: "user", content: prompt }],
			});
			enhancedHtml =
				response.content[0].type === "text" ? response.content[0].text : "";
			inputTokens = response.usage.input_tokens;
			outputTokens = response.usage.output_tokens;
		} else {
			const { openai } = await import("@ai-sdk/openai");
			const { generateText } = await import("ai");
			const result = await generateText({
				model: openai("gpt-5.6-terra"),
				prompt,
			});
			enhancedHtml = result.text;
			inputTokens = result.usage?.inputTokens ?? 0;
			outputTokens = result.usage?.outputTokens ?? 0;
		}

		// Strip markdown fences if present
		enhancedHtml = enhancedHtml
			.replace(/^```html\n?/, "")
			.replace(/\n?```$/, "")
			.trim();

		const actualCredits = calculateCreditsFromTokens(inputTokens, outputTokens);

		await finalizeGenerationCredits(
			user.id,
			generationId,
			true,
			actualCredits,
			inputTokens,
			outputTokens,
			inputTokens + outputTokens,
		);

		return c.json({ html: enhancedHtml, creditsUsed: actualCredits });
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : "Enhancement failed";

		await finalizeGenerationCredits(
			user.id,
			generationId,
			false,
			undefined,
			undefined,
			undefined,
			undefined,
			errorMsg,
		);

		return c.json({ error: errorMsg }, 500);
	}
});

export default enhance;
