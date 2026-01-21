import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { PRODUCT_INTERPRETER_PROMPT } from "./prompts";

const SectionSchema = z.object({
  type: z.string(),
  headline: z
    .string()
    .describe("Section headline, or empty string if not applicable"),
  subheadline: z
    .string()
    .describe("Supporting text, or empty string if not applicable"),
  content: z.string(),
  layout: z.string(),
  elements: z.array(z.string()),
});

const PageSchema = z.object({
  filename: z.string(),
  title: z.string(),
  purpose: z.string(),
  sections: z.array(SectionSchema),
});

const SiteSpecSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  type: z.enum([
    "landing",
    "portfolio",
    "business",
    "saas",
    "restaurant",
    "agency",
    "blog",
    "ecommerce",
  ]),
  industry: z.string(),
  audience: z.string(),
  tone: z.enum(["professional", "casual", "playful", "luxurious", "minimal"]),
  colorPalette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  typography: z.object({
    headingStyle: z.enum(["bold", "elegant", "modern", "classic"]),
    bodyFont: z.enum(["sans", "serif", "mono"]),
  }),
  pages: z.array(PageSchema),
  features: z.array(z.string()),
});

export type SiteSpec = z.infer<typeof SiteSpecSchema>;

export async function interpretProductRequest(
  userRequest: string,
): Promise<SiteSpec> {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: SiteSpecSchema,
    system: PRODUCT_INTERPRETER_PROMPT,
    prompt: userRequest,
  });

  return result.object;
}
