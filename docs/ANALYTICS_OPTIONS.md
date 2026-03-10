# Analytics for Generated Sites

## Overview

We want to add page-view analytics to every site published through Pennysite.
[Umami](https://umami.is/) is a lightweight, privacy-friendly, open-source
analytics platform that requires only a single `<script>` tag — no cookies, no
GDPR banner required.

---

## Hosting Umami

### Option A: Umami Cloud (managed)

- Free tier available (10k events/month).
- No infrastructure to maintain.
- Sign up at <https://cloud.umami.is/>, create a website entry, and grab the
  tracking script.

### Option B: Self-host on Vercel + PostgreSQL

1. Fork or clone <https://github.com/umami-software/umami>.
2. Deploy to Vercel and connect a PostgreSQL database (e.g. Supabase, Neon, or
   Vercel Postgres).
3. Set the `DATABASE_URL` env var in the Vercel project.
4. After the first deploy, log in at the Umami dashboard, add a website, and
   copy the tracking script.

### Option C: Self-host on a VPS (Docker)

```bash
docker run -d --name umami \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/umami \
  ghcr.io/umami-software/umami:latest
```

Put it behind a reverse proxy (Caddy/nginx) with TLS.

---

## Injecting the Script at Deploy Time

The cleanest approach is to inject the Umami snippet into each page's `<head>`
right before we upload to Cloudflare Pages. This keeps analytics out of the
builder preview and ensures every published page is tracked automatically.

### Environment variables

```
UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
UMAMI_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Implementation sketch

In `src/lib/cloudflare/pages.ts`, add a helper that injects the tag and call it
from `publishToCloudflare` before deploying:

```ts
function injectAnalytics(pages: Record<string, string>): Record<string, string> {
  const scriptUrl = process.env.UMAMI_SCRIPT_URL;
  const websiteId = process.env.UMAMI_WEBSITE_ID;

  if (!scriptUrl || !websiteId) {
    return pages;
  }

  const snippet = `<script defer src="${scriptUrl}" data-website-id="${websiteId}"></script>`;

  const result: Record<string, string> = {};
  for (const [filename, html] of Object.entries(pages)) {
    // Insert right before </head> so it loads early but doesn't block rendering
    result[filename] = html.replace("</head>", `${snippet}\n</head>`);
  }
  return result;
}
```

Then update `publishToCloudflare`:

```ts
export async function publishToCloudflare(
  projectId: string,
  projectName: string,
  pages: Record<string, string>,
): Promise<{ cfProjectName: string; deployedUrl: string }> {
  const project = await getOrCreateProject(projectId, projectName);
  const { url } = await deployPages(project.name, injectAnalytics(pages));

  return {
    cfProjectName: project.name,
    deployedUrl: url,
  };
}
```

### Why deploy-time injection?

| Approach | Pros | Cons |
|---|---|---|
| **Deploy-time injection** (recommended) | Simple, reliable, no preview clutter | Requires a string replace on HTML |
| Generation-time (AI prompt) | No post-processing | Fragile, pollutes previews, AI may omit it |
| Client-side wrapper | Decoupled from generation | Needs a custom domain + service worker or proxy |

### Per-project tracking (future)

To get per-site dashboards in Umami, create a unique website entry per project
and store the `website_id` on the project row in Supabase. The injection helper
would then accept a per-project ID instead of using a single global env var.
