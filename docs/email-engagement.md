# Email Engagement System

All emails are sent via [Resend](https://resend.com). Deduplication is enforced by the `email_log` table — no user receives the same email twice (per project, where applicable). Users can unsubscribe per-category or globally via `/account`.

---

## Immediate Triggers (sent when the event happens)

| Email | Trigger | Subject |
|---|---|---|
| **Site published** | User publishes a project to Cloudflare | 🎉 Your site is live! |
| **Second site created** | User creates their 2nd project | You're building something great |

These fire inline from the publish and project-creation API routes (fire-and-forget, non-blocking).

---

## Re-engagement (daily cron, reduces churn)

| Email | Condition | Delay | Subject | Repeat? |
|---|---|---|---|---|
| **Generated, never published** | Project has pages but no `deployed_url` | 24 hours after creation | Your site is ready to go live | Once per project |
| **Created, never edited** | `updated_at` ≈ `created_at` (within 1h) | 3 days after creation | 3 quick edits to make your site shine | Once per project |
| **Published, no edits** | Has `deployed_url`, no updates | 30 days since last edit | Time for a refresh? | Once per project |
| **Has credits, idle** | Credit balance > 0, no generations | 14 days since last generation | You have X credits waiting | Once per 30 days |
| **Purchased, never generated** | Has credit history but no projects with pages | 48 hours after signup | You're all set up — let's build | Once ever |

---

## Onboarding Drip (daily cron, education sequence)

Sent based on days since user signup. Each email is sent once, ever.

| Email | Day | Subject |
|---|---|---|
| **Welcome** | 0 (signup day) | Welcome to Pennysite |
| **Prompt tips** | 4 | Write better prompts, get better sites |
| **Add pages** | 10 | Your site can have multiple pages |
| **Custom domains** | 20 | Make it official with a custom domain |
| **Showcase** | 30 | See what others are building |

---

## Cron Schedule

The daily cron runs at **2:00 PM UTC** via Vercel Cron (`vercel.json`).

```
GET /api/email/cron?key=${CRON_SECRET}
```

It processes all segments sequentially and returns a summary:

```json
{
  "ok": true,
  "sent": {
    "generated_never_published": 3,
    "created_never_edited": 1,
    "published_no_edits": 0,
    "has_credits_idle": 2,
    "purchased_never_generated": 0,
    "drip_welcome": 5,
    "drip_prompt_tips": 2,
    "drip_add_pages": 1,
    "drip_custom_domain": 0,
    "drip_showcase": 0
  }
}
```

---

## Unsubscribe Categories

Users can opt out of specific categories via `email_preferences`:

| Column | Controls |
|---|---|
| `unsubscribed_all` | All emails (global kill switch) |
| `unsubscribed_drip` | Onboarding drip sequence |
| `unsubscribed_reengagement` | Re-engagement nudges |

Immediate trigger emails (site published, second site) are only blocked by `unsubscribed_all`.

### How unsubscribe works

1. **Account page** — logged-in users can toggle categories at `/account` (EmailPreferences component → `PUT /api/account/email-preferences`)
2. **One-click from email** — every email footer has a tokenized unsubscribe link (`GET /api/email/unsubscribe?token=xxx`). The token is a signed JWT (90-day expiry, signed with `CRON_SECRET`) containing the user ID and category. Clicking it immediately updates preferences and renders a confirmation page — no login required (CAN-SPAM compliant).

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/email/resend.ts` | Resend client + config |
| `src/lib/email/send.ts` | `sendEmail()` utility |
| `src/lib/email/templates.ts` | All HTML email templates |
| `src/lib/email/triggers.ts` | Immediate trigger functions |
| `src/lib/email/segments.ts` | Segment queries + dedup + unsubscribe checks |
| `src/app/api/email/cron/route.ts` | Daily cron endpoint |
| `src/app/api/email/unsubscribe/route.ts` | One-click tokenized unsubscribe |
| `src/app/api/account/email-preferences/route.ts` | GET/PUT preferences API |
| `src/app/account/EmailPreferences.tsx` | Account page toggle UI |
| `supabase/migrations/20260310000001_email_engagement.sql` | `email_log` + `email_preferences` tables |
| `supabase/migrations/20260310000002_email_segment_functions.sql` | Postgres segment functions |
| `vercel.json` | Cron schedule |

---

## Setup

1. Create a [Resend](https://resend.com) account and verify your sending domain
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxx
   CRON_SECRET=any-random-secret
   ```
3. Run `npm run db:migrate` to create the tables and functions
4. Deploy — the Vercel Cron will start running automatically
