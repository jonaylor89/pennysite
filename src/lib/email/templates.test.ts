import { describe, expect, it } from "vitest";
import {
  createdNeverEdited,
  dripAddPages,
  dripCustomDomain,
  dripPromptTips,
  dripShowcase,
  generatedNeverPublished,
  hasCreditsIdle,
  publishedNoEdits,
  purchasedNeverGenerated,
  secondSiteCreated,
  sitePublished,
  welcomeEmail,
} from "./templates";

const UNSUB_URL = "https://pennysite.app/unsubscribe?token=abc123";

// Helper to get all template results for shared assertions
function allTemplates() {
  return [
    {
      name: "sitePublished",
      result: sitePublished("My Site", "https://my-site.pennysite.app"),
    },
    { name: "secondSiteCreated", result: secondSiteCreated() },
    {
      name: "generatedNeverPublished",
      result: generatedNeverPublished("My Site", "proj-1"),
    },
    {
      name: "createdNeverEdited",
      result: createdNeverEdited("My Site", "proj-1"),
    },
    { name: "publishedNoEdits", result: publishedNoEdits("My Site", "proj-1") },
    { name: "hasCreditsIdle", result: hasCreditsIdle(42) },
    { name: "purchasedNeverGenerated", result: purchasedNeverGenerated() },
    { name: "welcomeEmail", result: welcomeEmail() },
    { name: "dripPromptTips", result: dripPromptTips() },
    { name: "dripAddPages", result: dripAddPages() },
    { name: "dripCustomDomain", result: dripCustomDomain() },
    { name: "dripShowcase", result: dripShowcase() },
  ];
}

describe("email templates – shared layout", () => {
  it.each(allTemplates())(
    "$name returns valid HTML with DOCTYPE",
    ({ result }) => {
      expect(result.html).toContain("<!DOCTYPE html>");
      expect(result.html).toContain("</html>");
    },
  );

  it.each(allTemplates())(
    "$name includes the Pennysite logo link",
    ({ result }) => {
      expect(result.html).toContain('class="logo">Pennysite</a>');
    },
  );

  it.each(allTemplates())(
    "$name includes Manage email preferences link",
    ({ result }) => {
      expect(result.html).toContain("Manage email preferences");
      expect(result.html).toContain("/account");
    },
  );

  it.each(allTemplates())("$name has a non-empty subject", ({ result }) => {
    expect(result.subject).toBeTruthy();
    expect(typeof result.subject).toBe("string");
    expect(result.subject.length).toBeGreaterThan(0);
  });
});

describe("email templates – unsubscribe link", () => {
  it.each([
    {
      name: "sitePublished",
      fn: () => sitePublished("S", "https://s.app", UNSUB_URL),
    },
    { name: "secondSiteCreated", fn: () => secondSiteCreated(UNSUB_URL) },
    {
      name: "generatedNeverPublished",
      fn: () => generatedNeverPublished("S", "p1", UNSUB_URL),
    },
    {
      name: "createdNeverEdited",
      fn: () => createdNeverEdited("S", "p1", UNSUB_URL),
    },
    {
      name: "publishedNoEdits",
      fn: () => publishedNoEdits("S", "p1", UNSUB_URL),
    },
    { name: "hasCreditsIdle", fn: () => hasCreditsIdle(5, UNSUB_URL) },
    {
      name: "purchasedNeverGenerated",
      fn: () => purchasedNeverGenerated(UNSUB_URL),
    },
    { name: "welcomeEmail", fn: () => welcomeEmail(UNSUB_URL) },
    { name: "dripPromptTips", fn: () => dripPromptTips(UNSUB_URL) },
    { name: "dripAddPages", fn: () => dripAddPages(UNSUB_URL) },
    { name: "dripCustomDomain", fn: () => dripCustomDomain(UNSUB_URL) },
    { name: "dripShowcase", fn: () => dripShowcase(UNSUB_URL) },
  ])("$name includes unsubscribe link when provided", ({ fn }) => {
    const { html } = fn();
    expect(html).toContain(UNSUB_URL);
    expect(html).toContain(">Unsubscribe</a>");
  });

  it.each(allTemplates())(
    "$name does NOT include unsubscribe link when omitted",
    ({ result }) => {
      expect(result.html).not.toContain(">Unsubscribe</a>");
    },
  );
});

