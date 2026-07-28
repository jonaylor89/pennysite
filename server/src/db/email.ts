import { sql } from "./pool.js";

export interface UserSegment {
  userId: string;
  email: string;
  projectId?: string;
  projectName?: string;
  deployedUrl?: string;
  availableCredits?: number;
}

function mapProjectSegment(r: Record<string, unknown>): UserSegment {
  return {
    userId: r.user_id as string,
    email: r.email as string,
    projectId: r.project_id as string | undefined,
    projectName: r.project_name as string | undefined,
  };
}

export async function getGeneratedNeverPublished(): Promise<UserSegment[]> {
  const rows = await sql`SELECT * FROM get_generated_never_published()`;
  return rows.map(mapProjectSegment);
}

export async function getCreatedNeverEdited(): Promise<UserSegment[]> {
  const rows = await sql`SELECT * FROM get_created_never_edited()`;
  return rows.map(mapProjectSegment);
}

export async function getPublishedNoEdits(): Promise<UserSegment[]> {
  const rows = await sql`SELECT * FROM get_published_no_edits()`;
  return rows.map(mapProjectSegment);
}

export async function getHasCreditsIdle(): Promise<UserSegment[]> {
  const rows = await sql`SELECT * FROM get_has_credits_idle()`;
  return rows.map((r) => ({
    userId: r.user_id as string,
    email: r.email as string,
    availableCredits: r.available_credits as number,
  }));
}

export async function getPurchasedNeverGenerated(): Promise<UserSegment[]> {
  const rows = await sql`SELECT * FROM get_purchased_never_generated()`;
  return rows.map((r) => ({
    userId: r.user_id as string,
    email: r.email as string,
  }));
}

export async function getDripEligible(
  dripType: string,
  daysAfterSignup: number,
): Promise<UserSegment[]> {
  const rows = await sql`
    SELECT * FROM get_drip_eligible(${dripType}::text, ${daysAfterSignup}::integer)
  `;
  return rows.map((r) => ({
    userId: r.user_id as string,
    email: r.email as string,
  }));
}

export async function hasReceivedEmail(
  userId: string,
  emailType: string,
  projectId?: string,
): Promise<boolean> {
  if (projectId) {
    const rows = await sql`
      SELECT id FROM email_log
      WHERE user_id = ${userId}::uuid
        AND email_type = ${emailType}
        AND project_id = ${projectId}::uuid
      LIMIT 1
    `;
    return rows.length > 0;
  }
  const rows = await sql`
    SELECT id FROM email_log
    WHERE user_id = ${userId}::uuid AND email_type = ${emailType}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function logEmailSent(
  userId: string,
  emailType: string,
  resendMessageId: string | null,
  projectId?: string,
): Promise<void> {
  await sql`
    INSERT INTO email_log (user_id, email_type, project_id, resend_message_id)
    VALUES (${userId}::uuid, ${emailType}, ${projectId ?? null}::uuid, ${resendMessageId})
  `;
}

export async function isUnsubscribed(
  userId: string,
  category: "all" | "drip" | "reengagement",
): Promise<boolean> {
  const rows = await sql`
    SELECT unsubscribed_all, unsubscribed_drip, unsubscribed_reengagement
    FROM email_preferences
    WHERE user_id = ${userId}::uuid
    LIMIT 1
  `;
  const data = rows[0];
  if (!data) return false;
  if (data.unsubscribed_all) return true;
  if (category === "drip") return data.unsubscribed_drip as boolean;
  if (category === "reengagement")
    return data.unsubscribed_reengagement as boolean;
  return false;
}

export async function getEmailPreferences(userId: string) {
  const rows = await sql`
    SELECT * FROM email_preferences WHERE user_id = ${userId}::uuid LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateEmailPreferences(
  userId: string,
  prefs: {
    unsubscribed_all?: boolean;
    unsubscribed_drip?: boolean;
    unsubscribed_reengagement?: boolean;
  },
): Promise<void> {
  await sql`
    INSERT INTO email_preferences (user_id, unsubscribed_all, unsubscribed_drip, unsubscribed_reengagement)
    VALUES (
      ${userId}::uuid,
      ${prefs.unsubscribed_all ?? false},
      ${prefs.unsubscribed_drip ?? false},
      ${prefs.unsubscribed_reengagement ?? false}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      unsubscribed_all = COALESCE(${prefs.unsubscribed_all ?? null}::boolean, email_preferences.unsubscribed_all),
      unsubscribed_drip = COALESCE(${prefs.unsubscribed_drip ?? null}::boolean, email_preferences.unsubscribed_drip),
      unsubscribed_reengagement = COALESCE(${prefs.unsubscribed_reengagement ?? null}::boolean, email_preferences.unsubscribed_reengagement),
      updated_at = NOW()
  `;
}

export async function unsubscribeByCategory(
  userId: string,
  category: string,
): Promise<void> {
  if (category === "all") {
    await updateEmailPreferences(userId, { unsubscribed_all: true });
  } else if (category === "drip") {
    await updateEmailPreferences(userId, { unsubscribed_drip: true });
  } else if (category === "reengagement") {
    await updateEmailPreferences(userId, {
      unsubscribed_reengagement: true,
    });
  }
}
