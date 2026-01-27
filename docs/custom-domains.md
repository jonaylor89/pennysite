# Custom Domains

## Overview

Pennysite allows users to connect their own domains to published sites. This feature uses the Cloudflare Pages Custom Domains API to register domains and automatically provision SSL certificates.

## Prerequisites

- A published project (requires Cloudflare Pages deployment first)
- A domain you control with access to DNS settings
- The same Cloudflare credentials used for deployment

## User Flow

1. **Publish the site** — Click "Publish to Web" to deploy to Cloudflare Pages
2. **Add domain** — Click "Add Custom Domain" button that appears after publishing
3. **Enter domain** — Type your domain (e.g., `blog.example.com`)
4. **Configure DNS** — Follow the provided CNAME instructions
5. **Wait for activation** — DNS propagation typically takes 5-30 minutes
6. **Site is live** — Once active, site is accessible at your custom domain with HTTPS

## Domain Types

### Subdomains (Recommended)

For subdomains like `blog.example.com`, `shop.example.com`, or `app.example.com`:

1. Add a CNAME record at your DNS provider
2. **Name:** The subdomain prefix (e.g., `blog`)
3. **Target:** `your-project-name.pages.dev`

### Apex Domains

For root/apex domains like `example.com`:

- The domain must be managed through Cloudflare DNS
- Cloudflare will automatically create the necessary records
- If using an external DNS provider, you must first transfer your nameservers to Cloudflare

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/:id/domain` | GET | Get current domain status and instructions |
| `/api/projects/:id/domain` | POST | Add a custom domain |
| `/api/projects/:id/domain` | DELETE | Remove a custom domain |

### POST Request Body

```json
{
  "domain": "blog.example.com"
}
```

### Response

```json
{
  "success": true,
  "customDomain": "blog.example.com",
  "status": "pending",
  "instructions": {
    "type": "CNAME",
    "host": "blog",
    "target": "my-project-abc12345.pages.dev",
    "instructions": "Add a CNAME record for \"blog\" pointing to my-project-abc12345.pages.dev"
  },
  "customDomainUrl": "https://blog.example.com"
}
```

## Domain Status

| Status | Description |
|--------|-------------|
| `pending` | Waiting for DNS configuration to propagate |
| `active` | Domain is verified and serving traffic |
| `error` | Something went wrong (check DNS configuration) |

## Database Schema

The following columns are added to the `projects` table:

```sql
custom_domain text,
custom_domain_status text check (custom_domain_status in ('pending', 'active', 'error')),
custom_domain_added_at timestamp with time zone
```

Run `supabase-custom-domains-schema.sql` to apply this migration.

## Related Code

- Domain API client: `src/lib/cloudflare/domains.ts`
- API route: `src/app/api/projects/[id]/domain/route.ts`
- UI component: `CustomDomainModal` in `src/app/components/BuilderUI.tsx`

## Troubleshooting

### Domain stuck in "pending"

1. Verify DNS records are correctly configured
2. Use a DNS checker tool to confirm propagation
3. Click "Check Status" to retry verification
4. Wait up to 48 hours for full propagation (rare)

### "Failed to add domain" error

- Ensure the domain format is valid (e.g., `blog.example.com`, not `http://blog.example.com`)
- Check that the domain isn't already registered to another Pages project
- Verify your Cloudflare API token has Pages:Edit permission

### Apex domain issues

- Apex domains require Cloudflare to manage the zone
- If using an external registrar, update nameservers to Cloudflare's
- This is a Cloudflare Pages limitation, not specific to Pennysite
