import { Hono } from "hono";
import { optionalAuthMiddleware } from "../auth/middleware.js";
import {
	countProjects,
	countUserProjects,
	createProject,
	deleteProject,
	getProject,
	listProjects,
	updateProject,
} from "../db/projects.js";
import { findUserById } from "../db/users.js";
import type { Env } from "../types.js";

const projects = new Hono<Env>();

/**
 * GET /api/projects
 */
projects.get("/", async (c) => {
	const user = c.get("user");
	const page = Number(c.req.query("page") || "1");
	const pageSize = Number(c.req.query("pageSize") || "10");
	const offset = (page - 1) * pageSize;

	const [paged, count] = await Promise.all([
		listProjects(user.id, pageSize, offset),
		countProjects(user.id),
	]);

	return c.json({
		projects: paged,
		count,
	});
});

/**
 * POST /api/projects
 */
projects.post("/", async (c) => {
	const user = c.get("user");
	const { name, pages, conversation } = await c.req.json<{
		name: string;
		pages?: Record<string, string>;
		conversation?: unknown[];
	}>();

	if (!name) {
		return c.json({ error: "Project name is required" }, 400);
	}

	const project = await createProject(user.id, name, pages, conversation);

	// Check if this is the user's second project for email trigger
	const projectCount = await countUserProjects(user.id);
	if (projectCount === 2) {
		try {
			const dbUser = await findUserById(user.id);
			if (dbUser?.email) {
				const { onSecondSiteCreated } = await import(
					"../lib/email/triggers.js"
				);
				onSecondSiteCreated(user.id, dbUser.email).catch(console.error);
			}
		} catch {
			// Non-critical, continue
		}
	}

	const { trackServerEvent } = await import("../lib/posthog/server.js");
	trackServerEvent(user.id, "project_created", {
		project_id: project.id,
		page_count: pages ? Object.keys(pages).length : 0,
	});

	return c.json(project, 201);
});

/**
 * GET /api/projects/:id
 * Accessible by owner (full data) or public viewers (if is_public).
 */
projects.get("/:id", optionalAuthMiddleware, async (c) => {
	const projectId = c.req.param("id")!;
	const user = c.get("user");

	// Try owner access first
	if (user) {
		const project = await getProject(projectId, user.id);
		if (project) {
			return c.json({ ...project, isOwner: true });
		}
	}

	// Try public access
	const project = await getProject(projectId);
	if (project?.is_public) {
		return c.json({ ...project, isOwner: false });
	}

	return c.json({ error: "Project not found" }, 404);
});

/**
 * PUT /api/projects/:id
 */
projects.put("/:id", async (c) => {
	const user = c.get("user");
	const projectId = c.req.param("id");
	const updates = await c.req.json<{
		name?: string;
		pages?: Record<string, string>;
		conversation?: unknown[];
		is_public?: boolean;
	}>();

	const project = await updateProject(projectId, user.id, updates);
	if (!project) {
		return c.json({ error: "Project not found" }, 404);
	}

	return c.json(project);
});

/**
 * DELETE /api/projects/:id
 */
projects.delete("/:id", async (c) => {
	const user = c.get("user");
	const projectId = c.req.param("id");

	const project = await getProject(projectId, user.id);
	if (!project) {
		return c.json({ error: "Project not found" }, 404);
	}

	// Clean up Cloudflare deployment if exists
	if (project.cf_project_name) {
		try {
			const cf = await import("../lib/cloudflare/pages.js");
			await cf.deleteProject(project.cf_project_name);
		} catch (err) {
			console.error("Failed to delete Cloudflare project:", err);
		}
	}

	await deleteProject(projectId, user.id);
	return c.json({ ok: true });
});

export default projects;
