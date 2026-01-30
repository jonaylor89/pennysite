# Website Generation Agent

## Overview

The website generation agent creates complete, production-ready websites from natural language descriptions. It uses a multi-step agentic workflow powered by [@mariozechner/pi-agent-core](https://github.com/mariozechner/pi-agent-core).

**Model Support:**
- **Anthropic Claude Sonnet 4** (preferred) - Used when `ANTHROPIC_API_KEY` is set
- **OpenAI GPT-4o** (fallback) - Used when only `OPENAI_API_KEY` is available

The agent streams progress events to the client via Server-Sent Events (SSE), enabling real-time UI updates during generation.

## Agent Workflow

The agent follows a structured workflow using specialized tools:

### Progress feedback (`report_status`)

The model calls `report_status` to send user-facing progress messages to the client. It is the **single source** of status text shown during generation (e.g. in the chat UI with the typing indicator).

- **When:** Before calling any other tool; the model may call it multiple times during long steps (e.g. several times while working on one page to show steady feedback).
- **Parameter:** `message` — short, action-oriented text (e.g. "Designing site structure", "Building index.html", "Writing page content", "Fixing issues", "Validating site").
- **Purpose:** Keeps the user informed of progress so the same message doesn’t sit for a long time during multi-page or heavy generation.

### 1. Plan (`plan_site`)

Creates a detailed `SiteSpec` containing:
- **Business identity**: name, tagline, type (landing/portfolio/business/saas/restaurant/agency/blog/ecommerce), industry
- **Audience & tone**: target audience description, tone (professional/casual/playful/luxurious/minimal)
- **Color palette**: 5 colors with hex codes (primary, secondary, accent, background, text)
- **Typography**: heading style (bold/elegant/modern/classic), body font (sans/serif/mono)
- **Page structure**: array of pages, each with filename, title, purpose, and sections
- **Key features/USPs**: array of unique selling points to highlight

### 2. Generate (`generate_page`)

Creates complete HTML for each page:
- Self-contained HTML with `<!DOCTYPE html>`
- Includes Tailwind CSS CDN (`https://cdn.tailwindcss.com`)
- Includes Alpine.js CDN (`https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js`)
- Uses exact colors from the site plan
- Validates HTML structure before accepting

### 3. Fix (`fix_page`)

Corrects issues in generated pages:
- Called automatically when validation fails
- Receives the filename, issue description, and corrected HTML
- Re-validates after fixes are applied

### 4. Validate (`validate_site`)

Checks overall site quality:
- Reviews all pages for consistency
- Returns quality rating (excellent/good/needs_improvement)
- Triggers fixes if issues are found

## Self-Healing Loop

The agent implements automatic error correction through HTML validation:

**Validation checks:**
- DOCTYPE declaration present
- `<html>` tag present
- `<head>` section present
- `<body>` section present
- Tailwind CSS CDN included
- Alpine.js CDN included

**Error correction flow:**
1. `generate_page` produces HTML
2. Validation runs automatically
3. If validation fails, agent is prompted to use `fix_page`
4. Fixed HTML is re-validated
5. Loop continues until validation passes

## Event Streaming

Events emitted during generation:

| Event Type | Description |
|------------|-------------|
| `status` | Progress messages from `report_status` |
| `spec` | The `SiteSpec` object when planning completes |
| `page` | Each page's HTML when generated (includes filename and html) |
| `thinking` | Agent reasoning content (when thinking is enabled) |
| `complete` | Final result with all pages and spec |
| `error` | Any errors encountered |

## Design System

The agent uses a comprehensive design system prompt (`DESIGN_SYSTEM_PROMPT`) that provides:

- **Visual hierarchy guidelines**: How to structure content for maximum impact
- **Modern design patterns**: Gradients, glassmorphism, micro-interactions
- **Layout principles**: Responsive design, spacing, alignment
- **Typography rules**: Font sizing, line height, contrast
- **Color usage guidelines**: Primary, secondary, accent application

## Component Examples

The agent has access to `COMPONENT_EXAMPLES` with high-quality reference implementations:

- **Hero sections**: Gradient orbs, glassmorphism effects, animated elements
- **Bento grid**: Feature cards in modern grid layouts
- **Testimonial cards**: Social proof with avatars and quotes
- **Pricing tables**: Tiered pricing with highlighted recommended option
- **Sticky navbar**: Responsive navigation with mobile hamburger menu
- **Professional footer**: Links, social icons, newsletter signup

These examples serve as inspiration—the agent adapts colors, content, and structure to match each specific project.

## Files

| File | Purpose |
|------|---------|
| `src/lib/generation/agent.ts` | Main agent implementation with tools and event handling |
| `src/lib/generation/agent-interface.ts` | Types and interfaces for testable agent abstraction |
| `src/lib/generation/agent.test.ts` | Unit tests using FakeAgent for isolated testing |
| `src/lib/generation/prompts.ts` | System prompts and prompt builders |
| `src/lib/generation/components.ts` | Component examples for reference |
| `src/lib/generation/types.ts` | TypeScript types (`SiteSpec`, `PageSpec`, etc.) |
| `src/app/api/generate/route.ts` | API route that streams SSE events to clients |

## Testing

The agent uses dependency injection to enable testing without real AI model calls:

```typescript
// Inject a FakeAgent for testing
const events = await collectEvents(
  generateWebsite("Create a test website", undefined, undefined, {
    agentFactory: (config, _getApiKey) => new FakeAgent(config.tools, script),
  }),
);
```

Run tests with: `npm run test`
