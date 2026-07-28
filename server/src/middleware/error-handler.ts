import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
	try {
		await next();
	} catch (err) {
		console.error("Unhandled error:", err);

		// Try to capture with Sentry if available
		try {
			const Sentry = await import("@sentry/node");
			Sentry.captureException(err, {
				extra: {
					method: c.req.method,
					path: c.req.path,
				},
			});
		} catch {
			// Sentry not initialized, skip
		}

		const message =
			err instanceof Error ? err.message : "Internal server error";
		return c.json({ error: message }, 500);
	}
}
