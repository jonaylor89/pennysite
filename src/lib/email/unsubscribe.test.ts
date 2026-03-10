import { jwtVerify, SignJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("CRON_SECRET", "test-secret-for-unsubscribe");
vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pennysite.app");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSupabaseClient = {
  auth: { autoRefreshToken: false, persistSession: false },
  from: vi.fn(() => ({ upsert: mockUpsert })),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Use relative path to avoid @/ alias resolution issues in vitest
const { generateUnsubscribeUrl, GET } = await import(
  "../../app/api/email/unsubscribe/route"
);

const secret = new TextEncoder().encode("test-secret-for-unsubscribe");

function extractToken(url: string): string {
  const token = new URL(url).searchParams.get("token");
  if (!token) throw new Error("No token in URL");
  return token;
}

describe("generateUnsubscribeUrl", () => {
  it("produces a URL starting with SITE_URL", async () => {
    const url = await generateUnsubscribeUrl("user-1", "all");
    expect(url).toMatch(
      /^https:\/\/pennysite\.app\/api\/email\/unsubscribe\?token=.+/,
    );
  });

  it("embeds the correct userId in the token", async () => {
    const url = await generateUnsubscribeUrl("user-abc", "drip");
    const token = extractToken(url);
    const { payload } = await jwtVerify(token, secret);
    expect(payload.sub).toBe("user-abc");
  });

  it("embeds the correct category in the token", async () => {
    for (const cat of ["all", "drip", "reengagement"] as const) {
      const url = await generateUnsubscribeUrl("user-1", cat);
      const token = extractToken(url);
      const { payload } = await jwtVerify(token, secret);
      expect(payload.cat).toBe(cat);
    }
  });

  it("produces a token with ~90 day expiry", async () => {
    const url = await generateUnsubscribeUrl("user-1", "all");
    const token = extractToken(url);
    const { payload } = await jwtVerify(token, secret);
    const daysUntilExpiry =
      ((payload.exp ?? 0) * 1000 - Date.now()) / 1000 / 60 / 60 / 24;
    expect(daysUntilExpiry).toBeGreaterThan(85);
    expect(daysUntilExpiry).toBeLessThanOrEqual(91);
  });
});

describe("GET /api/email/unsubscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
  });

  it("returns 400 when no token is provided", async () => {
    const req = new Request("https://pennysite.app/api/email/unsubscribe");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid token", async () => {
    const req = new Request(
      "https://pennysite.app/api/email/unsubscribe?token=garbage.invalid.token",
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for an expired token", async () => {
    const token = await new SignJWT({ sub: "user-1", cat: "all" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("-1s")
      .sign(secret);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns HTML content type", async () => {
    const url = await generateUnsubscribeUrl("user-1", "all");
    const token = extractToken(url);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    const res = await GET(req);
    expect(res.headers.get("Content-Type")).toBe("text/html");
  });

  it("unsubscribes from all with 'all' category", async () => {
    const url = await generateUnsubscribeUrl("user-1", "all");
    const token = extractToken(url);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("email_preferences");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        unsubscribed_all: true,
      }),
      { onConflict: "user_id" },
    );
  });

  it("sets unsubscribed_drip for 'drip' category", async () => {
    const url = await generateUnsubscribeUrl("user-2", "drip");
    const token = extractToken(url);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    await GET(req);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-2",
        unsubscribed_drip: true,
      }),
      { onConflict: "user_id" },
    );
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.unsubscribed_all).toBeUndefined();
  });

  it("sets unsubscribed_reengagement for 'reengagement' category", async () => {
    const url = await generateUnsubscribeUrl("user-3", "reengagement");
    const token = extractToken(url);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    await GET(req);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-3",
        unsubscribed_reengagement: true,
      }),
      { onConflict: "user_id" },
    );
  });

  it("returns success message in HTML body", async () => {
    const url = await generateUnsubscribeUrl("user-1", "all");
    const token = extractToken(url);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    const res = await GET(req);
    const body = await res.text();

    expect(body).toContain("You've been unsubscribed");
    expect(body).toContain("<!DOCTYPE html>");
  });

  it("returns 500 when database upsert fails", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "DB error" } });

    const url = await generateUnsubscribeUrl("user-1", "all");
    const token = extractToken(url);

    const req = new Request(
      `https://pennysite.app/api/email/unsubscribe?token=${token}`,
    );
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
