import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

const variantClasses = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-accent",
  secondary:
    "border border-border text-ink-900 hover:border-border-strong hover:bg-surface-2",
  nav: "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-canvas",
  danger: "bg-error text-white hover:bg-error/90",
  "danger-outline": "border border-error/50 text-error hover:bg-error/10",
  link: "text-ink-600 hover:text-ink-900 underline underline-offset-2",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 font-medium",
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
        !isLink && "rounded-full",
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
    !isLink && "rounded-full",
    variantClasses[variant],
    sizeClasses[size],
    extra,
  );
}
