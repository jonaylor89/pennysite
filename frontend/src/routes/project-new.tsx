import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { BuilderUI } from "@/components/BuilderUI";

export function ProjectNewPage() {
  const [searchParams] = useSearchParams();
  const prompt = searchParams.get("prompt") ?? undefined;

  useEffect(() => {
    document.title = "New Project - Pennysite";
  }, []);

  return <BuilderUI projectId={null} initialPrompt={prompt} />;
}
