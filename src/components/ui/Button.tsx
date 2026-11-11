import type { ButtonHTMLAttributes } from "react";

// Button
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "lg" | "sm";
  pending?: boolean;
  pendingLabel?: string;
};

export function Button({
  variant = "primary",
  size = "lg",
  pending,
  pendingLabel,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const sizing = size === "lg" ? "h-12 w-full gap-2.5 px-4 text-base" : "h-10 gap-2 px-3 text-sm";
  const look = {
    primary: "bg-accent font-semibold text-accent-ink hover:bg-accent-hover",
    secondary: "border border-field-border bg-field font-medium text-ink hover:border-ink-muted",
    danger: "border border-danger/60 bg-field font-medium text-danger hover:border-danger",
  }[variant];
  return (
    <button
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`${base} ${sizing} ${look} ${className}`}
      {...props}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
