import { createUnsubscribeToken } from "../../auth/jwt.js";
import {
  hasReceivedEmail,
  isUnsubscribed,
  logEmailSent,
} from "../../db/email.js";
import { sendEmail } from "./send.js";
import * as templates from "./templates.js";
import { config } from "../../config.js";

/**
 * Generate an unsubscribe URL with a signed JWT token.
 */
export async function generateUnsubscribeUrl(
  userId: string,
  category: string,
): Promise<string> {
  const token = await createUnsubscribeToken(userId, category);
  return `${config.siteUrl}/api/email/unsubscribe?token=${token}`;
}

/**
 * Send the "site published" celebration email.
 */
export async function onSitePublished(
  userId: string,
  email: string,
  projectId: string,
  projectName: string,
  deployedUrl: string,
): Promise<void> {
  if (await isUnsubscribed(userId, "all")) return;
  if (await hasReceivedEmail(userId, "site_published", projectId)) return;

  const unsub = await generateUnsubscribeUrl(userId, "all");
  const template = templates.sitePublished(projectName, deployedUrl, unsub);
  const messageId = await sendEmail({
    to: email,
    ...template,
    tag: "positive",
  });
  await logEmailSent(userId, "site_published", messageId, projectId);
}

/**
 * Send the "second site created" email.
 */
export async function onSecondSiteCreated(
  userId: string,
  email: string,
): Promise<void> {
  if (await isUnsubscribed(userId, "all")) return;
  if (await hasReceivedEmail(userId, "second_site_created")) return;

  const unsub = await generateUnsubscribeUrl(userId, "all");
  const template = templates.secondSiteCreated(unsub);
  const messageId = await sendEmail({
    to: email,
    ...template,
    tag: "positive",
  });
  await logEmailSent(userId, "second_site_created", messageId);
}
