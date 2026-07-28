import { sql } from "./pool.js";

export interface Project {
	id: string;
	user_id: string;
	name: string;
	pages: Record<string, string> | null;
	conversation: unknown[] | null;
	created_at: string;
	updated_at: string;
	cf_project_name: string | null;
	deployed_url: string | null;
	last_deployed_at: string | null;
	custom_domain: string | null;
	custom_domain_status: string | null;
	custom_domain_added_at: string | null;
	is_public: boolean;
}

export async function listProjects(
	userId: string,
	limit = 10,
	offset = 0,
): Promise<Project[]> {
	const rows = await sql`
    SELECT * FROM projects
    WHERE user_id = ${userId}::uuid
    ORDER BY updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
	return rows as unknown as Project[];
}

export async function countProjects(userId: string): Promise<number> {
	const rows = await sql`
    SELECT COUNT(*)::int as count FROM projects WHERE user_id = ${userId}::uuid
  `;
	return (rows[0]?.count as number) ?? 0;
}

export async function getProject(
	projectId: string,
	userId?: string,
): Promise<Project | null> {
	if (userId) {
		const rows = await sql`
      SELECT * FROM projects
      WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `;
		return (rows[0] as unknown as Project) ?? null;
	}
	// Public access
	const rows = await sql`
    SELECT * FROM projects
    WHERE id = ${projectId}::uuid
    LIMIT 1
  `;
	return (rows[0] as unknown as Project) ?? null;
}

export async function createProject(
	userId: string,
	name: string,
	pages?: Record<string, string>,
	conversation?: unknown[],
): Promise<Project> {
	const rows = await sql`
    INSERT INTO projects (user_id, name, pages, conversation)
    VALUES (
      ${userId}::uuid,
      ${name},
      ${pages ? sql.json(pages as any) : null}::jsonb,
      ${conversation ? sql.json(conversation as any) : null}::jsonb
    )
    RETURNING *
  `;
	return rows[0] as unknown as Project;
}

export async function updateProject(
	projectId: string,
	userId: string,
	updates: {
		name?: string;
		pages?: Record<string, string>;
		conversation?: unknown[];
		is_public?: boolean;
	},
): Promise<Project | null> {
	// Use a single dynamic update query
	const rows = await sql`
    UPDATE projects SET
      name = COALESCE(${updates.name ?? null}, name),
      pages = COALESCE(${updates.pages ? sql.json(updates.pages as any) : null}::jsonb, pages),
      conversation = COALESCE(${updates.conversation ? sql.json(updates.conversation as any) : null}::jsonb, conversation),
      is_public = COALESCE(${updates.is_public ?? null}::boolean, is_public),
      updated_at = NOW()
    WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
    RETURNING *
  `;
	return (rows[0] as unknown as Project) ?? null;
}

export async function deleteProject(
	projectId: string,
	userId: string,
): Promise<Project | null> {
	const rows = await sql`
    DELETE FROM projects
    WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
    RETURNING *
  `;
	return (rows[0] as unknown as Project) ?? null;
}

export async function updateProjectDeployment(
	projectId: string,
	userId: string,
	cfProjectName: string,
	deployedUrl: string,
): Promise<void> {
	await sql`
    UPDATE projects SET
      cf_project_name = ${cfProjectName},
      deployed_url = ${deployedUrl},
      last_deployed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
  `;
}

export async function clearProjectDeployment(
	projectId: string,
	userId: string,
): Promise<void> {
	await sql`
    UPDATE projects SET
      cf_project_name = NULL,
      deployed_url = NULL,
      last_deployed_at = NULL,
      updated_at = NOW()
    WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
  `;
}

export async function updateProjectDomain(
	projectId: string,
	userId: string,
	domain: string | null,
	status: string | null,
): Promise<void> {
	if (domain) {
		await sql`
      UPDATE projects SET
        custom_domain = ${domain},
        custom_domain_status = ${status ?? "pending"},
        custom_domain_added_at = NOW(),
        updated_at = NOW()
      WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
    `;
	} else {
		await sql`
      UPDATE projects SET
        custom_domain = NULL,
        custom_domain_status = NULL,
        custom_domain_added_at = NULL,
        updated_at = NOW()
      WHERE id = ${projectId}::uuid AND user_id = ${userId}::uuid
    `;
	}
}

export async function countUserProjects(userId: string): Promise<number> {
	const rows = await sql`
    SELECT COUNT(*)::int as count FROM projects WHERE user_id = ${userId}::uuid
  `;
	return (rows[0]?.count as number) ?? 0;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
	return listProjects(userId);
}
