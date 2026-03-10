import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pennysite.app";

function getSecret() {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/**
 * Generate a signed unsubscribe token for a user.
 * Used in email footers for one-click unsubscribe.
 */
export async function generateUnsubscribeUrl(
  userId: string,
  category: "all" | "drip" | "reengagement",
): Promise<string> {
  const token = await new SignJWT({ sub: userId, cat: category })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("90d")
    .sign(getSecret());

  return `${SITE_URL}/api/email/unsubscribe?token=${token}`;
}

/**
 * GET /api/email/unsubscribe?token=xxx
 * One-click unsubscribe from email footer links.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(renderPage("Missing token", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub;
    const category = payload.cat as string;

    if (!userId) {
      return new NextResponse(renderPage("Invalid token", false), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const supabase = createAdminClient();

    const updateFields: Record<string, boolean> = {};
    if (category === "all") {
      updateFields.unsubscribed_all = true;
    } else if (category === "drip") {
      updateFields.unsubscribed_drip = true;
    } else if (category === "reengagement") {
      updateFields.unsubscribed_reengagement = true;
    } else {
      updateFields.unsubscribed_all = true;
    }

    const { error } = await supabase.from("email_preferences").upsert(
      {
        user_id: userId,
        ...updateFields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Failed to unsubscribe:", error);
      return new NextResponse(
        renderPage("Something went wrong. Please try again.", false),
        { status: 500, headers: { "Content-Type": "text/html" } },
      );
    }

    return new NextResponse(renderPage("You've been unsubscribed", true), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return new NextResponse(
      renderPage("This link has expired or is invalid", false),
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }
}

function renderPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${success ? "Unsubscribed" : "Error"} — Pennysite</title>
  <style>
    body { margin: 0; padding: 0; background: #f8f8f6; font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; max-width: 400px; padding: 48px 32px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    p { font-size: 15px; color: #6b7280; margin: 0 0 24px; line-height: 1.5; }
    a { color: #2d6a4f; text-decoration: none; font-size: 14px; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✓" : "✗"}</div>
    <h1>${message}</h1>
    <p>${success ? "You won't receive these emails anymore. You can update your preferences anytime from your account." : "Please try again or manage preferences from your account page."}</p>
    <a href="${SITE_URL}">← Back to Pennysite</a>
  </div>
</body>
</html>`;
}
