import { hash, verify } from "@node-rs/bcrypt";

/**
 * Verify a plaintext password against a bcrypt hash.
 * Compatible with Supabase GoTrue's default bcrypt hashes.
 */
export async function verifyPassword(
  plaintext: string,
  bcryptHash: string,
): Promise<boolean> {
  return verify(plaintext, bcryptHash);
}

/**
 * Hash a password using bcrypt with cost factor 10 (matches GoTrue default).
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return hash(plaintext, 10);
}
