import {
  Agent,
  type AgentEvent,
  type AgentTool,
  type AgentToolResult,
} from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import { Type } from "@sinclair/typebox";
import { COMPONENT_EXAMPLES } from "./components";
import { DESIGN_SYSTEM_PROMPT } from "./prompts";
import type { PageSpec, SiteSpec } from "./types";

const ColorPaletteSchema = Type.Object({
  primary: Type.String({ description: "Primary brand color (hex)" }),
  secondary: Type.String({ description: "Secondary color (hex)" }),
  accent: Type.String({ description: "Accent color (hex)" }),
  background: Type.String({ description: "Background color (hex)" }),
  text: Type.String({ description: "Text color (hex)" }),
});

const SectionSchema = Type.Object({
  type: Type.String({
    description:
      "Section type: hero, features, testimonials, pricing, cta, about, team, gallery, contact, faq, stats, logos, process, services, menu, footer",
  }),
  headline: Type.Optional(Type.String({ description: "Section headline" })),
  subheadline: Type.Optional(
    Type.String({ description: "Supporting subheadline" }),
  ),
  content: Type.String({ description: "Description of section content" }),
  layout: Type.String({
    description: "Layout style: centered, split, grid, cards, list",
  }),
  elements: Type.Array(Type.String(), {
    description: "Specific elements like buttons, images, icons, forms",
  }),
});

const PageSchema = Type.Object({
  filename: Type.String({ description: "Filename like index.html" }),
  title: Type.String({ description: "Page title" }),
  purpose: Type.String({ description: "What this page accomplishes" }),
  sections: Type.Array(SectionSchema),
});

const PlanSiteParams = Type.Object({
  name: Type.String({ description: "Business/project name" }),
  tagline: Type.String({ description: "Compelling tagline" }),
  type: Type.Union(
    [
      Type.Literal("landing"),
      Type.Literal("portfolio"),
      Type.Literal("business"),
      Type.Literal("saas"),
      Type.Literal("restaurant"),
      Type.Literal("agency"),
      Type.Literal("blog"),
      Type.Literal("ecommerce"),
    ],
    { description: "Site type" },
  ),
  industry: Type.String({ description: "Specific industry" }),
  audience: Type.String({ description: "Target audience description" }),
  tone: Type.Union(
    [
      Type.Literal("professional"),
      Type.Literal("casual"),
      Type.Literal("playful"),
      Type.Literal("luxurious"),
      Type.Literal("minimal"),
    ],
    { description: "Tone and style" },
  ),
  colorPalette: ColorPaletteSchema,
  typography: Type.Object({
    headingStyle: Type.Union([
      Type.Literal("bold"),
      Type.Literal("elegant"),
      Type.Literal("modern"),
      Type.Literal("classic"),
    ]),
    bodyFont: Type.Union([
      Type.Literal("sans"),
      Type.Literal("serif"),
      Type.Literal("mono"),
    ]),
  }),
  pages: Type.Array(PageSchema, { description: "Pages to generate" }),
  features: Type.Array(Type.String(), {
    description: "Key features/USPs to highlight",
  }),
});

const GeneratePageParams = Type.Object({
  filename: Type.String({ description: "Filename like index.html" }),
  html: Type.String({
    description:
      "Complete HTML content for the page. Must be valid, self-contained HTML with DOCTYPE, Tailwind CDN, and Alpine.js.",
  }),
});

const FixPageParams = Type.Object({
  filename: Type.String({ description: "Filename to fix" }),
  issue: Type.String({ description: "What issue was found" }),
  fixedHtml: Type.String({ description: "Corrected HTML content" }),
});

const ValidateSiteParams = Type.Object({
  pages: Type.Array(
    Type.Object({
      filename: Type.String(),
      issues: Type.Array(Type.String()),
      suggestions: Type.Array(Type.String()),
    }),
  ),
  overallQuality: Type.Union([
    Type.Literal("excellent"),
    Type.Literal("good"),
    Type.Literal("needs_improvement"),
  ]),
  summary: Type.String({ description: "Overall assessment" }),
});

