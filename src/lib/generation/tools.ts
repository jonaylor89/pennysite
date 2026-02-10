import type {
  AgentTool,
  AgentToolResult,
} from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import {
  type GenerationState,
  type PageDetails,
  validateHtml,
} from "./agent-interface";
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

const WritePageParams = Type.Object({
  filename: Type.String({ description: "Filename like index.html" }),
  html: Type.String({
    description:
      "Complete HTML content for the page. Must be valid, self-contained HTML with DOCTYPE, Tailwind CDN, and Alpine.js. MUST include section markers: <!-- SECTION: name --> before each major section and <!-- /SECTION: name --> after.",
  }),
});

const EditOperation = Type.Object({
  old: Type.String({
    description:
      "Exact string to find in the current page HTML. Must match exactly one location.",
  }),
  new: Type.String({ description: "Replacement string." }),
});

const EditPageParams = Type.Object({
  filename: Type.String({ description: "Filename of the page to edit" }),
  edits: Type.Array(EditOperation, {
    description:
      "Array of search/replace operations to apply sequentially. Each 'old' string must match exactly once in the page.",
  }),
});

const ReadPageParams = Type.Object({
  filename: Type.String({ description: "Filename of the page to read" }),
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
            text: `Site plan created for "${spec.name}". Now generate each page using write_page.

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

  const writePageTool: AgentTool<typeof WritePageParams, PageDetails> = {
    name: "write_page",
    label: "Write Page",
    description: `Write complete HTML for a single page from scratch. The HTML must be:
- Complete and self-contained with DOCTYPE
- Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Alpine.js: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
- Use the exact colors from the site plan
- Follow modern design patterns with gradients, glassmorphism, and micro-interactions
- Include section markers: <!-- SECTION: name --> before each major section and <!-- /SECTION: name --> after`,
    parameters: WritePageParams,
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

Please fix these issues using edit_page or rewrite with write_page.`,
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
            text: `Successfully wrote ${filename} (${html.length} chars). Page saved.`,
          },
        ],
        details: { filename, html, valid: true },
      };
    },
  };

  const editPageTool: AgentTool<typeof EditPageParams, PageDetails> = {
    name: "edit_page",
    label: "Edit Page",
    description:
      "Apply targeted search/replace edits to an existing page. Each edit's 'old' string must match exactly once. Use read_page first to see current content.",
    parameters: EditPageParams,
    execute: async (
      _toolCallId,
      params,
    ): Promise<AgentToolResult<PageDetails>> => {
      const { filename, edits } = params;

      if (!state.pages[filename]) {
        return {
          content: [
            {
              type: "text",
              text: `Page "${filename}" not found. Available pages: ${Object.keys(state.pages).join(", ") || "none"}`,
            },
          ],
          details: {
            filename,
            html: "",
            valid: false,
            issues: ["Page not found"],
          },
        };
      }

      let html = state.pages[filename];

      for (let i = 0; i < edits.length; i++) {
        const edit = edits[i];
        const occurrences = html.split(edit.old).length - 1;

        if (occurrences === 0) {
          return {
            content: [
              {
                type: "text",
                text: `Edit ${i + 1}/${edits.length} failed for ${filename}: Could not find the specified text. Use read_page to see current content and try again.`,
              },
            ],
            details: {
              filename,
              html: state.pages[filename],
              valid: false,
              issues: ["Edit target not found"],
            },
          };
        }

        if (occurrences > 1) {
          return {
            content: [
              {
                type: "text",
                text: `Edit ${i + 1}/${edits.length} failed for ${filename}: Found multiple matches (${occurrences} occurrences). Provide a more specific/longer 'old' string that matches exactly once.`,
              },
            ],
            details: {
              filename,
              html: state.pages[filename],
              valid: false,
              issues: ["Multiple matches found"],
            },
          };
        }

        html = html.replace(edit.old, edit.new);
      }

      const validation = validateHtml(html);
      state.pages[filename] = html;

      if (!validation.valid) {
        return {
          content: [
            {
              type: "text",
              text: `Applied ${edits.length} edit(s) to ${filename}, but validation warnings found:
${validation.issues.map((i) => `- ${i}`).join("\n")}

Page saved. Consider fixing these issues.`,
            },
          ],
          details: { filename, html, valid: false, issues: validation.issues },
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Successfully applied ${edits.length} edit(s) to ${filename}. Page saved.`,
          },
        ],
        details: { filename, html, valid: true },
      };
    },
  };

  const readPageTool: AgentTool<typeof ReadPageParams, { filename: string }> = {
    name: "read_page",
    label: "Read Page",
    description:
      "Read the current HTML content of a page. Use this before edit_page to see the exact content you need to modify.",
    parameters: ReadPageParams,
    execute: async (
      _toolCallId,
      params,
    ): Promise<AgentToolResult<{ filename: string }>> => {
      const { filename } = params;

      if (!state.pages[filename]) {
        return {
          content: [
            {
              type: "text",
              text: `Page "${filename}" not found. Available pages: ${Object.keys(state.pages).join(", ") || "none"}`,
            },
          ],
          details: { filename },
        };
      }

      return {
        content: [
          {
            type: "text",
            text: state.pages[filename],
          },
        ],
        details: { filename },
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

Please fix these issues using edit_page.`,
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
    writePageTool as unknown as AgentTool,
    editPageTool as unknown as AgentTool,
    readPageTool as unknown as AgentTool,
    validateSiteTool as unknown as AgentTool,
  ];
}
