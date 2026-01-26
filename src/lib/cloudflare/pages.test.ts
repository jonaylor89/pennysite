import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

const originalEnv = { ...process.env };

function hashFile(path: string, content: Buffer): string {
  const base64Content = content.toString("base64");
  return crypto
    .createHash("sha256")
    .update(base64Content + path)
    .digest("hex")
    .slice(0, 32);
}

describe("Cloudflare Pages deployment", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  describe("hashFile", () => {
    it("should produce consistent 32-character hex hashes", () => {
      const content = Buffer.from("<html><body>Hello</body></html>", "utf-8");
      const hash = hashFile("/index.html", content);

      expect(hash).toHaveLength(32);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it("should produce different hashes for different paths", () => {
      const content = Buffer.from("<html><body>Hello</body></html>", "utf-8");

      const hash1 = hashFile("/index.html", content);
      const hash2 = hashFile("/about.html", content);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hashes for different content", () => {
      const content1 = Buffer.from("<html><body>Hello</body></html>", "utf-8");
      const content2 = Buffer.from("<html><body>World</body></html>", "utf-8");

      const hash1 = hashFile("/index.html", content1);
      const hash2 = hashFile("/index.html", content2);

      expect(hash1).not.toBe(hash2);
    });

    it("should match the expected hash format (base64 + path)", () => {
      const content = Buffer.from("test", "utf-8");
      const path = "/test.html";

      const expectedInput = content.toString("base64") + path;
      const expectedHash = crypto
        .createHash("sha256")
        .update(expectedInput)
        .digest("hex")
        .slice(0, 32);

      const actualHash = hashFile(path, content);
      expect(actualHash).toBe(expectedHash);
    });
  });

  describe("integration tests (require CLOUDFLARE credentials)", () => {
    const runIntegrationTests =
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_API_TOKEN &&
      process.env.TEST_CF_PROJECT_NAME;

    it.skipIf(!runIntegrationTests)(
      "should deploy a simple HTML page and serve it",
      { timeout: 60000 },
      async () => {
        const { deployPages } = await import("./pages");

        const cfProjectName = process.env.TEST_CF_PROJECT_NAME ?? "";
        if (!cfProjectName) throw new Error("TEST_CF_PROJECT_NAME not set");
        const testHtml = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Integration Test ${Date.now()}</h1></body>
</html>`;

        const result = await deployPages(cfProjectName, {
          "index.html": testHtml,
        });

        expect(result.url).toBeTruthy();
        expect(result.url).toMatch(/\.pages\.dev/);

        await new Promise((r) => setTimeout(r, 5000));

        const response = await fetch(result.url);
        expect(response.status).toBe(200);

        const body = await response.text();
        expect(body).toContain("Integration Test");
      },
    );
  });
});