describe("sitePublished", () => {
  it("interpolates project name and deployed URL", () => {
    const { html } = sitePublished(
      "Cool Project",
      "https://cool.pennysite.app",
    );
    expect(html).toContain("Cool Project");
    expect(html).toContain('href="https://cool.pennysite.app"');
  });

  it("CTA links to the deployed URL", () => {
    const { html } = sitePublished("P", "https://deployed.example.com");
    expect(html).toContain('href="https://deployed.example.com"');
  });

  it("includes link to /projects dashboard", () => {
    const { html } = sitePublished("P", "https://x.com");
    expect(html).toContain("/projects");
  });
});

describe("secondSiteCreated", () => {
  it("CTA links to /projects", () => {
    const { html } = secondSiteCreated();
    expect(html).toContain('href="https://pennysite.app/projects"');
  });
});

describe("generatedNeverPublished", () => {
  it("interpolates project name and links to /project/[id]", () => {
    const { html } = generatedNeverPublished("Blog", "proj-abc");
    expect(html).toContain("Blog");
    expect(html).toContain('href="https://pennysite.app/project/proj-abc"');
  });
});

describe("createdNeverEdited", () => {
  it("interpolates project name and links to /project/[id]", () => {
    const { html } = createdNeverEdited("Portfolio", "proj-xyz");
    expect(html).toContain("Portfolio");
    expect(html).toContain('href="https://pennysite.app/project/proj-xyz"');
  });
});

describe("publishedNoEdits", () => {
  it("interpolates project name and links to /project/[id]", () => {
    const { html } = publishedNoEdits("Landing Page", "proj-999");
    expect(html).toContain("Landing Page");
    expect(html).toContain('href="https://pennysite.app/project/proj-999"');
  });
});

describe("hasCreditsIdle", () => {
  it("interpolates available credits count", () => {
    const result = hasCreditsIdle(42);
    expect(result.subject).toContain("42");
    expect(result.html).toContain("42 credits");
  });

  it("CTA links to /project/new", () => {
    const { html } = hasCreditsIdle(10);
    expect(html).toContain('href="https://pennysite.app/project/new"');
  });

  it("includes inspiration links to /project/new with prompts", () => {
    const { html } = hasCreditsIdle(10);
    expect(html).toContain("/project/new?prompt=");
  });
});

describe("purchasedNeverGenerated", () => {
  it("CTA links to /project/new", () => {
    const { html } = purchasedNeverGenerated();
    expect(html).toContain('href="https://pennysite.app/project/new"');
  });
});

describe("welcomeEmail", () => {
  it("CTA links to /project/new", () => {
    const { html } = welcomeEmail();
    expect(html).toContain('href="https://pennysite.app/project/new"');
  });

  it("subject mentions Pennysite", () => {
    expect(welcomeEmail().subject).toContain("Pennysite");
  });
});

describe("dripPromptTips", () => {
  it("CTA links to /project/new", () => {
    const { html } = dripPromptTips();
    expect(html).toContain('href="https://pennysite.app/project/new"');
  });
});

describe("dripAddPages", () => {
  it("CTA links to /projects", () => {
    const { html } = dripAddPages();
    expect(html).toContain('href="https://pennysite.app/projects"');
  });
});

describe("dripCustomDomain", () => {
  it("CTA links to /projects", () => {
    const { html } = dripCustomDomain();
    expect(html).toContain('href="https://pennysite.app/projects"');
  });
});

describe("dripShowcase", () => {
  it("CTA links to /project/new", () => {
    const { html } = dripShowcase();
    expect(html).toContain('href="https://pennysite.app/project/new"');
  });

  it("includes inspiration links with prompts", () => {
    const { html } = dripShowcase();
    expect(html).toContain("/project/new?prompt=");
  });
});
