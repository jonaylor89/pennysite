import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

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

		const errStatus = (err as { status?: number }).status;
		const httpStatus: ContentfulStatusCode =
			errStatus && errStatus >= 400 && errStatus < 600
				? (errStatus as ContentfulStatusCode)
				: 500;

		if (
			err instanceof Error &&
			err.message?.includes("invalid input syntax for type uuid")
		) {
			return c.json({ error: "Invalid ID format" }, 400);
		}

		// Only expose error messages for client errors (4xx); hide internal details for 5xx
		const message =
			httpStatus < 500 && err instanceof Error
				? err.message
				: "Internal server error";
		return c.json({ error: message }, httpStatus);
	}
}
