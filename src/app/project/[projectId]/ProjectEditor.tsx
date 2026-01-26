"use client";

import { BuilderUI } from "@/app/components/BuilderUI";

type Pages = Record<string, string>;

type Props = {
  projectId: string;
  initialName: string;
  initialPages: Pages;
  initialDeployedUrl?: string | null;
};

export function ProjectEditor({
  projectId,
  initialName,
  initialPages,
  initialDeployedUrl,
}: Props) {
  return (
    <BuilderUI
      projectId={projectId}
      initialName={initialName}
      initialPages={initialPages}
      initialDeployedUrl={initialDeployedUrl}
    />
  );
}
