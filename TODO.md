
# Features

## Prioritized Backlog

| # | Feature | Priority | Difficulty | Rationale |
|---|---------|----------|------------|-----------|
| 1 | **Delete elements via right-click** | P1 | Low | Table-stakes editor interaction. Blocking for users who want to tweak output. Small effort, big usability win. |
| 2 | **Image placeholders + CDN replacement** | P1 | Medium | Core UX gap. Generated sites without real images feel unfinished — directly impacts perceived quality and conversion to paid usage. |
| 3 | **Brand logo placement** | P2 | Medium | Important for professional output, but depends on the image/asset story (#2) being solved first. |
| 4 | **Agent `answer` skill (prompt user mid-generation)** | P2 | Medium-High | Improves generation quality by gathering clarifying info. High value but requires UX for mid-flow interruptions and agent-loop changes. |
| 5 | **Upload brand guidelines document** | P3 | High | Power-user feature. Requires document parsing, prompt engineering to extract design tokens, and storage. Low ROI until the core editor is solid. |

---

## Unlocked by New Architecture (Hono + Vite + Persistent Backend)

Features that were impractical or impossible on serverless Next.js + Supabase SDK, now enabled by owning a persistent process on a VPS.

### Easy wins

- [ ] **Background generation queue** — Decouple generation from the HTTP request. User submits prompt, gets a `generation_id` back immediately. Generation runs in a background worker. User can close the tab and come back to a finished site. Also enables batch generation ("generate 5 variations").

- [ ] **Parallel page generation** — Fan out multi-page sites across workers, each calling the LLM independently. 5x faster for multi-page sites.

- [ ] **Pre-warmed API connections** — Keep warm connection pools to OpenAI/Anthropic. No cold start latency on first token.

- [ ] **Admin dashboard** — Real-time view of active generations, credit balances, revenue, user growth. Just more Hono handlers behind admin auth.

- [ ] **Scheduled publishing** — "Publish this site at 9am Monday." Internal cron ticker handles it.

- [ ] **Form handling for generated sites** — User adds a contact form. Instead of needing a third-party service, the form POSTs to `api.pennysite.app/sites/:id/form`, stores the submission, and emails the site owner.

### Medium effort

- [ ] **Screenshot/thumbnail generation** — Run headless Chromium (via Puppeteer/Playwright) to generate OG images, project thumbnails, and previews. Users see visual thumbnails in the dashboard instead of just names.

- [ ] **Project versioning & rollback** — Store every generation/edit as a snapshot. Users browse history and roll back to any point. Diff view showing what changed between versions.

- [ ] **Edge analytics via Cloudflare Workers** — A Worker on published user sites counts page views, geographic distribution, and referrers without any third-party script. Data flows back to the API via batched POST.

- [ ] **Webhook system / integrations** — "Site published" webhooks, GitHub integration (push HTML to a repo on publish), Zapier/Make support.

- [ ] **Multi-model AI routing** — Use Claude for design-heavy pages, GPT for copy-heavy pages, a cheap model for validation passes. Orchestrate across models in a single generation run.

- [ ] **AI image generation** — Call DALL-E / Flux, download the result, optimize it, upload to Cloudflare R2. The system prompt currently bans external images — this removes that constraint.

- [ ] **PDF export** — Headless Chrome renders the site to PDF. "Download my site as a PDF" button.

- [ ] **Site monitoring** — Periodically ping published sites, alert the user if Cloudflare Pages has an issue or their custom domain DNS is misconfigured. SSL certificate expiry monitoring.

### Ambitious

- [ ] **Real-time collaboration (WebSockets)** — Live preview sharing, multiplayer editing, cursor presence, conflict resolution. Hono on a VPS can hold thousands of WebSocket connections. Serverless couldn't hold any.

- [ ] **Iterative screenshot-feedback loops** — Generate site, screenshot with headless Chrome, feed screenshot back to the AI, "does this look right?", fix, repeat. An agentic loop that would blow past any serverless timeout.

- [ ] **Template marketplace / site cloning** — Public template gallery built on the existing `is_public` flag. Index public sites, generate thumbnails, serve a catalog. One-click clone to your account.

- [ ] **Simple CMS** — "Update the blog post list without regenerating the whole site." Store content in DB, inject at serve-time via a Cloudflare Worker. Turns static sites into semi-dynamic ones.

- [ ] **Password-protected pages** — Cloudflare Worker checks a cookie/token before serving. Auth logic in the backend.

- [ ] **A/B testing for published sites** — Serve different page variants via a Cloudflare Worker, track which converts better, report results in dashboard.

- [ ] **Import from URL** — Paste a URL, headless Chrome screenshots it, AI reverse-engineers it into editable HTML. "Clone any website" feature. Needs a persistent browser process.

- [ ] **Local model fallback** — Run a small model (Llama) on the VPS for simple tasks (HTML validation, copy editing) without paying for an API call. Hetzner also offers GPU servers.
