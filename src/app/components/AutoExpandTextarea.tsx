"use client";

import { type TextareaHTMLAttributes, useCallback } from "react";

type AutoExpandTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onInput"
> & {
  maxHeight?: number;
};

export function AutoExpandTextarea({
  maxHeight,
  ...props
}: AutoExpandTextareaProps) {
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      target.style.height = "auto";
      const newHeight = maxHeight
        ? Math.min(target.scrollHeight, maxHeight)
        : target.scrollHeight;
      target.style.height = `${newHeight}px`;
    },
    [maxHeight],
  );

  return <textarea onInput={handleInput} {...props} />;
}
