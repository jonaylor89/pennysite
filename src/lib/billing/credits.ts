import { createClient as createServiceClient } from "@supabase/supabase-js";

// Service role client for billing operations (bypasses RLS)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  }

  return createServiceClient(url, secretKey);
}

export interface CreditBalance {
  availableCredits: number;
  reservedCredits: number;
}

export async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const supabase = getServiceClient();

  const { data, error } = await supabase.rpc("get_credit_balance", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Failed to get credit balance:", error);
    throw new Error("Failed to get credit balance");
  }

  const row = data?.[0];
  return {
    availableCredits: row?.available_credits ?? 0,
    reservedCredits: row?.reserved_credits ?? 0,
  };
}

export async function reserveCreditsForGeneration(
  userId: string,
  reservedCredits: number,
  idempotencyKey: string,
  projectId?: string,
): Promise<string> {
  const supabase = getServiceClient();

  const { data, error } = await supabase.rpc("reserve_credits_for_generation", {
    p_user_id: userId,
    p_reserved_credits: reservedCredits,
    p_idempotency_key: idempotencyKey,
    p_project_id: projectId ?? null,
  });

  if (error) {
    if (error.message.includes("INSUFFICIENT_CREDITS")) {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    console.error("Failed to reserve credits:", error);
    throw new Error("Failed to reserve credits");
  }

  return data as string;
}

export async function finalizeGenerationCredits(
  userId: string,
  generationId: string,
  success: boolean,
  actualCredits?: number,
  inputTokens?: number,
  outputTokens?: number,
  totalTokens?: number,
  errorMessage?: string,
): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase.rpc("finalize_generation_credits", {
    p_user_id: userId,
    p_generation_id: generationId,
    p_success: success,
    p_actual_credits: actualCredits ?? null,
    p_input_tokens: inputTokens ?? null,
    p_output_tokens: outputTokens ?? null,
    p_total_tokens: totalTokens ?? null,
    p_error: errorMessage ?? null,
  });

  if (error) {
    console.error("Failed to finalize generation credits:", error);
    throw new Error("Failed to finalize generation credits");
  }
}

export async function addCreditsFromPurchase(
  userId: string,
  credits: number,
  stripeEventId: string,
): Promise<boolean> {
  const supabase = getServiceClient();

  const { data, error } = await supabase.rpc("add_credits_from_purchase", {
    p_user_id: userId,
    p_credits: credits,
    p_stripe_event_id: stripeEventId,
  });

  if (error) {
    console.error("Failed to add credits from purchase:", error);
    throw new Error("Failed to add credits from purchase");
  }

  return data as boolean;
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<string> {
  const supabase = getServiceClient();

  // Check if customer exists
  const { data: existing } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create new Stripe customer
  const { getStripe } = await import("@/lib/stripe/stripe");
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });

  // Store mapping
  const { error } = await supabase.from("stripe_customers").insert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });

  if (error) {
    console.error("Failed to store Stripe customer:", error);
  }

  return customer.id;
}
