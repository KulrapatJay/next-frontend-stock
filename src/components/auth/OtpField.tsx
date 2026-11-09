"use client";

import { useId } from "react";

// 6-digit OTP input
type OtpFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  autoFocus?: boolean;
};

export function OtpField({ label, value, onChange, error, autoFocus }: OtpFieldProps) {
  const id = useId();
  const cells = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="group relative flex w-fit gap-2">
        {cells.map((digit, i) => (
          <span
            key={i}
            aria-hidden
            className={`grid h-14 w-11 place-items-center rounded border bg-field font-dot text-2xl tabular-nums text-ink ${
              error ? "border-danger" : "border-field-border"
            } ${
              i === Math.min(value.length, 5)
                ? "group-focus-within:border-accent group-focus-within:ring-2 group-focus-within:ring-accent/25"
                : ""
            }`}
          >
            {digit}
          </span>
        ))}
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
