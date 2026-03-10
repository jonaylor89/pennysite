import { generateUnsubscribeUrl } from "@/app/api/email/unsubscribe/route";
import { hasReceivedEmail, isUnsubscribed, logEmailSent } from "./segments";
import { sendEmail } from "./send";
import * as templates from "./templates";

/**
 * Send the "site published" celebration email.
 * Called from the publish API route.
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
 * Called when a user creates their second project.
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
