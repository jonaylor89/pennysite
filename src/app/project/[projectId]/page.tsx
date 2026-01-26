import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectEditor } from "./ProjectEditor";
import type { Database } from "@/lib/supabase/types";

type Pages = Record<string, string>;
type Project = Database["public"]["Tables"]["projects"]["Row"];

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const project = data as Project;

  return (
    <ProjectEditor
      projectId={project.id}
      initialName={project.name}
      initialPages={project.pages as Pages}
      initialDeployedUrl={project.deployed_url}
    />
  );
}
