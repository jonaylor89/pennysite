import { EMAIL_FROM, getResend } from "./resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Tag for filtering in Resend dashboard (e.g., "re-engagement", "drip", "positive") */
  tag?: string;
}

/**
 * Send a single email via Resend.
 * Returns the Resend message ID on success, null on failure.
 */
export async function sendEmail({
  to,
  subject,
  html,
  tag,
}: SendEmailOptions): Promise<string | null> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      tags: tag ? [{ name: "category", value: tag }] : undefined,
    });

    if (error) {
      console.error(`Failed to send email to ${to}:`, error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err);
    return null;
  }
}
