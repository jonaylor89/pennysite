import { createAdminClient } from "@/lib/supabase/admin";

interface UserSegment {
  userId: string;
  email: string;
  projectId?: string;
  projectName?: string;
  deployedUrl?: string;
  availableCredits?: number;
}

function mapProjectSegment(r: {
  user_id: string;
  email: string;
  project_id: string;
  project_name: string;
}): UserSegment {
  return {
    userId: r.user_id,
    email: r.email,
    projectId: r.project_id,
    projectName: r.project_name,
  };
}

/**
 * Get users who generated a site but never published it (24h+ ago).
 */
export async function getGeneratedNeverPublished(): Promise<UserSegment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_generated_never_published");
  if (error) {
    console.error("Segment query failed (generated_never_published):", error);
    return [];
  }
  return (data ?? []).map(mapProjectSegment);
}

/**
 * Get users who created a project but haven't edited it in 3+ days.
 */
export async function getCreatedNeverEdited(): Promise<UserSegment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_created_never_edited");
  if (error) {
    console.error("Segment query failed (created_never_edited):", error);
    return [];
  }
  return (data ?? []).map(mapProjectSegment);
}

/**
 * Get users with published sites that haven't been edited in 30+ days.
 */
export async function getPublishedNoEdits(): Promise<UserSegment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_published_no_edits");
  if (error) {
    console.error("Segment query failed (published_no_edits):", error);
    return [];
  }
  return (data ?? []).map(mapProjectSegment);
}

/**
 * Get users who have credits but haven't generated anything in 14+ days.
 */
export async function getHasCreditsIdle(): Promise<UserSegment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_has_credits_idle");
  if (error) {
    console.error("Segment query failed (has_credits_idle):", error);
    return [];
  }
  return (data ?? []).map((r) => ({
    userId: r.user_id,
    email: r.email,
    availableCredits: r.available_credits,
  }));
}

/**
 * Get users who purchased credits but never generated a site (48h+ ago).
 */
export async function getPurchasedNeverGenerated(): Promise<UserSegment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_purchased_never_generated");
  if (error) {
    console.error("Segment query failed (purchased_never_generated):", error);
    return [];
  }
  return (data ?? []).map((r) => ({ userId: r.user_id, email: r.email }));
}

/**
 * Get users eligible for a specific drip email (by day offset from signup).
 */
export async function getDripEligible(
  dripType: string,
  daysAfterSignup: number,
): Promise<UserSegment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_drip_eligible", {
    p_drip_type: dripType,
    p_days_after_signup: daysAfterSignup,
  });
  if (error) {
    console.error(`Segment query failed (drip: ${dripType}):`, error);
    return [];
  }
  return (data ?? []).map((r) => ({ userId: r.user_id, email: r.email }));
}

/**
 * Check if a user has already received a specific email type (optionally for a project).
 */
export async function hasReceivedEmail(
  userId: string,
  emailType: string,
  projectId?: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  let query = supabase
    .from("email_log")
    .select("id")
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .limit(1);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

/**
 * Log that an email was sent.
 */
export async function logEmailSent(
  userId: string,
  emailType: string,
  resendMessageId: string | null,
  projectId?: string,
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("email_log").insert({
    user_id: userId,
    email_type: emailType,
    project_id: projectId ?? null,
    resend_message_id: resendMessageId,
  });

  if (error) {
    console.error("Failed to log email:", error);
  }
}

/**
 * Check if a user has unsubscribed from a category.
 */
export async function isUnsubscribed(
  userId: string,
  category: "all" | "drip" | "reengagement",
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("email_preferences")
    .select("unsubscribed_all, unsubscribed_drip, unsubscribed_reengagement")
    .eq("user_id", userId)
    .single();

  if (!data) return false;

  if (data.unsubscribed_all) return true;
  if (category === "drip") return data.unsubscribed_drip;
  if (category === "reengagement") return data.unsubscribed_reengagement;
  return false;
}
