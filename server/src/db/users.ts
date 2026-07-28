import { sql } from "./pool.js";

export interface DbUser {
  id: string;
  email: string;
  encrypted_password: string;
  raw_user_meta_data: Record<string, unknown>;
  created_at: string;
}

/**
 * Find a user by email in auth.users (Supabase's auth table).
 */
export async function findUserByEmail(
  email: string,
): Promise<DbUser | null> {
  const rows = await sql`
    SELECT id, email, encrypted_password, raw_user_meta_data, created_at
    FROM auth.users
    WHERE email = ${email}
    LIMIT 1
  `;
  return (rows[0] as DbUser) ?? null;
}

/**
 * Find a user by ID in auth.users.
 */
export async function findUserById(
  userId: string,
): Promise<DbUser | null> {
  const rows = await sql`
    SELECT id, email, encrypted_password, raw_user_meta_data, created_at
    FROM auth.users
    WHERE id = ${userId}::uuid
    LIMIT 1
  `;
  return (rows[0] as DbUser) ?? null;
}

/**
 * Create a new user with email and hashed password.
 */
export async function createUser(
  email: string,
  hashedPassword: string,
  metadata?: Record<string, unknown>,
): Promise<DbUser> {
  const rows = await sql`
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      ${email}, ${hashedPassword},
      NOW(), ${sql.json((metadata ?? {}) as any)}::jsonb,
      NOW(), NOW(), '', '', '', ''
    )
    RETURNING id, email, encrypted_password, raw_user_meta_data, created_at
  `;
  return rows[0] as DbUser;
}

/**
 * Create a passwordless user for guest checkout.
 * Returns existing user if email already exists.
 */
export async function getOrCreateGuestUser(
  email: string,
): Promise<DbUser> {
  // Check if user exists
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  // Create passwordless user
  const rows = await sql`
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      ${email}, '',
      NOW(), ${sql.json({ source: "guest_checkout", needs_password: true } as any)}::jsonb,
      NOW(), NOW(), '', '', '', ''
    )
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id, email, encrypted_password, raw_user_meta_data, created_at
  `;
  return rows[0] as DbUser;
}

/**
 * Update a user's password.
 */
export async function updateUserPassword(
  userId: string,
  hashedPassword: string,
): Promise<void> {
  await sql`
    UPDATE auth.users
    SET encrypted_password = ${hashedPassword},
        raw_user_meta_data = raw_user_meta_data - 'needs_password',
        updated_at = NOW()
    WHERE id = ${userId}::uuid
  `;
}

/**
 * Initialize credit account for a new user (if not exists).
 */
export async function ensureCreditAccount(userId: string): Promise<void> {
  await sql`
    INSERT INTO credit_accounts (user_id, available_credits, reserved_credits, lifetime_purchased_credits, lifetime_spent_credits)
    VALUES (${userId}::uuid, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING
  `;
}

/**
 * Delete a user and all their data.
 */
export async function deleteUser(userId: string): Promise<void> {
  // Delete in order: email_log, email_preferences, generations, credit_ledger,
  // credit_accounts, stripe_customers, pending_generations, projects
  await sql`DELETE FROM email_log WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM email_preferences WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM generations WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM credit_ledger WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM credit_accounts WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM stripe_customers WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM pending_generations WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM projects WHERE user_id = ${userId}::uuid`;
  await sql`DELETE FROM auth.users WHERE id = ${userId}::uuid`;
}
