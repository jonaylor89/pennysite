import type { HTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  success: "border-success/30 bg-success/10 text-success-muted",
  danger: "border-danger/30 bg-danger/10 text-danger-muted",
  warning: "border-warning/30 bg-warning/10 text-warning-muted",
  info: "border-accent/30 bg-accent/10 text-accent-muted",
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant: keyof typeof variantClasses;
};

export function Alert({ variant, className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-control border p-4 text-sm",
        variantClasses[variant],
        className,
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}
