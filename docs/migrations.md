# Database Migrations

Pennysite uses [Supabase CLI](https://supabase.com/docs/guides/cli) for database migrations.

## Setup

1. Install the Supabase CLI:
   ```bash
   brew install supabase/tap/supabase
   ```

2. Link to your remote project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
   Get your project ref from Dashboard → Project Settings → General.

## Applying Migrations

Push migrations to your remote database:

```bash
pnpm db:migrate
```

This runs all pending migrations in `supabase/migrations/` in order.

## Creating New Migrations

Generate a new migration file:

```bash
pnpm db:migrate:new <migration_name>
```

Example:
```bash
pnpm db:migrate:new add_analytics_table
```

This creates `supabase/migrations/<timestamp>_add_analytics_table.sql`. Edit the file to add your SQL.

## Diffing Against Remote

To generate a migration from changes made in the Supabase Dashboard:

```bash
pnpm db:diff -f <migration_name>
```

## Resetting Local Database

For local development with `supabase start`:

```bash
pnpm db:reset
```

This drops and recreates the local database, applying all migrations fresh.

## Migration Order

Migrations run in alphabetical order by filename. The existing migrations are:

1. `20240101000001_initial_schema.sql` - Projects table with RLS
2. `20240101000002_billing_schema.sql` - Stripe, credits, generations
3. `20240101000003_deployment_schema.sql` - Cloudflare Pages fields
4. `20240101000004_custom_domains_schema.sql` - Custom domain fields

## Best Practices

- **Never edit existing migrations** that have been applied to production
- **Use `if not exists`** for additive changes to handle re-runs gracefully
- **Test locally first** with `supabase start` before pushing to production
- **Keep migrations small** - one logical change per migration
