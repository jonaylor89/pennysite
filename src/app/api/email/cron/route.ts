import { NextResponse } from "next/server";
import { generateUnsubscribeUrl } from "@/app/api/email/unsubscribe/route";
import {
  getCreatedNeverEdited,
  getDripEligible,
  getGeneratedNeverPublished,
  getHasCreditsIdle,
  getPublishedNoEdits,
  getPurchasedNeverGenerated,
  logEmailSent,
} from "@/lib/email/segments";
import { sendEmail } from "@/lib/email/send";
import * as templates from "@/lib/email/templates";

/**
 * Daily email engagement cron job.
 * Called by Vercel Cron (see vercel.json) or manually with the secret.
 *
 * GET /api/email/cron?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || key !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, number> = {};

  // ── Re-engagement emails ──────────────────────────────────

  // Generated but never published (24h)
  const unpublished = await getGeneratedNeverPublished();
  let sent = 0;
  for (const user of unpublished) {
    if (!user.projectId || !user.projectName) continue;
    const unsub = await generateUnsubscribeUrl(user.userId, "reengagement");
    const template = templates.generatedNeverPublished(
      user.projectName,
      user.projectId,
      unsub,
    );
    const messageId = await sendEmail({
      to: user.email,
      ...template,
      tag: "re-engagement",
    });
    await logEmailSent(
      user.userId,
      "generated_never_published",
      messageId,
      user.projectId,
    );
    sent++;
  }
  results.generated_never_published = sent;

  // Created but never edited (3 days)
  const unedited = await getCreatedNeverEdited();
  sent = 0;
  for (const user of unedited) {
    if (!user.projectId || !user.projectName) continue;
    const unsub = await generateUnsubscribeUrl(user.userId, "reengagement");
    const template = templates.createdNeverEdited(
      user.projectName,
      user.projectId,
      unsub,
    );
    const messageId = await sendEmail({
      to: user.email,
      ...template,
      tag: "re-engagement",
    });
    await logEmailSent(
      user.userId,
      "created_never_edited",
      messageId,
      user.projectId,
    );
    sent++;
  }
  results.created_never_edited = sent;

  // Published but no edits in 30 days
  const stale = await getPublishedNoEdits();
  sent = 0;
  for (const user of stale) {
    if (!user.projectId || !user.projectName) continue;
    const unsub = await generateUnsubscribeUrl(user.userId, "reengagement");
    const template = templates.publishedNoEdits(
      user.projectName,
      user.projectId,
      unsub,
    );
    const messageId = await sendEmail({
      to: user.email,
      ...template,
      tag: "re-engagement",
    });
    await logEmailSent(
      user.userId,
      "published_no_edits",
      messageId,
      user.projectId,
    );
    sent++;
  }
  results.published_no_edits = sent;

  // Has credits but idle 14+ days
  const idle = await getHasCreditsIdle();
  sent = 0;
  for (const user of idle) {
    if (user.availableCredits == null) continue;
    const unsub = await generateUnsubscribeUrl(user.userId, "reengagement");
    const template = templates.hasCreditsIdle(user.availableCredits, unsub);
    const messageId = await sendEmail({
      to: user.email,
      ...template,
      tag: "re-engagement",
    });
    await logEmailSent(user.userId, "has_credits_idle", messageId);
    sent++;
  }
  results.has_credits_idle = sent;

  // Purchased but never generated (48h)
  const neverGenerated = await getPurchasedNeverGenerated();
  sent = 0;
  for (const user of neverGenerated) {
    const unsub = await generateUnsubscribeUrl(user.userId, "reengagement");
    const template = templates.purchasedNeverGenerated(unsub);
    const messageId = await sendEmail({
      to: user.email,
      ...template,
      tag: "re-engagement",
    });
    await logEmailSent(user.userId, "purchased_never_generated", messageId);
    sent++;
  }
  results.purchased_never_generated = sent;

  // ── Drip sequence ─────────────────────────────────────────

  const dripSchedule: [
    string,
    number,
    (unsubUrl?: string) => { subject: string; html: string },
  ][] = [
    ["drip_welcome", 0, templates.welcomeEmail],
    ["drip_prompt_tips", 4, templates.dripPromptTips],
    ["drip_add_pages", 10, templates.dripAddPages],
    ["drip_custom_domain", 20, templates.dripCustomDomain],
    ["drip_showcase", 30, templates.dripShowcase],
  ];

  for (const [dripType, daysAfter, templateFn] of dripSchedule) {
    const eligible = await getDripEligible(dripType, daysAfter);
    sent = 0;
    for (const user of eligible) {
      const unsub = await generateUnsubscribeUrl(user.userId, "drip");
      const template = templateFn(unsub);
      const messageId = await sendEmail({
        to: user.email,
        ...template,
        tag: "drip",
      });
      await logEmailSent(user.userId, dripType, messageId);
      sent++;
    }
    results[dripType] = sent;
  }

  console.log("Email cron completed:", results);
  return NextResponse.json({ ok: true, sent: results });
}
