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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
      props.onKeyDown?.(e);
    },
    [props.onKeyDown],
  );

  return (
    <textarea onInput={handleInput} onKeyDown={handleKeyDown} {...props} />
  );
}
