import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authMiddleware, optionalAuthMiddleware } from "./auth/middleware.js";
import type { AuthUser } from "./auth/middleware.js";
import type { Env } from "./types.js";

// Route imports
import authRoutes from "./routes/auth.js";
import generateRoutes from "./routes/generate.js";
import enhanceRoutes from "./routes/enhance.js";
import projectRoutes from "./routes/projects.js";
import publishRoutes from "./routes/publish.js";
import billingRoutes from "./routes/billing.js";
import webhookRoutes from "./routes/webhook.js";
import creditsRoutes from "./routes/credits.js";
import accountRoutes from "./routes/account.js";
import emailRoutes from "./routes/email.js";
import generationRoutes from "./routes/generations.js";
import { getProject } from "./db/projects.js";

export function createApp() {
  const app = new Hono<Env>();

  // Global middleware
  app.use("*", corsMiddleware);
  app.use("*", errorHandler);

  // Health check
  app.get("/health", (c) =>
    c.json({ ok: true, timestamp: new Date().toISOString() }),
  );

  // ── PostHog proxy (/ingest/*) ───────────────────────────
  app.all("/ingest/*", async (c) => {
    const url = new URL(c.req.url);
    const target = `https://us.i.posthog.com${url.pathname.replace("/ingest", "")}${url.search}`;
    const headers = new Headers(c.req.raw.headers);
    headers.delete("cookie");
    headers.delete("host");
    const res = await fetch(target, {
      method: c.req.method,
      headers,
      body: c.req.method !== "GET" && c.req.method !== "HEAD" ? c.req.raw.body : undefined,
      // @ts-expect-error duplex needed for streaming body
      duplex: "half",
    });
    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  });

  // ── Sentry proxy (/monitoring/*) ────────────────────────
  app.all("/monitoring/*", async (c) => {
    const url = new URL(c.req.url);
    const target = `https://o4510976590020608.ingest.us.sentry.io${url.pathname.replace("/monitoring", "")}${url.search}`;
    const headers = new Headers(c.req.raw.headers);
    headers.delete("cookie");
    headers.delete("host");
    const res = await fetch(target, {
      method: c.req.method,
      headers,
      body: c.req.method !== "GET" && c.req.method !== "HEAD" ? c.req.raw.body : undefined,
      // @ts-expect-error duplex needed for streaming body
      duplex: "half",
    });
    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  });

  // ── Unauthenticated routes ──────────────────────────────
  app.route("/api/auth", authRoutes);
  app.route("/api/billing/webhook", webhookRoutes);
  app.route("/api/email", emailRoutes);

  // Guest checkout — no auth required
  app.post("/api/billing/guest-checkout", async (c) => {
    const { email, prompt, packId } = await c.req.json<{
      email: string;
      prompt: string;
      packId: string;
    }>();

    if (!email || !prompt || !packId) {
      return c.json({ error: "email, prompt, and packId are required" }, 400);
    }

    const { CREDIT_PACKS } = await import("./lib/stripe/packs.js");
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) return c.json({ error: "Invalid pack" }, 400);

    const { getStripe } = await import("./lib/stripe/stripe.js");
    const stripe = getStripe();
    const { config } = await import("./config.js");

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: "payment",
      line_items: [{ price: pack.stripePriceId, quantity: 1 }],
      success_url: `${config.siteUrl}/billing?session_id={CHECKOUT_SESSION_ID}&flow=guest_checkout`,
      cancel_url: `${config.siteUrl}/pricing`,
      metadata: {
        flow: "guest_checkout",
        email,
        prompt,
        pack_id: packId,
        credits: String(pack.credits),
      },
    });

    return c.json({ url: session.url });
  });

  // Session status — no auth required (uses session_id param)
  app.get("/api/billing/session-status", async (c) => {
    const sessionId = c.req.query("session_id");
    if (!sessionId) return c.json({ error: "session_id required" }, 400);

    try {
      const { getStripe } = await import("./lib/stripe/stripe.js");
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return c.json({
        status: session.status,
        payment_status: session.payment_status,
        customer_email:
          session.customer_details?.email || session.customer_email,
        metadata: session.metadata,
      });
    } catch {
      return c.json({ error: "Session not found" }, 404);
    }
  });

  // Project GET — public access for is_public projects
  app.get("/api/projects/:id", optionalAuthMiddleware, async (c) => {
    const projectId = c.req.param("id")!;
    const user = c.get("user");

    if (user) {
      const project = await getProject(projectId, user.id);
      if (project) return c.json({ ...project, isOwner: true });
    }

    const project = await getProject(projectId);
    if (project?.is_public) return c.json({ ...project, isOwner: false });

    return c.json({ error: "Project not found" }, 404);
  });

  // ── Authenticated routes ────────────────────────────────
  app.use("/api/generate/*", authMiddleware);
  app.use("/api/enhance/*", authMiddleware);
  app.use("/api/credits/*", authMiddleware);
  app.use("/api/account/*", authMiddleware);
  app.use("/api/generations/*", authMiddleware);

  // Projects — list/POST/PUT/DELETE need auth, single GET is handled above with optional auth
  app.use("/api/projects", authMiddleware);
  app.use("/api/projects/*", authMiddleware);

  // Billing — checkout needs auth, guest-checkout and session-status handled above
  app.post("/api/billing/checkout", authMiddleware);

  app.route("/api/generate", generateRoutes);
  app.route("/api/enhance", enhanceRoutes);
  app.route("/api/projects", projectRoutes);
  app.route("/api/projects", publishRoutes);
  app.route("/api/billing", billingRoutes);
  app.route("/api/credits", creditsRoutes);
  app.route("/api/account", accountRoutes);
  app.route("/api/generations", generationRoutes);

  return app;
}
