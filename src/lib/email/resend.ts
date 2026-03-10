import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export const EMAIL_FROM =
  process.env.RESEND_FROM_EMAIL || "Pennysite <noreply@pennysite.app>";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pennysite.app";
