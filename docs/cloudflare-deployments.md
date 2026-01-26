# Cloudflare Deployments

## Overview

Pennysite can publish generated HTML to Cloudflare Pages. Each project maps to a dedicated Pages project and a deployment URL like `https://my-site-abc12345.pages.dev`.

## Prerequisites

- Cloudflare account ID
- API token with **Cloudflare Pages: Edit**
- Supabase schema updated with deployment columns

## Environment variables

Set these in your `.env.local`:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

## Database migration

Run `supabase-deployment-schema.sql` to add these columns to `projects`:

- `cf_project_name`
- `deployed_url`
- `last_deployed_at`

## Publish flow

Publishing is triggered from the Builder UI and hits:

```
POST /api/projects/:id/publish
```

The API route:

1. Validates the user session.
2. Loads the project and its saved pages.
3. Creates or reuses a Cloudflare Pages project.
4. Uploads page files and creates a deployment.
5. Updates the project record with the deployment URL and timestamps.

The response includes:

```json
{
  "success": true,
  "cfProjectName": "my-site-abc12345",
  "deployedUrl": "https://my-site-abc12345.pages.dev"
}
```

## Project naming

Cloudflare project names are derived from the project name plus an ID suffix:

- Lowercased
- Non-alphanumeric characters replaced with `-`
- Trimmed to 20 characters
- Suffix: first 8 characters of the project ID

Example: `Coffee Shop` + `abc123456789` -> `coffee-shop-abc12345`.

## Troubleshooting

- **Missing credentials**: Ensure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are set.
- **No pages to publish**: Generate at least one page before publishing.
- **Token scopes**: The API token must include `Pages: Edit` for your account.

## Related code

- Cloudflare client: `src/lib/cloudflare/pages.ts`
- Publish API route: `src/app/api/projects/[id]/publish/route.ts`
- UI handler: `src/app/components/BuilderUI.tsx`
