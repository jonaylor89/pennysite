import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

let _sentry: typeof import("@sentry/node") | null | undefined;
async function getSentry() {
	if (_sentry === undefined) {
		try {
			_sentry = await import("@sentry/node");
		} catch {
			_sentry = null;
		}
	}
	return _sentry;
}

export async function errorHandler(c: Context, next: Next) {
	try {
		await next();
	} catch (err) {
		console.error("Unhandled error:", err);

		// Try to capture with Sentry if available
		const sentry = await getSentry();
		sentry?.captureException(err, {
			extra: {
				method: c.req.method,
				path: c.req.path,
			},
		});

		// Return 400 for invalid UUID path parameters
		if (
			err instanceof Error &&
			err.message?.includes("invalid input syntax for type uuid")
		) {
			return c.json({ error: "Invalid ID format" }, 400);
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