interface GenerationState {
  spec: SiteSpec | null;
  pages: Record<string, string>;
  validationPassed: boolean;
}

function validateHtml(html: string): { valid: boolean; issues: string[] } {
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

interface PageDetails {
  filename: string;
  html: string;
  valid?: boolean;
  issues?: string[];
}

function createTools(state: GenerationState): AgentTool[] {
  const planSiteTool: AgentTool<typeof PlanSiteParams, { spec: SiteSpec }> = {
    name: "plan_site",
    label: "Plan Website",
    description: `Create a detailed plan for the website. Call this FIRST before generating any pages.
    
Be SPECIFIC and OPINIONATED. Make real design decisions:
- Choose colors that work harmoniously and match the industry
- Plan sections that would actually convert visitors
- Think about information hierarchy and trust signals`,
    parameters: PlanSiteParams,
    execute: async (
      _toolCallId,
      params,
    ): Promise<AgentToolResult<{ spec: SiteSpec }>> => {
      const spec: SiteSpec = {
        name: params.name,
        tagline: params.tagline,
        type: params.type,
        industry: params.industry,
        audience: params.audience,
        tone: params.tone,
        colorPalette: params.colorPalette,
        typography: params.typography,
        pages: params.pages as PageSpec[],
        features: params.features,
      };

      state.spec = spec;

      return {
        content: [
          {
            type: "text",
            text: `Site plan created for "${spec.name}". Now generate each page using generate_page.

Pages to generate:
${spec.pages.map((p) => `- ${p.filename}: ${p.purpose}`).join("\n")}

Use these exact colors:
- Primary: ${spec.colorPalette.primary}
- Secondary: ${spec.colorPalette.secondary}
- Accent: ${spec.colorPalette.accent}
- Background: ${spec.colorPalette.background}
- Text: ${spec.colorPalette.text}`,
          },
        ],
        details: { spec },
      };
    },
  };

  const generatePageTool: AgentTool<typeof GeneratePageParams, PageDetails> = {
    name: "generate_page",
    label: "Generate Page",
    description: `Generate complete HTML for a single page. The HTML must be:
- Complete and self-contained with DOCTYPE
- Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Alpine.js: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
- Use the exact colors from the site plan
- Follow modern design patterns with gradients, glassmorphism, and micro-interactions`,
    parameters: GeneratePageParams,
    execute: async (
      _toolCallId,
      params,
    ): Promise<AgentToolResult<PageDetails>> => {
      const { filename, html } = params;
      const validation = validateHtml(html);

      if (!validation.valid) {
        return {
          content: [
            {
              type: "text",
              text: `HTML validation failed for ${filename}:
${validation.issues.map((i) => `- ${i}`).join("\n")}

Please fix these issues using the fix_page tool.`,
            },
          ],
          details: { filename, html, valid: false, issues: validation.issues },
        };
      }

      state.pages[filename] = html;

      return {
        content: [
          {
            type: "text",
            text: `Successfully generated ${filename} (${html.length} chars). Page saved.`,
          },
        ],
        details: { filename, html, valid: true },
      };
    },
  };

  const fixPageTool: AgentTool<typeof FixPageParams, PageDetails> = {
    name: "fix_page",
    label: "Fix Page",
    description:
      "Fix issues in a generated page. Use this when validation fails or improvements are needed.",
    parameters: FixPageParams,
    execute: async (
      _toolCallId,
      params,
    ): Promise<AgentToolResult<PageDetails>> => {
      const { filename, fixedHtml } = params;
      const validation = validateHtml(fixedHtml);

      if (!validation.valid) {
        return {
          content: [
            {
              type: "text",
              text: `Fix still has issues for ${filename}:
${validation.issues.map((i) => `- ${i}`).join("\n")}

Please try again.`,
            },
          ],
          details: {
            filename,
            html: fixedHtml,
            valid: false,
            issues: validation.issues,
          },
        };
      }

      state.pages[filename] = fixedHtml;

      return {
        content: [
          {
            type: "text",
            text: `Fixed ${filename} successfully.`,
          },
        ],
        details: { filename, html: fixedHtml, valid: true },
      };
    },
  };

  const validateSiteTool: AgentTool<
    typeof ValidateSiteParams,
    { passed: boolean }
  > = {
    name: "validate_site",
    label: "Validate Site",
    description:
      "Validate the complete site for quality and consistency. Call this after all pages are generated.",
    parameters: ValidateSiteParams,
    execute: async (
      _toolCallId,
      params,
    ): Promise<AgentToolResult<{ passed: boolean }>> => {
      const hasIssues = params.pages.some((p) => p.issues.length > 0);
      const needsImprovement = params.overallQuality === "needs_improvement";

      if (hasIssues || needsImprovement) {
        state.validationPassed = false;
        return {
          content: [
            {
              type: "text",
              text: `Validation found issues:
${params.summary}

${params.pages
  .filter((p) => p.issues.length > 0)
  .map((p) => `${p.filename}:\n${p.issues.map((i) => `  - ${i}`).join("\n")}`)
  .join("\n\n")}

Please fix these issues using fix_page.`,
            },
          ],
          details: { passed: false },
        };
      }

      state.validationPassed = true;
      return {
        content: [
          {
            type: "text",
            text: `Validation passed. ${params.summary}`,
          },
        ],
        details: { passed: true },
      };
    },
  };

  return [
    planSiteTool as unknown as AgentTool,
    generatePageTool as unknown as AgentTool,
    fixPageTool as unknown as AgentTool,
    validateSiteTool as unknown as AgentTool,
  ];
}

const AGENT_SYSTEM_PROMPT = `You are an expert website builder agent. Your job is to create stunning, production-ready websites.

## YOUR WORKFLOW
1. FIRST: Call plan_site to create a detailed site plan with colors, pages, and sections
2. THEN: Call generate_page for EACH page in your plan, one at a time
3. IF any page fails validation: Call fix_page to correct the issues
4. FINALLY: Call validate_site to check overall quality
5. IF validation finds issues: Fix them with fix_page and re-validate

## CRITICAL RULES
- Always plan before generating
- Generate ONE page at a time
- Each page must be complete, self-contained HTML
- Use the EXACT colors from your plan
- Include both Tailwind CSS and Alpine.js CDNs
- Fix any validation errors before proceeding
- Keep iterating until validate_site passes

${DESIGN_SYSTEM_PROMPT}

${COMPONENT_EXAMPLES}

IMPORTANT: Use these component examples as inspiration. Adapt colors, content, and structure to match the specific project. Don't copy verbatim—create unique variations.`;

export type GenerationEvent =
  | { type: "status"; message: string }
  | { type: "spec"; spec: SiteSpec }
  | { type: "page"; filename: string; html: string }
  | { type: "thinking"; content: string }
  | { type: "complete"; pages: Record<string, string>; spec: SiteSpec }
  | { type: "error"; error: string };

export async function* generateWebsite(
  userRequest: string,
  existingSpec?: SiteSpec,
  existingPages?: Record<string, string>,
): AsyncGenerator<GenerationEvent> {
  const state: GenerationState = {
    spec: existingSpec || null,
    pages: existingPages ? { ...existingPages } : {},
    validationPassed: false,
  };

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

  const model = hasAnthropicKey
    ? getModel("anthropic", "claude-sonnet-4-20250514")
    : getModel("openai", "gpt-4o");

  const apiKey = hasAnthropicKey
    ? process.env.ANTHROPIC_API_KEY
    : process.env.OPENAI_API_KEY;

  const tools = createTools(state);

  const agent = new Agent({
    initialState: {
      systemPrompt: AGENT_SYSTEM_PROMPT,
      model,
      tools,
      thinkingLevel: "low",
      messages: [],
    },
    getApiKey: () => apiKey,
  });

  yield { type: "status", message: "Starting website generation..." };

  let prompt: string;

  if (existingSpec && existingPages && Object.keys(existingPages).length > 0) {
    const pagesText = Object.entries(existingPages)
      .map(([filename, content]) => `---FILE: ${filename}---\n${content}`)
      .join("\n\n");

    prompt = `## CURRENT WEBSITE
The site already has these pages:
${pagesText}

## EXISTING SPEC
${JSON.stringify(existingSpec, null, 2)}

## MODIFICATION REQUEST
${userRequest}

Apply the requested changes. You may need to call generate_page or fix_page to update the pages.`;
  } else {
    prompt = userRequest;
  }

  const eventQueue: GenerationEvent[] = [];
  let resolveWait: (() => void) | null = null;
  let agentDone = false;

  const unsubscribe = agent.subscribe((event: AgentEvent) => {
    let newEvent: GenerationEvent | null = null;

    switch (event.type) {
      case "agent_start":
        newEvent = { type: "status", message: "Planning your website..." };
        break;

      case "tool_execution_start":
        if (event.toolName === "plan_site") {
          newEvent = { type: "status", message: "Creating site plan..." };
        } else if (event.toolName === "generate_page") {
          const filename =
            (event.args as { filename?: string })?.filename || "page";
          newEvent = {
            type: "status",
            message: `Generating ${filename}...`,
          };
        } else if (event.toolName === "fix_page") {
          newEvent = { type: "status", message: "Fixing issues..." };
        } else if (event.toolName === "validate_site") {
          newEvent = { type: "status", message: "Validating site..." };
        }
        break;

      case "tool_execution_end": {
        const details = event.result?.details as
          | Record<string, unknown>
          | undefined;
        if (details) {
          if (details.spec) {
            newEvent = { type: "spec", spec: details.spec as SiteSpec };
          }
          if (details.filename && details.html && details.valid) {
            eventQueue.push({
              type: "page",
              filename: details.filename as string,
              html: details.html as string,
            });
          }
        }
        break;
      }

      case "message_update": {
        const msg = event.message;
        if (msg && "content" in msg && Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === "thinking" && "thinking" in block) {
              newEvent = { type: "thinking", content: block.thinking };
            }
          }
        }
        break;
      }

      case "agent_end":
        agentDone = true;
        break;
    }

    if (newEvent) {
      eventQueue.push(newEvent);
    }
    if (resolveWait) {
      resolveWait();
      resolveWait = null;
    }
  });

  const runPromise = agent.prompt(prompt).catch((err) => {
    eventQueue.push({
      type: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    });
    agentDone = true;
    if (resolveWait) {
      resolveWait();
      resolveWait = null;
    }
  });

  while (!agentDone || eventQueue.length > 0) {
    if (eventQueue.length > 0) {
      const ev = eventQueue.shift();
      if (ev) yield ev;
    } else if (!agentDone) {
      await new Promise<void>((resolve) => {
        resolveWait = resolve;
        setTimeout(resolve, 100);
      });
    }
  }

  await runPromise;
  unsubscribe();

  if (Object.keys(state.pages).length > 0 && state.spec) {
    yield { type: "complete", pages: state.pages, spec: state.spec };
  } else if (Object.keys(state.pages).length > 0) {
    const minimalSpec: SiteSpec = {
      name: "Website",
      tagline: "",
      type: "landing",
      industry: "general",
      audience: "general",
      tone: "professional",
      colorPalette: {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#1f2937",
      },
      typography: { headingStyle: "modern", bodyFont: "sans" },
      pages: [],
      features: [],
    };
    yield { type: "complete", pages: state.pages, spec: minimalSpec };
  } else {
    yield { type: "error", error: "No pages were generated" };
  }
}
