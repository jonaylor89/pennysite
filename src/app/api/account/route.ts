import { NextResponse } from "next/server";
import { removeCustomDomain } from "@/lib/cloudflare/domains";
import { deleteProject } from "@/lib/cloudflare/pages";
import { trackServerEvent } from "@/lib/posthog/server";
import { createClient } from "@/lib/supabase/server";
import { runWithConcurrency } from "@/lib/utils/concurrency";

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: projects, error: fetchError } = await supabase
      .from("projects")
      .select("id, cf_project_name, custom_domain")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Failed to fetch projects:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 },
      );
    }

    const tasks = (projects ?? [])
      .filter((p): p is typeof p & { cf_project_name: string } =>
        Boolean(p.cf_project_name),
      )
      .map((p) => async () => {
        if (p.custom_domain) {
          await removeCustomDomain(p.cf_project_name, p.custom_domain);
        }
        await deleteProject(p.cf_project_name);
      });

    const settled = await runWithConcurrency(tasks, 5);
    const failed = settled.filter((r) => r.status === "rejected");
    if (failed.length) {
      console.error("Some CF deletions failed:", failed);
    }

    void trackServerEvent(user.id, "account_deleted", {
      project_count: projects?.length ?? 0,
      cf_cleanup_failures: failed.length,
    });

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete account",
      },
      { status: 500 },
    );
  }
}
