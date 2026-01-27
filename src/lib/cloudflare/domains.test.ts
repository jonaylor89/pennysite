import { beforeEach, describe, expect, it } from "vitest";
import { getDomainInstructions } from "./domains";

const originalEnv = { ...process.env };

describe("Cloudflare Pages custom domains", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getDomainInstructions", () => {
    it("should return CNAME instructions for subdomain", () => {
      const result = getDomainInstructions("my-project-abc123", "blog.example.com");

      expect(result.type).toBe("CNAME");
      expect(result.host).toBe("blog");
      expect(result.target).toBe("my-project-abc123.pages.dev");
      expect(result.instructions).toContain("blog");
      expect(result.instructions).toContain("my-project-abc123.pages.dev");
    });

    it("should return CNAME instructions for deeply nested subdomain", () => {
      const result = getDomainInstructions(
        "my-project-abc123",
        "app.staging.example.com",
      );

      expect(result.type).toBe("CNAME");
      expect(result.host).toBe("app");
      expect(result.target).toBe("my-project-abc123.pages.dev");
    });

    it("should handle apex domain with special instructions", () => {
      const result = getDomainInstructions("my-project-abc123", "example.com");

      expect(result.type).toBe("CNAME");
      expect(result.host).toBe("@");
      expect(result.target).toBe("my-project-abc123.pages.dev");
      expect(result.instructions).toContain("Cloudflare DNS");
    });

    it("should handle single-word TLD apex domain", () => {
      const result = getDomainInstructions("my-project-abc123", "example.io");

      expect(result.type).toBe("CNAME");
      expect(result.host).toBe("@");
    });
  });

  describe("domain validation regex", () => {
    const isValidDomain = (domain: string): boolean => {
      const domainRegex =
        /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      return domainRegex.test(domain);
    };

    it("should accept valid subdomain", () => {
      expect(isValidDomain("blog.example.com")).toBe(true);
      expect(isValidDomain("shop.example.com")).toBe(true);
      expect(isValidDomain("my-site.example.com")).toBe(true);
    });

    it("should accept valid apex domain", () => {
      expect(isValidDomain("example.com")).toBe(true);
      expect(isValidDomain("example.io")).toBe(true);
      expect(isValidDomain("my-site.co.uk")).toBe(true);
    });

    it("should accept deeply nested subdomains", () => {
      expect(isValidDomain("app.staging.example.com")).toBe(true);
      expect(isValidDomain("a.b.c.d.example.com")).toBe(true);
    });

    it("should reject invalid domains", () => {
      expect(isValidDomain("")).toBe(false);
      expect(isValidDomain("example")).toBe(false);
      expect(isValidDomain("http://example.com")).toBe(false);
      expect(isValidDomain("https://example.com")).toBe(false);
      expect(isValidDomain("example.com/path")).toBe(false);
      expect(isValidDomain(".example.com")).toBe(false);
      expect(isValidDomain("example.")).toBe(false);
      expect(isValidDomain("-example.com")).toBe(false);
    });

    it("should reject domains with invalid characters", () => {
      expect(isValidDomain("ex ample.com")).toBe(false);
      expect(isValidDomain("example_.com")).toBe(false);
      expect(isValidDomain("example!.com")).toBe(false);
    });
  });

  describe("integration tests (require CLOUDFLARE credentials)", () => {
    const runIntegrationTests =
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_API_TOKEN &&
      process.env.TEST_CF_PROJECT_NAME;

    it.skipIf(!runIntegrationTests)(
      "should add, get, and remove a custom domain",
      { timeout: 30000 },
      async () => {
        const { addCustomDomain, getCustomDomain, removeCustomDomain } =
          await import("./domains");

        const cfProjectName = process.env.TEST_CF_PROJECT_NAME ?? "";
        if (!cfProjectName) throw new Error("TEST_CF_PROJECT_NAME not set");

        const testDomain = `test-${Date.now()}.example.com`;

        try {
          const added = await addCustomDomain(cfProjectName, testDomain);
          expect(added.name).toBe(testDomain);
          expect(["pending", "active"]).toContain(added.status);

          const fetched = await getCustomDomain(cfProjectName, testDomain);
          expect(fetched).not.toBeNull();
          expect(fetched?.name).toBe(testDomain);
        } finally {
          await removeCustomDomain(cfProjectName, testDomain).catch(() => {});
        }
      },
    );

    it.skipIf(!runIntegrationTests)(
      "should return null for non-existent domain",
      { timeout: 10000 },
      async () => {
        const { getCustomDomain } = await import("./domains");

        const cfProjectName = process.env.TEST_CF_PROJECT_NAME ?? "";
        if (!cfProjectName) throw new Error("TEST_CF_PROJECT_NAME not set");

        const result = await getCustomDomain(
          cfProjectName,
          "nonexistent-domain-12345.example.com",
        );
        expect(result).toBeNull();
      },
    );
  });
});
