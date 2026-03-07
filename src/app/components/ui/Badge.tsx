import type { HTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  neutral: "bg-surface-hover text-fg-muted",
  success: "bg-success/20 text-success-muted",
  danger: "bg-danger/20 text-danger-muted",
  warning: "bg-warning/20 text-warning-muted",
  accent: "bg-accent/20 text-accent-muted",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variantClasses;
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
