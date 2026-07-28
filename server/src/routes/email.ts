import { Hono } from "hono";
import { verifyUnsubscribeToken } from "../auth/jwt.js";
import { config } from "../config.js";
import { unsubscribeByCategory } from "../db/email.js";

const email = new Hono();

/**
 * GET /api/email/unsubscribe?token=...
 * One-click unsubscribe from email link.
 */
email.get("/unsubscribe", async (c) => {
	const token = c.req.query("token");
	if (!token) {
		return c.html("<h1>Invalid unsubscribe link</h1>", 400);
	}

	try {
		const { userId, category } = await verifyUnsubscribeToken(token);
		await unsubscribeByCategory(userId, category);

		return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family: system-ui; max-width: 500px; margin: 80px auto; text-align: center;">
          <h1>You've been unsubscribed</h1>
          <p>You won't receive ${category === "all" ? "any more" : category} emails from Pennysite.</p>
          <p><a href="${config.siteUrl}">Back to Pennysite</a></p>
        </body>
      </html>
    `);
	} catch {
		return c.html("<h1>Invalid or expired unsubscribe link</h1>", 400);
	}
});

export default email;
