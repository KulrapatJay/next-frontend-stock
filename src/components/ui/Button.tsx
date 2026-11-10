import type { ButtonHTMLAttributes } from "react";

// Button
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  pending?: boolean;
  pendingLabel?: string;
};

export function Button({
  variant = "primary",
  pending,
  pendingLabel,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded px-4 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const look =
    variant === "primary"
      ? "bg-accent font-semibold text-accent-ink hover:bg-accent-hover"
      : "border border-field-border bg-field font-medium text-ink hover:border-ink-muted";
  return (
    <button
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`${base} ${look} ${className}`}
      {...props}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
