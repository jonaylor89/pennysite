import { NextResponse } from "next/server";
import { publishToCloudflare } from "@/lib/cloudflare/pages";
import { trackServerEvent } from "@/lib/posthog/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as Project;
  const pages = project.pages as Record<string, string>;
  if (!pages || Object.keys(pages).length === 0) {
    return NextResponse.json({ error: "No pages to publish" }, { status: 400 });
  }

  try {
    const { cfProjectName, deployedUrl } = await publishToCloudflare(
      project.id,
      project.name,
      pages,
    );

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        cf_project_name: cfProjectName,
        deployed_url: deployedUrl,
        last_deployed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update project:", updateError);
    }

    trackServerEvent(user.id, "project_published", {
      project_id: id,
      page_count: Object.keys(pages).length,
      deployed_url: deployedUrl,
    });

    return NextResponse.json({
      success: true,
      cfProjectName,
      deployedUrl,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to publish",
      },
      { status: 500 },
    );
  }
}
