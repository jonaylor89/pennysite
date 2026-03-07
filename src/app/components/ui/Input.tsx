import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-control border bg-surface-hover px-4 py-3 text-fg placeholder-fg-subtle outline-none transition-colors focus:border-border-hover",
        invalid ? "border-danger" : "border-border-hover",
        className,
      )}
      {...props}
    />
  );
}
