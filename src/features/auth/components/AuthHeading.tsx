import type { ReactNode } from "react";

// Auth page heading
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 grid gap-2">
      <h1 className="text-3xl font-bold leading-tight text-balance">{title}</h1>
      {children && <p className="text-base text-ink-muted text-pretty">{children}</p>}
    </header>
  );
}
