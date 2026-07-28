import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/useAuth";
import { BuilderUI } from "@/components/BuilderUI";
import { ProjectViewer } from "@/components/ProjectViewer";

type Pages = Record<string, string>;
type Message = { role: "user" | "assistant"; content: string };

interface Project {
  id: string;
  name: string;
  pages: Pages;
  conversation: Message[] | null;
  deployed_url: string | null;
  cf_project_name: string | null;
  custom_domain: string | null;
  custom_domain_status: "pending" | "active" | "error" | null;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function ProjectEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading || !projectId) return;

    async function fetchProject() {
      setLoading(true);
      try {
        const res = await api.get(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          setIsOwner(!!user && data.user_id === user.id);
        } else if (res.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId, user, authLoading]);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} - Pennysite`;
    }
  }, [project]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-ink-600">
        Loading...
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-ink-900">
        <h1 className="font-serif text-2xl">Project not found</h1>
        <p className="mt-2 text-ink-600">
          This project doesn't exist or you don't have access.
        </p>
        <Link to="/projects" className="mt-4 text-accent-text underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (isOwner) {
    const conversation = (project.conversation ?? []) as Message[];
    return (
      <BuilderUI
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

  // Not owner — show read-only viewer for public projects
  // biome-ignore lint/suspicious/noExplicitAny: conversation is stored as JSONB
  const conversation = (project.conversation ?? []) as any[];
  return (
    <ProjectViewer
      projectName={project.name}
      pages={project.pages as Pages}
      conversation={conversation}
      deployedUrl={project.deployed_url}
    />
  );
}
