# Pennysite

**Build websites for pennies.** An AI-powered website builder with pay-per-generation pricing and free hosting forever.

Pennysite lets users describe the website they want in natural language, generates production-ready HTML using AI, and provides instant live preview—all without subscriptions or complex tooling.

## ✨ Features

- **Conversational website building** — Describe what you want, then iterate with follow-up messages ("make the header blue", "add a testimonials section")
- **Multi-page support** — Generate complete multi-page websites with working navigation between pages
- **Live streaming preview** — Watch your website build in real-time as the AI generates it
- **No build step** — Generated sites are pure HTML + Tailwind CSS + Alpine.js, instantly deployable anywhere
- **Project persistence** — Save projects to your account and continue editing later
- **Download & export** — Download all pages as HTML files, ready to host anywhere

## 🏗️ Architecture

Pennysite follows a **serverless-first, no-build** architecture with an **agentic AI workflow**:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  pi-agent-core   │────▶│  Generated HTML │
│   (Frontend +   │     │   Agent Loop     │     │  (Tailwind +    │
│    API Routes)  │     │                  │     │   Alpine.js)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                      │
         │               ┌──────┴──────┐
         │               ▼             ▼
         │      ┌─────────────┐ ┌─────────────┐
         │      │  Anthropic  │ │   OpenAI    │
         │      │  Claude 4   │ │   GPT-4o    │
         │      │ (preferred) │ │ (fallback)  │
         │      └─────────────┘ └─────────────┘
         ▼
