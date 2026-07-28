import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../auth/jwt.js";
import { hashPassword, verifyPassword } from "../auth/passwords.js";
import {
  createUser,
  ensureCreditAccount,
  findUserByEmail,
  findUserById,
  updateUserPassword,
} from "../db/users.js";

const auth = new Hono();

/**
 * POST /api/auth/signup
 */
auth.post("/signup", async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (!email || !password || password.length < 6) {
    return c.json(
      { error: "Email and password (min 6 chars) required" },
      400,
    );
  }

  const existing = await findUserByEmail(email);
  if (existing?.encrypted_password) {
    return c.json({ error: "User already exists" }, 409);
  }

  const hashed = await hashPassword(password);

  let user;
  if (existing && !existing.encrypted_password) {
    // Guest user upgrading — set their password
    await updateUserPassword(existing.id, hashed);
    user = existing;
  } else {
    user = await createUser(email, hashed);
  }

  await ensureCreditAccount(user.id);

  const accessToken = await createAccessToken(user.id, user.email);
  const refreshToken = await createRefreshToken(user.id, user.email);

  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return c.json({
    user: { id: user.id, email: user.email },
    accessToken,
  });
});

/**
 * POST /api/auth/login
 */
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  const user = await findUserByEmail(email);
  if (!user || !user.encrypted_password) {
    return c.json({ error: "Invalid login credentials" }, 401);
  }

  const valid = await verifyPassword(password, user.encrypted_password);
  if (!valid) {
    return c.json({ error: "Invalid login credentials" }, 401);
  }

  const accessToken = await createAccessToken(user.id, user.email);
  const refreshToken = await createRefreshToken(user.id, user.email);

  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return c.json({
    user: { id: user.id, email: user.email },
    accessToken,
  });
});

/**
 * POST /api/auth/refresh
 * Uses the httpOnly refresh_token cookie to issue a new access token.
 */
auth.post("/refresh", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/refresh_token=([^;]+)/);
  const refreshToken = match?.[1];

  if (!refreshToken) {
    return c.json({ error: "No refresh token" }, 401);
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const user = await findUserById(payload.sub);
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    const accessToken = await createAccessToken(user.id, user.email);

    // Rotate refresh token
    const newRefreshToken = await createRefreshToken(user.id, user.email);
    setCookie(c, "refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return c.json({
      user: { id: user.id, email: user.email },
      accessToken,
    });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});

/**
 * GET /api/auth/me
 * Returns current user from refresh token cookie (used on app load).
 */
auth.get("/me", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/refresh_token=([^;]+)/);
  const refreshToken = match?.[1];

  if (!refreshToken) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const user = await findUserById(payload.sub);
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    const accessToken = await createAccessToken(user.id, user.email);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.raw_user_meta_data,
        created_at: user.created_at,
      },
      accessToken,
    });
  } catch {
    return c.json({ error: "Invalid session" }, 401);
  }
});

/**
 * POST /api/auth/logout
 */
auth.post("/logout", async (c) => {
  deleteCookie(c, "refresh_token", { path: "/" });
  return c.json({ ok: true });
});

/**
 * POST /api/auth/set-password
 * For guest checkout users who need to set a password.
 * Requires a valid access token.
 */
auth.post("/set-password", async (c) => {
  // This route needs auth — check Bearer token
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { verifyAccessToken } = await import("../auth/jwt.js");
  try {
    const payload = await verifyAccessToken(authHeader.slice(7));
    const { password } = await c.req.json<{ password: string }>();

    if (!password || password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const hashed = await hashPassword(password);
    await updateUserPassword(payload.sub, hashed);

    return c.json({ ok: true });
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});

export default auth;
