"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFeatureFlag } from "@/lib/featureflags";
import { AutoExpandTextarea } from "./AutoExpandTextarea";
import { Button } from "./ui/Button";

type AttachedImage = { data: string; mimeType: string; preview: string };

const MAX_IMAGES = 4;
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export function PromptForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multimodalEnabled = useFeatureFlag("multimodal-prompt");
  const [prompt, setPrompt] = useState("");
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  function processFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > MAX_SIZE) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        setAttachedImages((prev) =>
          prev.length >= MAX_IMAGES
            ? prev
            : [
                ...prev,
                { data: base64, mimeType: file.type, preview: dataUrl },
              ],
        );
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Persist images so the builder can pick them up
    if (attachedImages.length > 0) {
      sessionStorage.setItem(
        "pennysite:prompt-images",
        JSON.stringify(
          attachedImages.map(({ data, mimeType }) => ({ data, mimeType })),
        ),
      );
    }

    router.push(`/project/new?prompt=${encodeURIComponent(prompt.trim())}`);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!multimodalEnabled) return;
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!multimodalEnabled) return;
    processFiles(e.dataTransfer.files);
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (!multimodalEnabled) return;
    const imageFiles: File[] = [];
    for (const item of Array.from(e.clipboardData?.items ?? [])) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      const dt = new DataTransfer();
      for (const f of imageFiles) dt.items.add(f);
      processFiles(dt.files);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop target */}
      <div
        className={`group relative rounded-display transition ${isDragging ? "ring-2 ring-accent/50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AutoExpandTextarea
          id="prompt"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onPaste={handlePaste}
          required
          rows={3}
          placeholder='e.g. "A landing page for my coffee shop with menu and hours"'
          className="w-full resize-none rounded-display border border-border bg-surface-alt p-6 pb-16 text-lg text-fg placeholder:text-fg-subtle shadow-2xl outline-none transition focus:border-border-hover focus:bg-surface/80"
        />

        {multimodalEnabled && attachedImages.length > 0 && (
          <div className="absolute bottom-14 left-4 flex flex-wrap gap-2">
            {attachedImages.map((img, i) => (
              <div key={`home-attached-${i}`} className="group/thumb relative">
                {/* biome-ignore lint/performance/noImgElement: blob preview not supported by next/image */}
                <img
                  src={img.preview}
                  alt={`Attachment ${i + 1}`}
                  className="h-10 w-10 rounded-control border border-border-hover object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImages((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-pill bg-fg-subtle text-[10px] text-fg opacity-0 transition-opacity hover:bg-danger group-hover/thumb:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          {multimodalEnabled ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                tabIndex={-1}
                onChange={(e) => processFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachedImages.length >= MAX_IMAGES}
                className="flex h-9 w-9 items-center justify-center rounded-pill border border-border-hover text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg-strong disabled:opacity-30"
                title="Attach an image or paste / drag a screenshot"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-fg-subtle sm:block">
              Press Enter
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="rounded-card"
            >
              Generate
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
