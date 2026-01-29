# Contributing

Thanks for contributing! This is a Next.js 16 app with Supabase, AI providers, and Stripe billing.

## Prerequisites

- Node.js 18+ (npm)
- Supabase account
- At least one AI provider key (Anthropic or OpenAI)
- Supabase CLI (for migrations)
- Optional: Stripe + Cloudflare + PostHog credentials for those features

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see `.env.example` for all variables).

## Local dev

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` - dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - lint (Biome)
- `npm run lint:fix` - lint + fix
- `npm run format` - format (Biome)
- `npm run test` - test suite (Vitest)
- `npm run test:watch` - tests in watch mode
- `npm run test:agent` - agent test harness
- `npm run db:migrate` - push migrations to Supabase
- `npm run db:migrate:new` - create a new migration
- `npm run db:diff` - generate migration from schema diff
- `npm run db:reset` - reset local Supabase DB

## Project structure

```
src/
  app/                Next.js App Router pages and API routes
    api/              HTTP endpoints (generation, billing, projects, etc.)
    auth/             Auth pages + callbacks
    project/          Project builder UI (new and [projectId])
    projects/         Saved projects list
  lib/
    supabase/         Supabase clients and types
  proxy.ts            Supabase auth session refresh helper
supabase/             DB migrations and config
scripts/              Local scripts (agent tests, tooling)
docs/                 Product/architecture docs
public/               Static assets
```

## Database

Migrations live in `supabase/migrations`. Use the Supabase CLI:

```bash
npm run db:migrate
```

## Code style

- Formatting and linting via Biome. Run `npm run lint` and `npm run format` before opening a PR.

## Pull requests

- Keep PRs focused and small when possible.
- Include tests or update existing tests if behavior changes.
- Update docs when you change environment variables or workflows.
