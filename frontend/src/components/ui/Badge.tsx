import type { HTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  neutral: "bg-surface-2 text-ink-600 border border-border",
  success: "bg-accent-light text-accent-text border border-accent/20",
  danger: "bg-error/10 text-error border border-error/20",
  warning: "bg-gold-light text-gold-text border border-gold/30",
  accent: "bg-info/10 text-info border border-info/20",
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