┌─────────────────┐
│    Supabase     │
│  (Auth + DB)    │
└─────────────────┘
```

### Agent Tools

The AI uses a multi-step coding agent with 4 specialized tools:

| Tool | Purpose |
|------|---------|
| `plan_site` | Analyzes the request and creates a site structure plan |
| `generate_page` | Generates HTML for a single page |
| `fix_page` | Fixes validation errors in generated HTML |
| `validate_site` | Validates HTML and checks for issues |

The agent runs in a **self-healing loop**: after generating pages, it validates the HTML and automatically fixes any issues before returning the final result. Progress is streamed to the client in real-time via Server-Sent Events.

> 📖 See [docs/agent.md](docs/agent.md) for detailed agent documentation.

### Why this architecture?

1. **Instant preview** — No npm install, no webpack, no waiting. Generated HTML renders immediately in an iframe.
2. **Zero hosting cost** — Static HTML can be hosted free on Cloudflare Pages, Vercel, Netlify, or any static host.
3. **Portable output** — Users get clean, standard HTML they can take anywhere. No vendor lock-in.
4. **Pay-per-use economics** — The only variable cost is AI generation, which can be metered per-request.
5. **Self-healing generation** — The agent validates and fixes its own output, ensuring higher quality results.

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Agent Framework | @mariozechner/pi-agent-core | Multi-step agent loop with tool execution |
| LLM Abstraction | @mariozechner/pi-ai | Unified API for Anthropic and OpenAI |
| AI Models | Claude Sonnet 4 / GPT-4o | LLM providers (Anthropic preferred) |
| Auth & Database | Supabase | PostgreSQL + Row Level Security |
| Linting | Biome | Fast linting and formatting |

### Generated Sites Use:

- **Tailwind CSS** (via Play CDN) — No build step required
- **Alpine.js** — Lightweight interactivity (modals, menus, tabs)
- **Lucide/Heroicons** — SVG icons inlined
- **Unsplash** — Stock imagery via URLs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- An Anthropic API key (preferred) or OpenAI API key

> 💡 **Anthropic Claude Sonnet 4 is recommended** for better design quality and more reliable multi-page generation. OpenAI GPT-4o works as a fallback.

### 1. Clone and install

```bash
git clone https://github.com/your-username/pennysite.git
cd pennysite
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase (get these from your project's API settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Provider (at least one required, Anthropic preferred)
ANTHROPIC_API_KEY=sk-ant-your-api-key
OPENAI_API_KEY=sk-your-api-key
```

> ⚠️ If both keys are set, Anthropic will be used. Set only `OPENAI_API_KEY` to force OpenAI.

### 3. Set up the database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor
3. Run the contents of `supabase-schema.sql`:

```sql
-- Creates the projects table with RLS policies
-- See supabase-schema.sql for full schema
```

4. Enable Email auth in **Authentication → Providers → Email**

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/          # AI generation endpoint (streaming)
│   │   └── projects/          # CRUD for saved projects
│   ├── auth/
│   │   ├── callback/          # OAuth callback handler
│   │   └── login/             # Sign in / Sign up page
│   ├── builder/               # Main website builder UI
│   ├── projects/              # List of saved projects
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── lib/
│   └── supabase/              # Supabase client configuration
│       ├── client.ts          # Browser client
│       ├── server.ts          # Server client
│       ├── middleware.ts      # Session refresh helper
│       └── types.ts           # Database types
└── proxy.ts                   # Next.js proxy (auth session refresh)
```

## 🎯 Usage

### Creating a website

1. Go to `/builder`
2. Describe your website: *"A 3-page website for a Brooklyn coffee shop with home, menu, and contact pages"*
3. Watch it generate in real-time
4. Iterate with follow-up messages: *"Make the color scheme warmer"*, *"Add customer testimonials"*

### Multi-page navigation

- Generated multi-page sites show **tabs** above the preview
- **Click links** in the preview to navigate between pages
- Each page is a complete, standalone HTML file

### Saving projects

1. Sign in (or create an account)
2. Click **Save Project** after generating
3. Access saved projects at `/projects`
4. Continue editing by loading a saved project

### Exporting

- **Download** — Downloads all pages as separate HTML files
- Files are ready to upload to any static hosting provider

## 🧑‍💻 Development

```bash
# Start dev server
npm run dev

# Type check and lint
npm run lint

# Format code
npm run format

# Production build
npm run build
```

## 💳 Billing Setup

Pennysite uses a **prepaid credit system** with Stripe. Users purchase credits upfront, and each generation costs credits based on actual token usage.

### Credit Pricing

| Pack | Price | Credits | Cost per credit |
|------|-------|---------|-----------------|
| Starter | $5 | 50 | $0.10 |
| Basic | $20 | 220 | $0.09 |
| Pro | $50 | 600 | $0.08 |
| Max | $100 | 1,300 | $0.08 |

### Generation Cost

Each generation costs: **Base (5 credits) + Input tokens × 0.001 + Output tokens × 0.005**

Typical generation (~2k input, ~8k output): **~47 credits ($4.70)**

### Stripe Setup

1. Create products/prices in your [Stripe Dashboard](https://dashboard.stripe.com/products):
   - Create 4 one-time payment products for each credit pack
   - Copy the Price IDs to your `.env.local`

2. Set up a webhook endpoint:
   - Go to **Developers → Webhooks**
   - Add endpoint: `https://your-domain.com/api/billing/webhook`
   - Select event: `checkout.session.completed`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

3. Run the billing schema migration:
   ```sql
   -- Run supabase-billing-schema.sql in your Supabase SQL editor
   ```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/credits/balance` | GET | Get current credit balance |
| `/api/billing/checkout` | POST | Create Stripe checkout session |
| `/api/billing/webhook` | POST | Handle Stripe webhooks |

## 🗺️ Roadmap

### Not yet implemented

- [ ] **Cloudflare Pages deployment** — One-click publish to a live URL
- [x] **Stripe billing** — Pay-per-generation credit system
- [ ] **Image upload** — Custom images instead of Unsplash
- [ ] **Click-to-edit** — Edit text directly in the preview
- [ ] **Custom domains** — Connect your own domain to published sites
- [ ] **Version history** — Undo/redo and view previous versions

### Future ideas

- Template library for common site types
- AI-powered SEO optimization
- Form handling (contact forms, newsletter signups)
- Analytics integration
