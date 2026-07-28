import { Hono } from "hono";
import {
	clearProjectDeployment,
	getProject,
	updateProjectDeployment,
	updateProjectDomain,
} from "../db/projects.js";
import { findUserById } from "../db/users.js";
import type { Env } from "../types.js";

const publish = new Hono<Env>();

/**
 * POST /api/projects/:id/publish
 */
publish.post("/:id/publish", async (c) => {
	const user = c.get("user");
	const projectId = c.req.param("id");

	const project = await getProject(projectId, user.id);
	if (!project) {
		return c.json({ error: "Project not found" }, 404);
	}

	if (!project.pages || Object.keys(project.pages).length === 0) {
		return c.json({ error: "No pages to publish" }, 400);
	}

	const { publishToCloudflare } = await import("../lib/cloudflare/pages.js");
	const { cfProjectName, deployedUrl } = await publishToCloudflare(
		project.id,
		project.name,
		project.pages as Record<string, string>,
	);

	await updateProjectDeployment(projectId, user.id, cfProjectName, deployedUrl);

	// Send celebration email
	try {
		const dbUser = await findUserById(user.id);
		if (dbUser?.email) {
			const { onSitePublished } = await import("../lib/email/triggers.js");
			onSitePublished(
				user.id,
				dbUser.email,
				projectId,
				project.name,
				deployedUrl,
			).catch(console.error);
		}
	} catch {
		// Non-critical
	}

	const { trackServerEvent } = await import("../lib/posthog/server.js");
	trackServerEvent(user.id, "project_published", {
		project_id: projectId,
		page_count: Object.keys(project.pages).length,
		deployed_url: deployedUrl,
	});

	return c.json({ cfProjectName, deployedUrl });
});

/**
 * POST /api/projects/:id/unpublish
 */
publish.post("/:id/unpublish", async (c) => {
	const user = c.get("user");
	const projectId = c.req.param("id");

	const project = await getProject(projectId, user.id);
	if (!project) {
		return c.json({ error: "Project not found" }, 404);
	}

	if (project.cf_project_name) {
		try {
			const { deleteProject } = await import("../lib/cloudflare/pages.js");
			await deleteProject(project.cf_project_name);
		} catch (err) {
			console.error("Failed to delete Cloudflare project:", err);
		}
	}

	await clearProjectDeployment(projectId, user.id);
	return c.json({ ok: true });
});

/**
 * POST /api/projects/:id/domain
 */
publish.post("/:id/domain", async (c) => {
	const user = c.get("user");
	const projectId = c.req.param("id");

	const project = await getProject(projectId, user.id);
	if (!project) {
		return c.json({ error: "Project not found" }, 404);
	}

	if (!project.cf_project_name) {
		return c.json({ error: "Project must be published first" }, 400);
	}

	const { action, domain } = await c.req.json<{
		action: "add" | "remove" | "status";
		domain?: string;
	}>();

	if (action === "add") {
		if (!domain) {
			return c.json({ error: "Domain is required" }, 400);
		}

		const { addCustomDomain } = await import("../lib/cloudflare/domains.js");
		await addCustomDomain(project.cf_project_name, domain);
		await updateProjectDomain(projectId, user.id, domain, "pending");
		return c.json({ domain, status: "pending" });
	}

	if (action === "remove") {
		if (project.custom_domain) {
			const { removeCustomDomain } = await import(
				"../lib/cloudflare/domains.js"
			);
			try {
				await removeCustomDomain(
					project.cf_project_name,
					project.custom_domain,
				);
			} catch (err) {
				console.error("Failed to remove custom domain:", err);
			}
		}
		await updateProjectDomain(projectId, user.id, null, null);
		return c.json({ ok: true });
	}

	if (action === "status") {
		if (!project.custom_domain) {
			return c.json({ domain: null, status: null });
		}
		const { getCustomDomain } = await import("../lib/cloudflare/domains.js");
		try {
			const domainInfo = await getCustomDomain(
				project.cf_project_name,
				project.custom_domain,
			);
			const status = domainInfo?.status ?? null;
			if (status !== project.custom_domain_status) {
				await updateProjectDomain(
					projectId,
					user.id,
					project.custom_domain,
					status,
				);
			}
			return c.json({ domain: project.custom_domain, status });
		} catch {
			return c.json({
				domain: project.custom_domain,
				status: project.custom_domain_status,
			});
		}
	}

	return c.json({ error: "Invalid action" }, 400);
});

/**
 * GET /api/projects/:id/stats
 */
publish.get("/:id/stats", async (c) => {
	const user = c.get("user");
	const projectId = c.req.param("id");

	const project = await getProject(projectId, user.id);
	if (!project) {
		return c.json({ error: "Project not found" }, 404);
	}

	// Return basic project stats
	return c.json({
		pageCount: project.pages ? Object.keys(project.pages).length : 0,
		isPublished: !!project.deployed_url,
		deployedUrl: project.deployed_url,
		lastDeployedAt: project.last_deployed_at,
		customDomain: project.custom_domain,
		customDomainStatus: project.custom_domain_status,
	});
});

export default publish;
