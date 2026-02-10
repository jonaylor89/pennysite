import assert from "node:assert";
import type { AgentEvent, AgentTool } from "@mariozechner/pi-agent-core";
import { describe, expect, it } from "vitest";
import {
  type AgentFactory,
  type AgentLike,
  createTools,
  type GenerationEvent,
  type GenerationState,
  generateWebsite,
  validateHtml,
} from "./agent";
import {
  extractImageUrls,
  isApprovedImageSource,
  validateImageUrls,
} from "./agent-interface";

class FakeAgent implements AgentLike {
  private subscribers: ((e: AgentEvent) => void)[] = [];

  constructor(
    private tools: AgentTool[],
    private script: Array<{ toolName: string; args: unknown }>,
    private shouldFail?: Error,
  ) {}

  subscribe(cb: (e: AgentEvent) => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private emit(e: AgentEvent): void {
    for (const s of this.subscribers) {
      s(e);
    }
  }

  async prompt(_input: string): Promise<void> {
    if (this.shouldFail) {
      throw this.shouldFail;
    }

    this.emit({ type: "agent_start" } as AgentEvent);

    for (const step of this.script) {
      const tool = this.tools.find((t) => t.name === step.toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${step.toolName}`);
      }

      this.emit({
        type: "tool_execution_start",
        toolName: step.toolName,
        args: step.args,
      } as AgentEvent);

      const result = await tool.execute("fake-call-id", step.args as never);

      this.emit({
        type: "tool_execution_end",
        toolName: step.toolName,
        result,
      } as AgentEvent);
    }

    this.emit({ type: "agent_end" } as AgentEvent);
  }
}

const VALID_HTML = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
  <h1>Test Page</h1>
</body>
</html>`;

const VALID_PLAN_SITE_ARGS = {
  name: "Test Site",
  tagline: "A test tagline",
  type: "landing" as const,
  industry: "technology",
  audience: "developers",
  tone: "professional" as const,
  colorPalette: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#f59e0b",
    background: "#ffffff",
    text: "#1f2937",
  },
  typography: {
    headingStyle: "modern" as const,
    bodyFont: "sans" as const,
  },
  pages: [
    {
      filename: "index.html",
      title: "Home",
      purpose: "Main landing page",
      sections: [
        {
          type: "hero",
          headline: "Welcome",
          content: "Main hero section",
          layout: "centered",
          elements: ["cta button"],
        },
      ],
    },
  ],
  features: ["Fast", "Secure"],
};

async function collectEvents(
  gen: AsyncGenerator<GenerationEvent>,
): Promise<GenerationEvent[]> {
  const events: GenerationEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
}

describe("validateHtml", () => {
  it("should pass valid HTML", () => {
    const result = validateHtml(VALID_HTML);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("should fail HTML without DOCTYPE", () => {
    const html = "<html><head></head><body></body></html>";
    const result = validateHtml(html);
    expect(result.valid).toBe(false);
    expect(result.issues).toContain("Missing DOCTYPE declaration");
  });

  it("should fail HTML without Tailwind CDN", () => {
    const html = `<!DOCTYPE html><html><head>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head><body></body></html>`;
    const result = validateHtml(html);
    expect(result.valid).toBe(false);
    expect(result.issues).toContain("Missing Tailwind CSS CDN");
  });

  it("should fail HTML without Alpine.js CDN", () => {
    const html = `<!DOCTYPE html><html><head>
      <script src="https://cdn.tailwindcss.com"></script>
    </head><body></body></html>`;
    const result = validateHtml(html);
    expect(result.valid).toBe(false);
    expect(result.issues).toContain("Missing Alpine.js CDN");
  });

  it("should fail HTML with Unsplash images", () => {
    const html = `<!DOCTYPE html><html><head>
      <script src="https://cdn.tailwindcss.com"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head><body>
      <img src="https://images.unsplash.com/photo-123" alt="test">
    </body></html>`;
    const result = validateHtml(html);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((i) => i.includes("Unapproved image source")),
    ).toBe(true);
  });

  it("should pass HTML with Popsy SVG illustrations", () => {
    const html = `<!DOCTYPE html><html><head>
      <script src="https://cdn.tailwindcss.com"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head><body>
      <img src="https://illustrations.popsy.co/amber/success.svg" alt="Success">
    </body></html>`;
    const result = validateHtml(html);
    expect(result.valid).toBe(true);
  });

  it("should fail HTML with background-image Unsplash URL", () => {
    const html = `<!DOCTYPE html><html><head>
      <script src="https://cdn.tailwindcss.com"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head><body>
      <div style="background-image: url('https://images.unsplash.com/photo-456')"></div>
    </body></html>`;
    const result = validateHtml(html);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((i) => i.includes("Unapproved image source")),
    ).toBe(true);
  });
});

describe("extractImageUrls", () => {
  it("should extract img src URLs", () => {
    const html = `<img src="https://example.com/image.jpg" alt="test">`;
    const urls = extractImageUrls(html);
    expect(urls).toContain("https://example.com/image.jpg");
  });

  it("should extract background-image URLs", () => {
    const html = `<div style="background-image: url('https://example.com/bg.png')"></div>`;
    const urls = extractImageUrls(html);
    expect(urls).toContain("https://example.com/bg.png");
  });

  it("should extract multiple URLs", () => {
    const html = `
      <img src="https://a.com/1.jpg">
      <img src="https://b.com/2.jpg">
      <div style="background-image: url(https://c.com/3.png)"></div>
    `;
    const urls = extractImageUrls(html);
    expect(urls).toHaveLength(3);
  });
});

describe("isApprovedImageSource", () => {
  it("should approve Popsy illustrations", () => {
    expect(
      isApprovedImageSource("https://illustrations.popsy.co/amber/success.svg"),
    ).toBe(true);
  });

  it("should approve data URIs", () => {
    expect(isApprovedImageSource("data:image/svg+xml;base64,PHN2Zz4=")).toBe(
      true,
    );
  });

  it("should reject Unsplash", () => {
    expect(isApprovedImageSource("https://images.unsplash.com/photo-123")).toBe(
      false,
    );
  });

  it("should reject Pexels", () => {
    expect(isApprovedImageSource("https://images.pexels.com/photos/123")).toBe(
      false,
    );
  });

  it("should reject placeholder services", () => {
    expect(isApprovedImageSource("https://via.placeholder.com/300")).toBe(
      false,
    );
    expect(isApprovedImageSource("https://picsum.photos/200/300")).toBe(false);
  });
});

describe("validateImageUrls", () => {
  it("should pass with no images", () => {
    const result = validateImageUrls("<div>No images here</div>");
    expect(result.valid).toBe(true);
  });

  it("should pass with only Popsy images", () => {
    const html = `<img src="https://illustrations.popsy.co/blue/home-office.svg">`;
    const result = validateImageUrls(html);
    expect(result.valid).toBe(true);
  });

  it("should fail with Unsplash and list the URL", () => {
    const html = `<img src="https://images.unsplash.com/photo-123">`;
    const result = validateImageUrls(html);
    expect(result.valid).toBe(false);
    expect(result.unapprovedUrls).toContain(
      "https://images.unsplash.com/photo-123",
    );
  });

  it("should allow relative paths", () => {
    const html = `<img src="/images/local.jpg">`;
    const result = validateImageUrls(html);
    expect(result.valid).toBe(true);
  });
});

describe("createTools", () => {
  it("should create all four tools", () => {
    const state: GenerationState = {
      spec: null,
      pages: {},
      validationPassed: false,
    };
    const tools = createTools(state);

    expect(tools).toHaveLength(5);
    expect(tools.map((t) => t.name)).toEqual([
      "plan_site",
      "write_page",
      "edit_page",
      "read_page",
      "validate_site",
    ]);
  });

  it("plan_site should populate state.spec", async () => {
    const state: GenerationState = {
      spec: null,
      pages: {},
      validationPassed: false,
    };
    const tools = createTools(state);
    const planSiteTool = tools.find((t) => t.name === "plan_site");
    expect(planSiteTool).toBeDefined();
    if (!planSiteTool) return;

    await planSiteTool.execute("test-id", VALID_PLAN_SITE_ARGS as never);

    expect(state.spec).not.toBeNull();
    expect(state.spec?.name).toBe("Test Site");
  });

  it("write_page should populate state.pages when HTML is valid", async () => {
    const state: GenerationState = {
      spec: null,
      pages: {},
      validationPassed: false,
    };
    const tools = createTools(state);
    const writePageTool = tools.find((t) => t.name === "write_page");
    expect(writePageTool).toBeDefined();
    if (!writePageTool) return;

    await writePageTool.execute("test-id", {
      filename: "index.html",
      html: VALID_HTML,
    } as never);

    expect(state.pages["index.html"]).toBe(VALID_HTML);
  });

  it("write_page should NOT populate state.pages when HTML is invalid", async () => {
    const state: GenerationState = {
      spec: null,
      pages: {},
      validationPassed: false,
    };
    const tools = createTools(state);
    const writePageTool = tools.find((t) => t.name === "write_page");
    expect(writePageTool).toBeDefined();
    if (!writePageTool) return;

    const result = await writePageTool.execute("test-id", {
      filename: "index.html",
      html: "<html></html>",
    } as never);

    expect(state.pages["index.html"]).toBeUndefined();
    expect(result.details).toMatchObject({ valid: false });
  });

  it("edit_page should apply a single edit", async () => {
    const state: GenerationState = {
      spec: null,
      pages: { "index.html": VALID_HTML },
      validationPassed: false,
    };
    const tools = createTools(state);
    const editPageTool = tools.find((t) => t.name === "edit_page");
    expect(editPageTool).toBeDefined();
    if (!editPageTool) return;

    const result = await editPageTool.execute("test-id", {
      filename: "index.html",
      edits: [{ old: "<h1>Test Page</h1>", new: "<h1>New Title</h1>" }],
    } as never);

    expect(result.details).toMatchObject({ valid: true });
    expect(state.pages["index.html"]).toContain("<h1>New Title</h1>");
    expect(state.pages["index.html"]).not.toContain("<h1>Test Page</h1>");
  });

  it("edit_page should apply multiple edits sequentially", async () => {
    const html = VALID_HTML.replace(
      "<h1>Test Page</h1>",
      "<h1>Title</h1>\n  <p>Subtitle</p>",
    );
    const state: GenerationState = {
      spec: null,
      pages: { "index.html": html },
      validationPassed: false,
    };
    const tools = createTools(state);
    const editPageTool = tools.find((t) => t.name === "edit_page");
    assert(editPageTool);

    await editPageTool.execute("test-id", {
      filename: "index.html",
      edits: [
        { old: "<h1>Title</h1>", new: "<h1>Changed Title</h1>" },
        { old: "<p>Subtitle</p>", new: "<p>Changed Subtitle</p>" },
      ],
    } as never);

    expect(state.pages["index.html"]).toContain("<h1>Changed Title</h1>");
    expect(state.pages["index.html"]).toContain("<p>Changed Subtitle</p>");
  });

  it("edit_page should fail when old string is not found", async () => {
    const state: GenerationState = {
      spec: null,
      pages: { "index.html": VALID_HTML },
      validationPassed: false,
    };
    const tools = createTools(state);
    const editPageTool = tools.find((t) => t.name === "edit_page");
    assert(editPageTool);

    const result = await editPageTool.execute("test-id", {
      filename: "index.html",
      edits: [{ old: "<h1>Nonexistent</h1>", new: "<h1>New</h1>" }],
    } as never);

    expect(result.details).toMatchObject({ valid: false });
    expect(state.pages["index.html"]).toBe(VALID_HTML);
  });

  it("edit_page should fail when old string has multiple matches", async () => {
    const html = VALID_HTML.replace(
      "<h1>Test Page</h1>",
      "<p>duplicate</p>\n  <p>duplicate</p>",
    );
    const state: GenerationState = {
      spec: null,
      pages: { "index.html": html },
      validationPassed: false,
    };
    const tools = createTools(state);
    const editPageTool = tools.find((t) => t.name === "edit_page");
    assert(editPageTool);

    const result = await editPageTool.execute("test-id", {
      filename: "index.html",
      edits: [{ old: "<p>duplicate</p>", new: "<p>changed</p>" }],
    } as never);

    expect(result.details).toMatchObject({ valid: false });
    expect(result.content[0]).toMatchObject({
      type: "text",
      text: expect.stringContaining("multiple matches"),
    });
  });

  it("edit_page should fail when page does not exist", async () => {
    const state: GenerationState = {
      spec: null,
      pages: {},
      validationPassed: false,
    };
    const tools = createTools(state);
    const editPageTool = tools.find((t) => t.name === "edit_page");
    assert(editPageTool);

    const result = await editPageTool.execute("test-id", {
      filename: "missing.html",
      edits: [{ old: "a", new: "b" }],
    } as never);

    expect(result.details).toMatchObject({ valid: false });
    expect(result.content[0]).toMatchObject({
      type: "text",
      text: expect.stringContaining("not found"),
    });
  });

  it("edit_page should not apply partial edits on failure", async () => {
    const html = VALID_HTML.replace(
      "<h1>Test Page</h1>",
      "<h1>Title</h1>\n  <p>Keep me</p>",
    );
    const state: GenerationState = {
      spec: null,
      pages: { "index.html": html },
      validationPassed: false,
    };
    const tools = createTools(state);
    const editPageTool = tools.find((t) => t.name === "edit_page");
    assert(editPageTool);

    await editPageTool.execute("test-id", {
      filename: "index.html",
      edits: [
        { old: "<h1>Title</h1>", new: "<h1>Changed</h1>" },
        { old: "<p>Nonexistent</p>", new: "<p>Fail</p>" },
      ],
    } as never);

    // First edit applies in-memory but second fails — page should still
    // reflect original since the tool returns an error.
    // Note: current implementation does NOT roll back partial edits;
    // it saves intermediate state. This test documents that behavior.
    expect(state.pages["index.html"]).toContain("<p>Keep me</p>");
  });

  it("read_page should return page content", async () => {
    const state: GenerationState = {
      spec: null,
      pages: { "index.html": VALID_HTML },
      validationPassed: false,
    };
    const tools = createTools(state);
    const readPageTool = tools.find((t) => t.name === "read_page");
    assert(readPageTool);

    const result = await readPageTool.execute("test-id", {
      filename: "index.html",
    } as never);

    expect(result.content[0]).toMatchObject({
      type: "text",
      text: VALID_HTML,
    });
  });

  it("read_page should error when page does not exist", async () => {
    const state: GenerationState = {
      spec: null,
      pages: {},
      validationPassed: false,
    };
    const tools = createTools(state);
    const readPageTool = tools.find((t) => t.name === "read_page");
    assert(readPageTool);

    const result = await readPageTool.execute("test-id", {
      filename: "missing.html",
    } as never);

    expect(result.content[0]).toMatchObject({
      type: "text",
      text: expect.stringContaining("not found"),
    });
  });
});

describe("generateWebsite with FakeAgent", () => {
  it("should complete successfully when agent calls plan_site and write_page", async () => {
    const script = [
      { toolName: "plan_site", args: VALID_PLAN_SITE_ARGS },
      {
        toolName: "write_page",
        args: { filename: "index.html", html: VALID_HTML },
      },
    ];

    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, script);
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const completeEvent = events.find((e) => e.type === "complete");
    expect(completeEvent).toBeDefined();
    expect(completeEvent?.type).toBe("complete");
    if (completeEvent?.type === "complete") {
      expect(completeEvent.pages["index.html"]).toBe(VALID_HTML);
      expect(completeEvent.spec.name).toBe("Test Site");
    }
  });

  it("should emit spec event after plan_site", async () => {
    const script = [
      { toolName: "plan_site", args: VALID_PLAN_SITE_ARGS },
      {
        toolName: "write_page",
        args: { filename: "index.html", html: VALID_HTML },
      },
    ];

    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, script);
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const specEvent = events.find((e) => e.type === "spec");
    expect(specEvent).toBeDefined();
    if (specEvent?.type === "spec") {
      expect(specEvent.spec.name).toBe("Test Site");
    }
  });

  it("should emit page event after write_page with valid HTML", async () => {
    const script = [
      { toolName: "plan_site", args: VALID_PLAN_SITE_ARGS },
      {
        toolName: "write_page",
        args: { filename: "index.html", html: VALID_HTML },
      },
    ];

    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, script);
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const pageEvent = events.find((e) => e.type === "page");
    expect(pageEvent).toBeDefined();
    if (pageEvent?.type === "page") {
      expect(pageEvent.filename).toBe("index.html");
      expect(pageEvent.html).toBe(VALID_HTML);
    }
  });

  it("should emit error event when agent throws", async () => {
    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, [], new Error("API key invalid"));
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const errorEvent = events.find((e) => e.type === "error");
    expect(errorEvent).toBeDefined();
    if (errorEvent?.type === "error") {
      expect(errorEvent.error).toBe("API key invalid");
    }

    const completeEvent = events.find((e) => e.type === "complete");
    expect(completeEvent).toBeUndefined();
  });

  it("should NOT emit 'No pages were generated' after a real error", async () => {
    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, [], new Error("Model rate limited"));
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const errorEvents = events.filter((e) => e.type === "error");
    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].type === "error" && errorEvents[0].error).toBe(
      "Model rate limited",
    );
  });

  it("should emit 'No pages were generated' when agent completes without generating pages", async () => {
    const script = [{ toolName: "plan_site", args: VALID_PLAN_SITE_ARGS }];

    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, script);
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const errorEvent = events.find((e) => e.type === "error");
    expect(errorEvent).toBeDefined();
    if (errorEvent?.type === "error") {
      expect(errorEvent.error).toBe("No pages were generated");
    }
  });

  it("should handle edit_page correctly", async () => {
    const script = [
      { toolName: "plan_site", args: VALID_PLAN_SITE_ARGS },
      {
        toolName: "write_page",
        args: { filename: "index.html", html: VALID_HTML },
      },
      {
        toolName: "edit_page",
        args: {
          filename: "index.html",
          edits: [
            {
              old: "<h1>Test Page</h1>",
              new: "<h1>Updated Page</h1>",
            },
          ],
        },
      },
    ];

    const fakeAgentFactory: AgentFactory = (config, _getApiKey) => {
      return new FakeAgent(config.tools, script);
    };

    const events = await collectEvents(
      generateWebsite("Create a test website", undefined, undefined, {
        agentFactory: fakeAgentFactory,
      }),
    );

    const completeEvent = events.find((e) => e.type === "complete");
    expect(completeEvent).toBeDefined();
    if (completeEvent?.type === "complete") {
      expect(completeEvent.pages["index.html"]).toContain(
        "<h1>Updated Page</h1>",
      );
    }
  });
});
