import type { Context, Next } from "hono";
import { verifyAccessToken } from "./jwt.js";

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Hono middleware that verifies JWT from Authorization: Bearer header
 * and sets c.set("user", { id, email }).
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyAccessToken(token);
    c.set("user", { id: payload.sub, email: payload.email } as AuthUser);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

/**
 * Optional auth middleware — sets user if token present, but doesn't block.
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = await verifyAccessToken(token);
      c.set("user", { id: payload.sub, email: payload.email } as AuthUser);
    } catch {
      // Token invalid, proceed without user
    }
  }
  await next();
}
