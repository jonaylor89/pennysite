import { sql } from "./pool.js";

export async function getGeneration(generationId: string, userId: string) {
  const rows = await sql`
    SELECT * FROM generations
    WHERE id = ${generationId}::uuid AND user_id = ${userId}::uuid
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function linkGenerationToProject(
  generationId: string,
  userId: string,
  projectId: string,
): Promise<boolean> {
  const result = await sql`
    UPDATE generations
    SET project_id = ${projectId}::uuid
    WHERE id = ${generationId}::uuid AND user_id = ${userId}::uuid
    RETURNING id
  `;
  return result.length > 0;
}
