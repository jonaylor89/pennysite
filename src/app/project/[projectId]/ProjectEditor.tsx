"use client";

import { BuilderUI } from "@/app/components/BuilderUI";

type Pages = Record<string, string>;
type Message = { role: "user" | "assistant"; content: string };

type Props = {
  projectId: string;
  initialName: string;
  initialPages: Pages;
  initialConversation?: Message[];
  initialDeployedUrl?: string | null;
  initialCfProjectName?: string | null;
  initialCustomDomain?: string | null;
  initialCustomDomainStatus?: "pending" | "active" | "error" | null;
};

export function ProjectEditor({
  projectId,
  initialName,
  initialPages,
  initialConversation,
  initialDeployedUrl,
  initialCfProjectName,
  initialCustomDomain,
  initialCustomDomainStatus,
}: Props) {
  return (
    <BuilderUI
      projectId={projectId}
      initialName={initialName}
      initialPages={initialPages}
      initialConversation={initialConversation}
      initialDeployedUrl={initialDeployedUrl}
      initialCfProjectName={initialCfProjectName}
      initialCustomDomain={initialCustomDomain}
      initialCustomDomainStatus={initialCustomDomainStatus}
    />
  );
}
