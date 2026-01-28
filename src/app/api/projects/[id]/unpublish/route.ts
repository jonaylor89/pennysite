import { NextResponse } from "next/server";
import { removeCustomDomain } from "@/lib/cloudflare/domains";
import { deleteProject } from "@/lib/cloudflare/pages";
import { trackServerEvent } from "@/lib/posthog/server";
import { createClient } from "@/lib/supabase/server";

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
    .select("id, cf_project_name, custom_domain")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!data.cf_project_name) {
    return NextResponse.json(
      { error: "Project is not published" },
      { status: 400 },
    );
  }

  try {
    if (data.custom_domain) {
      try {
        await removeCustomDomain(data.cf_project_name, data.custom_domain);
      } catch (error) {
        console.error("Failed to remove custom domain:", error);
      }
    }

    await deleteProject(data.cf_project_name);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        cf_project_name: null,
        deployed_url: null,
        last_deployed_at: null,
        custom_domain: null,
        custom_domain_status: null,
        custom_domain_added_at: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update project:", updateError);
      return NextResponse.json(
        {
          error:
            "Unpublished from Cloudflare, but failed to update database. Please refresh.",
        },
        { status: 500 },
      );
    }

    void trackServerEvent(user.id, "project_unpublished", {
      project_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unpublish error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to unpublish",
      },
      { status: 500 },
    );
  }
}
