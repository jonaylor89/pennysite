import type {
  AgentEvent,
  AgentTool,
  AgentToolResult,
} from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import { Type } from "@sinclair/typebox";
import {
  type AgentFactory,
  type AgentLike,
  createDefaultAgentFactory,
  type GenerationDeps,
  type GenerationState,
  type PageDetails,
  validateHtml,
} from "./agent-interface";
import { COMPONENT_EXAMPLES } from "./components";
import { DESIGN_SYSTEM_PROMPT } from "./prompts";
import type { PageSpec, SiteSpec } from "./types";

export type {
  AgentFactory,
  AgentLike,
  GenerationDeps,
  GenerationState,
  PageDetails,
} from "./agent-interface";
export { validateHtml } from "./agent-interface";

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
    {
      description:
        "Site type. Must be exactly one of: landing, portfolio, business, saas, restaurant, agency, blog, ecommerce",
    },
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
    {
      description:
        "Tone and style. Must be exactly one of: professional, casual, playful, luxurious, minimal",
    },
  ),
  colorPalette: ColorPaletteSchema,
  typography: Type.Object({
    headingStyle: Type.Union(
      [
        Type.Literal("bold"),
        Type.Literal("elegant"),
        Type.Literal("modern"),
        Type.Literal("classic"),
      ],
      { description: "Must be exactly one of: bold, elegant, modern, classic" },
    ),
    bodyFont: Type.Union(
      [Type.Literal("sans"), Type.Literal("serif"), Type.Literal("mono")],
      { description: "Must be exactly one of: sans, serif, mono" },
    ),
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

const ReportStatusParams = Type.Object({
  message: Type.String({
    description:
      "Short, user-friendly progress message shown in the UI (e.g. 'Designing site structure', 'Writing page content').",
  }),
});

export function createTools(state: GenerationState): AgentTool[] {
  const planSiteTool: AgentTool<typeof PlanSiteParams, { spec: SiteSpec }> = {
    name: "plan_site",
    label: "Plan Website",
    description: `Create a detailed plan for the website. Call this FIRST before generating any pages.

Be SPECIFIC and OPINIONATED. This is where you make the site unique:

COLORS: Don't pick safe defaults. A law firm doesn't need to be navy blue. A coffee shop doesn't need brown.
- What unexpected color would make this brand stand out?
- What emotion does the color palette evoke?

STRUCTURE: Don't default to hero → features → testimonials → CTA.
- What information does THIS audience need first?
- What's the most important action visitors should take?

CONTENT: Plan specific, believable content.
- Headlines that communicate value, not just "Welcome to X"
- Testimonials with specific details (names, companies, concrete results)
- Features that matter to the target audience

PERSONALITY: What's the ONE thing that makes this site memorable?
- A distinctive layout choice?
- An unusual typography pairing?
- A bold color accent?`,
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

  const reportStatusTool: AgentTool<
    typeof ReportStatusParams,
    { ok: boolean }
  > = {
    name: "report_status",
    label: "Report Status",
    description:
      "Describe the high-level progress to the user. Report only user-facing phases of work (planning, designing, content, layout, validation, etc.) using short, user-friendly phrases. Focus on what is being built or decided, not internal implementation. Never reference tools, models, APIs, or system behavior. Do not expose reasoning or technical details.",
    parameters: ReportStatusParams,
    execute: async (): Promise<AgentToolResult<{ ok: boolean }>> => ({
      content: [{ type: "text", text: "Status reported." }],
      details: { ok: true },
    }),
  };

  return [
    planSiteTool as unknown as AgentTool,
    reportStatusTool as unknown as AgentTool,
    generatePageTool as unknown as AgentTool,
    fixPageTool as unknown as AgentTool,
    validateSiteTool as unknown as AgentTool,
  ];
}

export const AGENT_SYSTEM_PROMPT = `You are a senior web designer with 15 years of experience creating award-winning websites. You have strong opinions and make bold design choices.

## YOUR CREATIVE PHILOSOPHY

Every website tells a story. Before you write any HTML, you must answer:
1. What makes THIS business/project unique? (Not just "it's a coffee shop" but "it's a third-wave coffee roaster focused on single-origin beans")
2. What emotion should visitors feel in the first 3 seconds?
3. What's the ONE design element that will make this site memorable?

You REFUSE to create generic, template-looking websites. If you catch yourself making something that could work for "any business in this category," stop and make it more specific.

## YOUR WORKFLOW

### Progress feedback (report_status)
ALWAYS call report_status before calling any other tool so the user sees progress as you work. You may call report_status more than once during long steps so the user gets steady, helpful feedback. Examples:
- Before plan_site: report_status("Designing site structure") then call plan_site
- During generate_page: call report_status one or more times with messages like "Building [filename]", "Writing page content", "Building UI components", "Styling sections" to provide steady feedback
- Before fix_page: report_status("Fixing issues") then call fix_page
- Before validate_site: report_status("Validating site") then call validate_site
Keep messages short (a few words) and action-oriented.

### For NEW websites (no existing pages provided):
1. Call plan_site to create a detailed site plan. Be OPINIONATED about colors, tone, and structure. Don't pick safe defaults.
2. Call generate_page for EACH page in your plan, one at a time. Each page should feel cohesive but not identical.
3. If any page fails validation: call fix_page to correct the issues.
4. Call validate_site to check overall quality.
5. If validation finds issues: Fix them with fix_page and re-validate.

### For MODIFYING existing websites (when pages are already provided):
1. DO NOT call plan_site — the site is already planned
2. Analyze the user's modification request (color changes, content edits, layout tweaks, etc.)
3. For EACH page that needs changes: Call fix_page with the filename and the complete updated HTML
4. You MUST call fix_page for every page you want to modify — just describing changes does nothing
5. After all fixes, call validate_site to verify quality

## CRITICAL RULES
- For NEW sites: Always plan before generating
- For MODIFICATIONS: Skip planning, go straight to fix_page
- Generate ONE page at a time
- Each page must be complete, self-contained HTML
- Use the EXACT colors from your plan consistently
- Include both Tailwind CSS and Alpine.js CDNs
- Fix any validation errors before proceeding
- Keep iterating until validate_site passes
- NEVER ask clarifying questions — just make your best interpretation and apply changes

## DESIGN ANTI-PATTERNS (Never do these)

❌ "Welcome to [Business Name]" — This is lazy. Write a headline that communicates VALUE.
❌ Generic testimonials like "Great service!" or "Highly recommend!" — Write specific, believable quotes.
❌ Using dark gradient + floating orbs for EVERY site — Match the aesthetic to the brand.
❌ Same section order every time (hero → features → testimonials → CTA) — Vary the structure.
❌ Placeholder content that adds nothing — Every word should earn its place.

## TEXT-FORWARD DESIGN (Critical!)

⚠️ **NO EXTERNAL IMAGES** — Never use Unsplash, Pexels, placeholder.com, or ANY stock photo URLs. They break and make sites look unprofessional.

Only these image sources are allowed:
1. **Popsy SVGs**: https://illustrations.popsy.co/{color}/{name}.svg
   - Colors: amber, blue, gray, green, pink, purple, red, yellow  
   - Names: app-launch, working-remotely, designer, developer-activity, success, freelancer, meditation, skateboard, surfer, taking-selfie, trophy, home-office, business-deal, remote-work, productive-work, product-launch, work-from-home, student, teaching, creative-work, cup-of-tea, coffee-break
2. **Inline SVGs**: Draw icons and decorative elements directly in the HTML
3. **CSS/Tailwind**: Gradients, shapes, and patterns via classes
4. **Undraw-style SVGs**: Reference https://undraw.co/illustrations for style inspiration (download and inline the SVGs, don't hotlink)
5. **CSS Shapes**: Blob shapes using clip-path or creative border-radius (e.g., \`border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%\`)
6. **Gradient Orbs**: Positioned absolute blurred divs for ambient backgrounds:
   \`\`\`html
   <div class="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
   \`\`\`
7. **Pattern Backgrounds**: Subtle patterns using repeating-linear-gradient:
   \`\`\`css
   background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px);
   \`\`\`

Instead of photos, create visual impact with:
- BOLD typography as the visual centerpiece
- Color blocks, gradients, and whitespace
- Inline SVG icons for features and UI elements
- Generous padding and margins

## MICROINTERACTIONS & POLISH

Elevate the user experience with thoughtful animations and micro-interactions:

### Hover Animations on Cards
\`\`\`html
<div class="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
  <!-- card content -->
</div>
\`\`\`

### Scroll Fade-ins with Alpine.js
Use intersection observer for elements that animate in on scroll:
\`\`\`html
<div x-data="{ shown: false }" x-intersect="shown = true" 
     :class="shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
     class="transition-all duration-700">
  <!-- content fades in when scrolled into view -->
</div>
\`\`\`

### Button Hover States
\`\`\`html
<button class="transition-all duration-200 hover:scale-105 hover:bg-opacity-90 active:scale-95">
  Get Started
</button>
\`\`\`

### Staggered Animations for Grid Items
\`\`\`html
<div class="grid grid-cols-3 gap-6">
  <div class="transition-all duration-500 delay-0 ...">Item 1</div>
  <div class="transition-all duration-500 delay-100 ...">Item 2</div>
  <div class="transition-all duration-500 delay-200 ...">Item 3</div>
</div>
\`\`\`

### Link Underline Animations
\`\`\`html
<a href="#" class="relative group">
  Learn More
  <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
</a>
\`\`\`

## ICON LIBRARIES

All icons MUST be inline SVG — never use external icon fonts or image URLs.

### Heroicons (Common Examples)
Use these inline SVG patterns for common icons:

**Arrow Right:**
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
</svg>
\`\`\`

**Check:**
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
</svg>
\`\`\`

**Star:**
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</svg>
\`\`\`

**Menu (Hamburger):**
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
</svg>
\`\`\`

**X (Close):**
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
\`\`\`

**Chevron Down:**
\`\`\`html
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
</svg>
\`\`\`

For Lucide-style icons, follow the same inline SVG pattern with 24x24 viewBox and stroke-based paths. Always use \`currentColor\` for strokes/fills so icons inherit text color.

${DESIGN_SYSTEM_PROMPT}

${COMPONENT_EXAMPLES}

Remember: Study the component examples for PRINCIPLES and QUALITY, then create ORIGINAL designs tailored to each specific project. The examples show the level of craft expected—not templates to copy.`;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ToolCallMetrics {
  totalToolCalls: number;
  generatePageCalls: number;
  fixPageCalls: number;
  validateSiteCalls: number;
  pagesPassedValidation: number;
  pagesFailedValidation: number;
  fixAttemptsPerPage: Record<string, number>;
}

export type GenerationEvent =
  | { type: "status"; message: string }
  | { type: "spec"; spec: SiteSpec }
  | { type: "page"; filename: string; html: string }
  | { type: "thinking"; content: string }
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

export async function* generateWebsite(
  userRequest: string,
  existingSpec?: SiteSpec,
  existingPages?: Record<string, string>,
  deps?: GenerationDeps,
): AsyncGenerator<GenerationEvent> {
  const state: GenerationState = {
    spec: existingSpec || null,
    pages: existingPages ? { ...existingPages } : {},
    validationPassed: false,
  };

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

  const model =
    deps?.model ??
    (hasAnthropicKey
      ? getModel("anthropic", "claude-sonnet-4-20250514")
      : getModel("openai", "gpt-4o"));

  const apiKey =
    deps?.apiKey ??
    (hasAnthropicKey
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY);

  const tools = createTools(state);

  const agentFactory: AgentFactory =
    deps?.agentFactory ?? createDefaultAgentFactory();

  const agent: AgentLike = agentFactory(
    {
      systemPrompt: AGENT_SYSTEM_PROMPT,
      model,
      tools,
      thinkingLevel: "low",
      messages: [],
    },
    () => apiKey,
  );

  yield { type: "status", message: "Starting website generation" };

  // === AGENT DEBUG LOGGING ===
  const isModification =
    existingSpec && existingPages && Object.keys(existingPages).length > 0;
  console.log(`\n${"=".repeat(80)}`);
  console.log("[AGENT] Generation started");
  console.log("[AGENT] Mode:", isModification ? "MODIFICATION" : "NEW SITE");
  console.log("[AGENT] User request:", userRequest);
  if (isModification) {
    console.log(
      "[AGENT] Existing pages:",
      Object.keys(existingPages as Record<string, string>),
    );
    console.log("[AGENT] Existing spec name:", existingSpec?.name);
  }
  console.log(`${"=".repeat(80)}\n`);

  let prompt: string;

  if (isModification) {
    const pagesText = Object.entries(existingPages as Record<string, string>)
      .map(([filename, content]) => `---FILE: ${filename}---\n${content}`)
      .join("\n\n");

    prompt = `## CURRENT WEBSITE
The site already has these pages:
${pagesText}

## EXISTING SPEC
${JSON.stringify(existingSpec, null, 2)}

## MODIFICATION REQUEST
${userRequest}

IMPORTANT: You are MODIFYING an existing website. You MUST:
1. DO NOT call plan_site — the site already exists
2. DO NOT ask clarifying questions — interpret the request and apply changes immediately
3. Call fix_page RIGHT NOW with the complete updated HTML for each page that needs changes
4. Text responses without tool calls will NOT apply any changes
5. After all fixes, call validate_site

START by calling fix_page for index.html with the updated HTML.`;
  } else {
    prompt = userRequest;
  }

  const eventQueue: GenerationEvent[] = [];
  let resolveWait: (() => void) | null = null;
  let agentDone = false;
  let runError: unknown = null;

  // Track token usage across all messages
  const tokenUsage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  // Track tool call metrics for analytics
  const toolMetrics: ToolCallMetrics = {
    totalToolCalls: 0,
    generatePageCalls: 0,
    fixPageCalls: 0,
    validateSiteCalls: 0,
    pagesPassedValidation: 0,
    pagesFailedValidation: 0,
    fixAttemptsPerPage: {},
  };

  const unsubscribe = agent.subscribe((event: AgentEvent) => {
    let newEvent: GenerationEvent | null = null;

    // === AGENT EVENT LOGGING ===
    if (event.type !== "message_update") {
      console.log("[AGENT EVENT]", event.type);
    }

    switch (event.type) {
      case "agent_start":
        console.log("[AGENT] Agent started processing");
        newEvent = { type: "status", message: "Planning your website" };
        break;

      case "tool_execution_start": {
        console.log("[AGENT] Tool execution START:", event.toolName);
        console.log(
          "[AGENT] Tool args:",
          `${JSON.stringify(event.args, null, 2).slice(0, 500)}...`,
        );
        if (event.toolName === "report_status") {
          const args = event.args as Record<string, unknown>;
          const msg =
            typeof args?.message === "string" ? args.message : "Thinking";
          newEvent = { type: "status", message: msg };
        }
        break;
      }

      case "tool_execution_end": {
        console.log("[AGENT] Tool execution END:", event.toolName);
        console.log(
          "[AGENT] Tool result:",
          JSON.stringify(event.result?.content, null, 2)?.slice(0, 300),
        );

        // Track tool call metrics
        toolMetrics.totalToolCalls++;

        const toolName = event.toolName;
        const details = event.result?.details as
          | Record<string, unknown>
          | undefined;

        if (toolName === "generate_page") {
          toolMetrics.generatePageCalls++;
          if (details) {
            if (details.valid === true) {
              toolMetrics.pagesPassedValidation++;
            } else if (details.valid === false) {
              toolMetrics.pagesFailedValidation++;
            }
          }
        } else if (toolName === "fix_page") {
          toolMetrics.fixPageCalls++;
          if (details) {
            const filename = details.filename as string;
            toolMetrics.fixAttemptsPerPage[filename] =
              (toolMetrics.fixAttemptsPerPage[filename] || 0) + 1;
          }
        } else if (toolName === "validate_site") {
          toolMetrics.validateSiteCalls++;
        }

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

      case "message_end": {
        const msg = event.message;
        // Log assistant message content
        if (msg && typeof msg === "object" && "role" in msg) {
          console.log("[AGENT] Message end - role:", msg.role);
          if ("content" in msg && Array.isArray(msg.content)) {
            for (const block of msg.content) {
              if (block.type === "text" && "text" in block) {
                console.log(
                  "[AGENT] Assistant text response:",
                  (block.text as string).slice(0, 500),
                );
              } else if (block.type === "toolCall") {
                console.log(
                  "[AGENT] Tool call in message:",
                  (block as { name?: string }).name,
                );
              }
            }
          }
        }
        if (msg && typeof msg === "object") {
          // Accumulate token usage from each assistant message
          if ("role" in msg && msg.role === "assistant") {
            const usageAny =
              "usage" in msg
                ? (msg.usage as unknown as Record<string, unknown>)
                : null;
            if (usageAny && typeof usageAny === "object") {
              const input = (usageAny.input ??
                usageAny.prompt_tokens ??
                usageAny.input_tokens ??
                0) as number;
              const output = (usageAny.output ??
                usageAny.completion_tokens ??
                usageAny.output_tokens ??
                0) as number;
              const total = (usageAny.totalTokens ??
                usageAny.total_tokens ??
                usageAny.total ??
                input + output) as number;

              tokenUsage.inputTokens += input;
              tokenUsage.outputTokens += output;
              tokenUsage.totalTokens += total;
              newEvent = { type: "usage", usage: { ...tokenUsage } };
            }
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
        console.log("[AGENT] Agent finished");
        console.log("[AGENT] Final state.pages:", Object.keys(state.pages));
        console.log("[AGENT] Final state.spec:", state.spec?.name);
        console.log("[AGENT] Tool metrics:", JSON.stringify(toolMetrics));
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

  const runPromise = agent
    .prompt(prompt)
    .catch((err) => {
      runError = err;
      eventQueue.push({
        type: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        usage: tokenUsage,
        toolMetrics,
      });
    })
    .finally(() => {
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

  // If an error already occurred, don't emit another error
  if (runError) {
    return;
  }

  if (Object.keys(state.pages).length > 0 && state.spec) {
    yield {
      type: "complete",
      pages: state.pages,
      spec: state.spec,
      usage: tokenUsage,
      toolMetrics,
    };
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
    yield {
      type: "complete",
      pages: state.pages,
      spec: minimalSpec,
      usage: tokenUsage,
      toolMetrics,
    };
  } else {
    yield {
      type: "error",
      error: "No pages were generated",
      usage: tokenUsage,
      toolMetrics,
    };
  }
}
