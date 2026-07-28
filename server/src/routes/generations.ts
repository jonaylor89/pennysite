import { Hono } from "hono";
import type { Env } from "../types.js";
import { linkGenerationToProject } from "../db/generations.js";

const generations = new Hono<Env>();

/**
 * POST /api/generations/:id/link-project
 * Links a generation to a project (after guest checkout).
 */
generations.post("/:id/link-project", async (c) => {
  const user = c.get("user");
  const generationId = c.req.param("id");
  const { projectId } = await c.req.json<{ projectId: string }>();

  if (!projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }

  const updated = await linkGenerationToProject(
    generationId,
    user.id,
    projectId,
  );

  if (!updated) {
    return c.json({ error: "Generation not found" }, 404);
  }

  return c.json({ ok: true });
});

export default generations;
