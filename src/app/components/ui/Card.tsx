import type { HTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  default: "border-border bg-surface",
  interactive:
    "border-border bg-surface hover:border-border-hover transition-colors",
  danger: "border-danger/30 bg-danger/5",
} as const;

const paddingClasses = {
  md: "p-4",
  lg: "p-6",
} as const;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variantClasses;
  padding?: keyof typeof paddingClasses;
};

export function Card({
  variant = "default",
  padding = "lg",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
