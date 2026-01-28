import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/posthog/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, pages, conversation } = await req.json();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: name || "Untitled",
      pages,
      conversation: conversation || [],
    })
    .select()
    .single();

  if (error || !project) {
    return NextResponse.json(
      { error: error?.message || "Failed to create project" },
      { status: 500 },
    );
  }

  const projectData = project as { id: string };
  trackServerEvent(user.id, "project_created", {
    project_id: projectData.id,
    page_count: Object.keys(pages || {}).length,
  });

  return NextResponse.json({ project });
}
