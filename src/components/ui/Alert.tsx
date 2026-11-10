import type { ReactNode } from "react";

// Alert
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
