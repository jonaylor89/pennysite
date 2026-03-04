import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  Sentry.captureRequestError(err, request, context);

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getPostHogServer } = await import("./lib/posthog/server");
    const posthog = getPostHogServer();
    if (posthog) {
      let distinctId: string | undefined;
      const cookieHeader = request.headers.cookie;
      const cookieString = Array.isArray(cookieHeader)
        ? cookieHeader.join("; ")
        : cookieHeader;
      if (cookieString) {
        const match = cookieString.match(/ph_[^=]*_posthog=([^;]+)/);
        if (match?.[1]) {
          try {
            const decoded = decodeURIComponent(match[1]);
            const data = JSON.parse(decoded);
            distinctId = data.distinct_id;
          } catch {}
        }
      }
      await posthog.captureException(err, distinctId);
    }
  }
};
