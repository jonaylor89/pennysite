import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectList } from "./ProjectList";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, created_at, updated_at, deployed_url")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Your Projects</h1>
          <Link
            href="/project/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            New Project
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <ProjectList projects={projects} />
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">No projects yet</p>
            <Link
              href="/project/new"
              className="mt-4 inline-block text-white underline"
            >
              Create your first website
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
