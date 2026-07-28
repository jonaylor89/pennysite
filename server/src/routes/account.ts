import { Hono } from "hono";
import type { Env } from "../types.js";
import { findUserById, deleteUser } from "../db/users.js";
import { getUserProjects } from "../db/projects.js";
import {
  getEmailPreferences,
  updateEmailPreferences,
} from "../db/email.js";
import { deleteCookie } from "hono/cookie";

const account = new Hono<Env>();

/**
 * GET /api/account
 */
account.get("/", async (c) => {
  const user = c.get("user");
  const dbUser = await findUserById(user.id);

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: dbUser.id,
    email: dbUser.email,
    created_at: dbUser.created_at,
    user_metadata: dbUser.raw_user_meta_data,
  });
});

/**
 * DELETE /api/account
 */
account.delete("/", async (c) => {
  const user = c.get("user");

  // Clean up Cloudflare projects
  const projects = await getUserProjects(user.id);
  let cfCleanupFailures = 0;

  for (const project of projects) {
    if (project.cf_project_name) {
      try {
        const cf = await import("../lib/cloudflare/pages.js");
        await cf.deleteProject(project.cf_project_name);
      } catch {
        cfCleanupFailures++;
      }
    }
  }

  await deleteUser(user.id);

  const { trackServerEvent } = await import("../lib/posthog/server.js");
  trackServerEvent(user.id, "account_deleted", {
    project_count: projects.length,
    cf_cleanup_failures: cfCleanupFailures,
  });

  deleteCookie(c, "refresh_token", { path: "/" });

  return c.json({ ok: true });
});

/**
 * GET /api/account/email-preferences
 */
account.get("/email-preferences", async (c) => {
  const user = c.get("user");
  const prefs = await getEmailPreferences(user.id);

  return c.json(
    prefs ?? {
      unsubscribed_all: false,
      unsubscribed_drip: false,
      unsubscribed_reengagement: false,
    },
  );
});

/**
 * POST /api/account/email-preferences
 */
account.post("/email-preferences", async (c) => {
  const user = c.get("user");
  const prefs = await c.req.json<{
    unsubscribed_all?: boolean;
    unsubscribed_drip?: boolean;
    unsubscribed_reengagement?: boolean;
  }>();

  await updateEmailPreferences(user.id, prefs);
  return c.json({ ok: true });
});

export default account;
