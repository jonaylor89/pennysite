"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BuilderUI } from "@/app/components/BuilderUI";

function NewProjectContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? undefined;

  return <BuilderUI projectId={null} initialPrompt={prompt} />;
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-bg text-fg-muted">
          Loading...
        </div>
      }
    >
      <NewProjectContent />
    </Suspense>
  );
}
