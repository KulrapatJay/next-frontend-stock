"use client";

import { useEffect, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { PASSWORD_RULES } from "@/lib/password";

// Shared auth UI
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  pending?: boolean;
  pendingLabel?: string;
};

export function Button({ variant = "primary", pending, pendingLabel, children, disabled, className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded px-4 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const look =
    variant === "primary"
      ? "bg-accent font-semibold text-accent-ink hover:bg-accent-hover"
      : "border border-field-border bg-field font-medium text-ink hover:border-ink-muted";
  return (
    <button disabled={disabled || pending} aria-busy={pending || undefined} className={`${base} ${look} ${className}`} {...props}>
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  if (tone === "success") {
    return (
      <div role="status" className="rounded border border-success/40 bg-field px-4 py-3 text-sm text-success">
        {children}
      </div>
    );
  }
  return (
    <div role="alert" className="rounded border border-danger/40 bg-danger-bg px-4 py-3 text-sm text-danger">
      {children}
    </div>
  );
}

export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 grid gap-2">
      <h1 className="text-3xl font-bold leading-tight text-balance">{title}</h1>
      {children && <p className="text-base text-ink-muted text-pretty">{children}</p>}
    </header>
  );
}

export function PasswordRules({ password, showFailures }: { password: string; showFailures?: boolean }) {
  return (
    <ul className="grid gap-1 text-sm" aria-label="เงื่อนไขรหัสผ่าน">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        const tone = ok ? "text-success" : showFailures ? "text-danger" : "text-ink-muted";
        return (
          <li key={rule.id} className={`flex items-center gap-2 ${tone}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ok ? <path d="M3 8.5l3 3 7-7" /> : <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />}
            </svg>
            <span>
              {rule.label}
              <span className="sr-only">{ok ? " (ผ่าน)" : " (ยังไม่ผ่าน)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export type PrintEntry = { id: string; code: string; detail: string };

export function printEntry(code: string, detail: string): PrintEntry {
  return { id: `${Date.now()}-${code}`, code, detail };
}

export function PrintedEntries({ entries }: { entries: PrintEntry[] }) {
  if (entries.length === 0) return null;
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
  return (
    <ol aria-hidden className="mt-10 font-dot text-[15px] leading-10 text-ink-muted">
      {entries.map((entry) => {
        const text = `${date}  ${entry.code.padEnd(4)}  ${entry.detail}`;
        return (
          <li key={entry.id} className="print-line overflow-hidden whitespace-pre" style={{ "--print-steps": text.length } as CSSProperties}>
            {text}
          </li>
        );
      })}
    </ol>
  );
}

export function useCountdown(initial: number) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return [left, setLeft] as const;
}
