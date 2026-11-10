"use client";

import type { CSSProperties } from "react";

// Passbook printed lines
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
          <li
            key={entry.id}
            className="print-line overflow-hidden whitespace-pre"
            style={{ "--print-steps": text.length } as CSSProperties}
          >
            {text}
          </li>
        );
      })}
    </ol>
  );
}
