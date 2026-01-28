import { NextResponse } from "next/server";
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

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: generations, error: genError } = await supabase
    .from("generations")
    .select("actual_credits, input_tokens, output_tokens, status, created_at")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (genError) {
    return NextResponse.json({ error: genError.message }, { status: 500 });
  }

  const stats = {
    totalGenerations: generations?.length ?? 0,
    completedGenerations:
      generations?.filter((g) => g.status === "completed").length ?? 0,
    failedGenerations:
      generations?.filter((g) => g.status === "failed").length ?? 0,
    totalCreditsUsed:
      generations?.reduce((sum, g) => sum + (g.actual_credits ?? 0), 0) ?? 0,
    totalInputTokens:
      generations?.reduce((sum, g) => sum + (g.input_tokens ?? 0), 0) ?? 0,
    totalOutputTokens:
      generations?.reduce((sum, g) => sum + (g.output_tokens ?? 0), 0) ?? 0,
    lastGenerationAt: generations?.[0]?.created_at ?? null,
  };

  return NextResponse.json(stats);
}
