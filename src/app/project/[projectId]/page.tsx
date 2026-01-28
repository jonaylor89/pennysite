import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ProjectEditor } from "./ProjectEditor";

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

  type Message = { role: "user" | "assistant"; content: string };
  const conversation = (project.conversation ?? []) as Message[];

  return (
    <ProjectEditor
      projectId={project.id}
      initialName={project.name}
      initialPages={project.pages as Pages}
      initialConversation={conversation}
      initialDeployedUrl={project.deployed_url}
      initialCfProjectName={project.cf_project_name}
      initialCustomDomain={project.custom_domain}
      initialCustomDomainStatus={project.custom_domain_status}
    />
  );
}
