import type { HTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  success: "border-accent/30 bg-accent-light text-accent-text",
  danger: "border-error/30 bg-error/10 text-error",
  warning: "border-gold/30 bg-gold-light text-gold-text",
  info: "border-info/30 bg-info/10 text-info",
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant: keyof typeof variantClasses;
};

export function Alert({ variant, className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-md border p-4 text-sm",
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
