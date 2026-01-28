import { NextResponse } from "next/server";
import { removeCustomDomain } from "@/lib/cloudflare/domains";
import { deleteProject } from "@/lib/cloudflare/pages";
import { trackServerEvent } from "@/lib/posthog/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(
  req: Request,
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

  const { name, pages } = await req.json();

  const { data: project, error } = await supabase
    .from("projects")
    .update({
      name,
      pages,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project });
}

export async function DELETE(
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

  if (data.cf_project_name) {
    try {
      if (data.custom_domain) {
        await removeCustomDomain(data.cf_project_name, data.custom_domain);
      }
      await deleteProject(data.cf_project_name);
    } catch (error) {
      console.error("Failed to delete CF project:", error);
    }
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  void trackServerEvent(user.id, "project_deleted", {
    project_id: id,
    was_published: !!data.cf_project_name,
  });

  return NextResponse.json({ success: true });
}
