import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./segments", () => ({
  isUnsubscribed: vi.fn(),
  hasReceivedEmail: vi.fn(),
  logEmailSent: vi.fn(),
}));

vi.mock("./send", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../../app/api/email/unsubscribe/route", () => ({
  generateUnsubscribeUrl: vi.fn(),
}));

import { generateUnsubscribeUrl } from "../../app/api/email/unsubscribe/route";
import { hasReceivedEmail, isUnsubscribed, logEmailSent } from "./segments";
import { sendEmail } from "./send";
import { onSecondSiteCreated, onSitePublished } from "./triggers";

describe("onSitePublished", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isUnsubscribed).mockResolvedValue(false);
    vi.mocked(hasReceivedEmail).mockResolvedValue(false);
    vi.mocked(sendEmail).mockResolvedValue("msg-123");
    vi.mocked(generateUnsubscribeUrl).mockResolvedValue(
      "https://pennysite.app/api/email/unsubscribe?token=xxx",
    );
  });

  it("sends email when user is eligible", async () => {
    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        tag: "positive",
      }),
    );
  });

  it("does not send when user is unsubscribed", async () => {
    vi.mocked(isUnsubscribed).mockResolvedValue(true);

    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(sendEmail).not.toHaveBeenCalled();
    expect(logEmailSent).not.toHaveBeenCalled();
  });

  it("does not send duplicate email", async () => {
    vi.mocked(hasReceivedEmail).mockResolvedValue(true);

    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("checks unsubscribe with category 'all'", async () => {
    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(isUnsubscribed).toHaveBeenCalledWith("user-1", "all");
  });

  it("checks dedup with correct email type and project", async () => {
    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(hasReceivedEmail).toHaveBeenCalledWith(
      "user-1",
      "site_published",
      "proj-1",
    );
  });

  it("logs the sent email with message ID and project", async () => {
    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(logEmailSent).toHaveBeenCalledWith(
      "user-1",
      "site_published",
      "msg-123",
      "proj-1",
    );
  });

  it("generates unsubscribe URL for 'all' category", async () => {
    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    expect(generateUnsubscribeUrl).toHaveBeenCalledWith("user-1", "all");
  });

  it("includes project name and subject in sent email", async () => {
    await onSitePublished(
      "user-1",
      "user@example.com",
      "proj-1",
      "My Site",
      "https://my-site.pages.dev",
    );

    const call = vi.mocked(sendEmail).mock.calls[0][0];
    expect(call.subject).toBeTruthy();
    expect(call.html).toContain("My Site");
  });
});

describe("onSecondSiteCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isUnsubscribed).mockResolvedValue(false);
    vi.mocked(hasReceivedEmail).mockResolvedValue(false);
    vi.mocked(sendEmail).mockResolvedValue("msg-456");
    vi.mocked(generateUnsubscribeUrl).mockResolvedValue(
      "https://pennysite.app/api/email/unsubscribe?token=yyy",
    );
  });

  it("sends email when eligible", async () => {
    await onSecondSiteCreated("user-2", "user2@example.com");

    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user2@example.com",
        tag: "positive",
      }),
    );
  });

  it("does not send when unsubscribed", async () => {
    vi.mocked(isUnsubscribed).mockResolvedValue(true);

    await onSecondSiteCreated("user-2", "user2@example.com");

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does not send duplicate", async () => {
    vi.mocked(hasReceivedEmail).mockResolvedValue(true);

    await onSecondSiteCreated("user-2", "user2@example.com");

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("logs sent email without project ID", async () => {
    await onSecondSiteCreated("user-2", "user2@example.com");

    expect(logEmailSent).toHaveBeenCalledWith(
      "user-2",
      "second_site_created",
      "msg-456",
    );
  });

  it("checks dedup with correct email type", async () => {
    await onSecondSiteCreated("user-2", "user2@example.com");

    expect(hasReceivedEmail).toHaveBeenCalledWith(
      "user-2",
      "second_site_created",
    );
  });
});
