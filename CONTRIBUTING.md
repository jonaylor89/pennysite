# Pennysite

AI website builder. Users describe a site, AI generates HTML pages, users publish to Cloudflare Pages.

## Architecture

pnpm monorepo with two packages:

- **`server/`** — Hono + TypeScript backend (Node.js). Handles API, auth, generation, billing, email, cron.
- **`frontend/`** — React + Vite SPA. Deploys to Cloudflare Pages.
- **`supabase/`** — Database migrations (Postgres, currently hosted on Supabase).

Auth is JWT-based (jose + bcrypt). No Supabase SDK — direct Postgres via `postgres` (postgres.js). The server connects to `auth.users` in the Supabase Postgres instance directly.

## Setup

```bash
pnpm install
# Fill in server/.env and frontend/.env from their .env.example files
```

## Local dev

```bash
pnpm run dev
```

Starts both server (:3001) and frontend (:3000) in parallel. Vite proxies `/api`, `/ingest` (PostHog), and `/monitoring` (Sentry) to the backend.

## Scripts

Root (runs across both packages):
- `pnpm run dev` — start both server and frontend
- `pnpm run build` — build both
- `pnpm run lint` — lint both

Server (`pnpm --filter pennysite-server <cmd>`):
- `dev` — `tsx watch src/index.ts` (auto-reload)
- `build` — `tsc`
- `start` — `node dist/index.js`

Frontend (`pnpm --filter pennysite-frontend <cmd>`):
- `dev` — `vite` (HMR)
- `build` — `tsc --noEmit && vite build`
- `preview` — `vite preview`

Database:
- `pnpm run db:migrate` — push migrations to Supabase
- `pnpm run db:migrate:new` — create a new migration

## Project structure

```
server/
  src/
    index.ts            Entry point (starts server + cron)
    app.ts              Hono app factory, route mounting, middleware
    config.ts           Env var validation
    types.ts            Shared Hono env type
    auth/               JWT creation/verification, bcrypt, auth middleware
    db/                 Database modules (postgres.js): users, projects, credits, generations, email, pending-generations
    routes/             HTTP handlers: auth, generate, enhance, projects, publish, billing, webhook, credits, account, email, generations
    middleware/          CORS, error handler
    cron/               Internal scheduler + email campaign
    lib/
      generation/       AI agent (pi-agent-core), tools, prompts, system prompt, skills
      billing/          Credit pricing config
      stripe/           Stripe client + credit packs
      cloudflare/       Pages publishing + custom domains
      email/            Resend client, templates, triggers
      posthog/          Server-side analytics
      analytics/        HTML quality metrics

frontend/
  src/
    main.tsx            React entry point
    App.tsx             React Router + AuthProvider
    globals.css         Design system (Tailwind v4 theme)
    routes/             Page components (index, login, projects, editor, settings, pricing, billing, account, about)
    components/         UI components (BuilderUI, HeaderNav, Footer, PromptForm, ProjectList, ProjectSettings, ProjectViewer, etc.)
    components/ui/      Primitives (Button, Input, Card, Modal, Alert, Badge)
    lib/
      auth/             JWT token store, AuthContext, useAuth hook
      api-client.ts     Fetch wrapper with Bearer token + auto-refresh on 401
      posthog.ts        Client-side PostHog
      sentry.ts         Client-side Sentry
      generation/       Shared types (SiteSpec, GenerationEvent, skills)
      billing/          Client-side credit config

supabase/
  migrations/           Postgres migrations (PL/pgSQL functions for credits, email segments)
```

## Key patterns

- **Auth**: JWT access token (15min) in memory + refresh token (30d) in HttpOnly cookie. `useAuth()` hook on frontend. `authMiddleware` on backend extracts Bearer token.
- **Credits**: PL/pgSQL functions (`reserve_credits_for_generation`, `finalize_generation_credits`, etc.) called via `SELECT fn(...)` through postgres.js. Atomic transactions in the database.
- **Generation**: SSE streaming via Hono's `streamSSE()`. Uses `@earendil-works/pi-agent-core` for the agentic loop. No serverless timeouts.
- **Cron**: Internal `setInterval` in the server process, runs daily email campaigns at 14:00 UTC.
- **Proxies**: PostHog (`/ingest/*`) and Sentry (`/monitoring/*`) are proxied through the backend to avoid ad blockers.

## Database

Postgres hosted on Supabase (direct connection via `DATABASE_URL`). Migrations in `supabase/migrations/`. Key tables: `projects`, `generations`, `credit_accounts`, `credit_ledger`, `stripe_customers`, `stripe_events`, `email_log`, `email_preferences`, `pending_generations`. User data in `auth.users` (Supabase auth schema).

## Deployment

- **Frontend**: Cloudflare Pages. Build command: `cd frontend && pnpm install && pnpm run build`. Output: `frontend/dist`. Set `VITE_API_URL` to backend URL.
- **Backend**: Docker on Hetzner VPS (or any host). `docker-compose.yml` + `Caddyfile` included. Caddy handles TLS + reverse proxy.
- **Stripe webhook**: Must point to `<backend-url>/api/billing/webhook`.
