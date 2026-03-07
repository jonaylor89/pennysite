import type { ReactNode } from "react";
import { cn } from "./cn";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

type ModalProps = {
  onClose?: () => void;
  size?: keyof typeof sizeClasses;
  children: ReactNode;
  className?: string;
};

export function Modal({
  onClose,
  size = "md",
  children,
  className,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay close */}
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={cn(
          "relative w-full rounded-modal border border-border bg-surface p-6 shadow-modal",
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
