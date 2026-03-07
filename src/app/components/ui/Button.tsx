import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  success: "bg-success text-success-fg hover:bg-success-hover",
  danger: "bg-danger text-danger-fg hover:bg-danger-hover",
  ghost:
    "border border-border text-fg-strong hover:border-border-hover hover:bg-surface-hover",
  link: "text-fg-muted hover:text-fg",
  "danger-outline":
    "border border-danger/50 text-danger-muted hover:bg-danger/10",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 font-medium",
  pill: "px-6 py-3 font-medium rounded-pill",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isLink = variant === "link";
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        !isLink && size !== "pill" && "rounded-control",
        isLink && "inline",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

/** Export the variant class map so Link-as-button can reuse styles */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
) {
  const isLink = variant === "link";
  return cn(
    "inline-block transition-colors",
    !isLink && size !== "pill" && "rounded-control",
    variantClasses[variant],
    sizeClasses[size],
    extra,
  );
}
