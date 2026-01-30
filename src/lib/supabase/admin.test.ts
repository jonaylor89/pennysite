import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the createClient from @supabase/supabase-js
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock environment variables
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret-key");

const mockSupabaseClient = {
  auth: {
    admin: {
      listUsers: vi.fn(),
      createUser: vi.fn(),
      getUserById: vi.fn(),
      generateLink: vi.fn(),
    },
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        is: vi.fn(() => ({
          gt: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
};

describe("admin utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateUserByEmail", () => {
    it("returns existing user if found", async () => {
      const existingUser = { id: "user-123", email: "test@example.com" };
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [existingUser] },
      });

      const { getOrCreateUserByEmail } = await import("./admin");
      const result = await getOrCreateUserByEmail("test@example.com");

      expect(result).toEqual(existingUser);
      expect(mockSupabaseClient.auth.admin.createUser).not.toHaveBeenCalled();
    });

    it("creates new user if not found", async () => {
      const newUser = {
        id: "new-user-456",
        email: "new@example.com",
        user_metadata: { source: "guest_checkout", needs_password: true },
      };
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
      });
      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: { user: newUser },
        error: null,
      });

      const { getOrCreateUserByEmail } = await import("./admin");
      const result = await getOrCreateUserByEmail("new@example.com");

      expect(result).toEqual(newUser);
      expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
        email: "new@example.com",
        email_confirm: true,
        user_metadata: {
          source: "guest_checkout",
          needs_password: true,
        },
      });
    });

    it("throws error when createUser fails", async () => {
      mockSupabaseClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
      });
      mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: "Email already exists" },
      });

      const { getOrCreateUserByEmail } = await import("./admin");

      await expect(getOrCreateUserByEmail("test@example.com")).rejects.toThrow(
        "Failed to create user",
      );
    });
  });

  describe("generateMagicLinkToken", () => {
    it("returns hashed token on success", async () => {
      mockSupabaseClient.auth.admin.generateLink.mockResolvedValue({
        data: { properties: { hashed_token: "magic-token-123" } },
        error: null,
      });

      const { generateMagicLinkToken } = await import("./admin");
      const result = await generateMagicLinkToken("test@example.com");

      expect(result).toBe("magic-token-123");
      expect(mockSupabaseClient.auth.admin.generateLink).toHaveBeenCalledWith({
        type: "magiclink",
        email: "test@example.com",
      });
    });

    it("returns null on error", async () => {
      mockSupabaseClient.auth.admin.generateLink.mockResolvedValue({
        data: null,
        error: { message: "Failed to generate link" },
      });

      const { generateMagicLinkToken } = await import("./admin");
      const result = await generateMagicLinkToken("test@example.com");

      expect(result).toBeNull();
    });
  });
});
