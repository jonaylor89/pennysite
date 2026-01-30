import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Creates a Supabase admin client using the secret key.
 * This client bypasses RLS and has full access to the database.
 * Only use server-side.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY for admin client",
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get or create a user by email address.
 * Used for guest checkout flow where we create passwordless users.
 */
export async function getOrCreateUserByEmail(email: string) {
  const supabase = createAdminClient();

  // Check if user already exists
  const { data: existingData } = await supabase.auth.admin.listUsers();
  const existingUser = existingData?.users?.find((u) => u.email === email);

  if (existingUser) {
    return existingUser;
  }

  // Create new passwordless user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true, // Auto-confirm since they paid
    user_metadata: {
      source: "guest_checkout",
      needs_password: true,
    },
  });

  if (error) {
    console.error("Failed to create user:", error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data.user;
}

/**
 * Store a pending generation for retrieval after Stripe checkout.
 */
export async function storePendingGeneration(
  checkoutSessionId: string,
  userId: string,
  prompt: string,
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("pending_generations").insert({
    checkout_session_id: checkoutSessionId,
    user_id: userId,
    prompt_token: prompt, // Using prompt_token column to store raw prompt
  });

  if (error) {
    console.error("Failed to store pending generation:", error);
    console.error("Error details:", JSON.stringify(error));
    throw new Error(`Failed to store pending generation: ${error.message}`);
  }

  console.log(
    `storePendingGeneration: Successfully stored for session ${checkoutSessionId}`,
  );
}

/**
 * Retrieve and consume a pending generation by checkout session ID.
 * Returns null if not found or already consumed.
 */
export async function consumePendingGeneration(
  checkoutSessionId: string,
): Promise<{
  userId: string;
  prompt: string;
} | null> {
  const supabase = createAdminClient();

  // Get the pending generation
  const { data: pending, error: fetchError } = await supabase
    .from("pending_generations")
    .select("id, user_id, prompt_token")
    .eq("checkout_session_id", checkoutSessionId)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (fetchError) {
    console.log(
      `consumePendingGeneration: Query error for session ${checkoutSessionId}:`,
      fetchError.message,
    );
    return null;
  }

  if (!pending) {
    console.log(
      `consumePendingGeneration: No pending record found for session ${checkoutSessionId}`,
    );
    return null;
  }

  // Mark as consumed
  const { error: updateError } = await supabase
    .from("pending_generations")
    .update({ consumed_at: new Date().toISOString() })
    .eq(
      "id",
      (pending as { id: string; user_id: string; prompt_token: string }).id,
    );

  if (updateError) {
    console.error(
      "Failed to mark pending generation as consumed:",
      updateError,
    );
  }

  const typedPending = pending as {
    id: string;
    user_id: string;
    prompt_token: string;
  };

  return {
    userId: typedPending.user_id,
    prompt: typedPending.prompt_token, // prompt_token column stores the raw prompt
  };
}

/**
 * Generate a magic link for a user to establish their session.
 */
export async function generateMagicLinkToken(
  email: string,
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) {
    console.error("Failed to generate magic link:", error);
    return null;
  }

  return data?.properties?.hashed_token ?? null;
}
