import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ProjectSettings } from "./ProjectSettings";

type Project = Database["public"]["Tables"]["projects"]["Row"];

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectSettingsPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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

  return <ProjectSettings project={project} />;
}
