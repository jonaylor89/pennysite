"use client";

import { BuilderUI } from "@/app/components/BuilderUI";

type Pages = Record<string, string>;

type Props = {
  projectId: string;
  initialName: string;
  initialPages: Pages;
  initialDeployedUrl?: string | null;
  initialCfProjectName?: string | null;
  initialCustomDomain?: string | null;
  initialCustomDomainStatus?: "pending" | "active" | "error" | null;
};

export function ProjectEditor({
  projectId,
  initialName,
  initialPages,
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
      initialDeployedUrl={initialDeployedUrl}
      initialCfProjectName={initialCfProjectName}
      initialCustomDomain={initialCustomDomain}
      initialCustomDomainStatus={initialCustomDomainStatus}
    />
  );
}
