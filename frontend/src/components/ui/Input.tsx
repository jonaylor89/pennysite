import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-ink-900 placeholder-ink-400 shadow-md outline-none transition-colors focus:border-accent",
        invalid ? "border-error" : "border-border-strong",
        className,
      )}
      {...props}
    />
  );
}
