import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectList } from "./ProjectList";

const PAGE_SIZE = 10;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  let page = Number.parseInt(pageParam || "1", 10);
  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: projects, count } = await supabase
    .from("projects")
    .select("id, name, created_at, updated_at, deployed_url", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Your Projects</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Account
            </Link>
            <Link
              href="/project/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              New Project
            </Link>
          </div>
        </div>

        {projects && projects.length > 0 ? (
          <>
            <ProjectList projects={projects} />

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                {page > 1 ? (
                  <Link
                    href={`/projects?page=${page - 1}`}
                    className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Previous
                  </span>
                )}

                <span className="text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/projects?page=${page + 1}`}
                    className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    Next
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                    Next
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                )}
              </div>
            )}
          </>
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
