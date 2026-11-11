import type { ReactNode } from "react";
import { formatMoney, formatPercent, formatSignedMoney, formatSignedPercent, signOf } from "@/lib/format";
import type { Quote } from "@/types";

// Small display parts shared by the portfolio valuation and the dashboard
const TONE = { positive: "text-success", negative: "text-danger", zero: "" } as const;

export function Pnl({ value }: { value: string | null }) {
  if (value === null) return <span className="text-ink-muted">–</span>;
  return <span className={TONE[signOf(formatMoney(value))]}>{formatSignedMoney(value)}</span>;
}

export function PnlPercent({ value }: { value: string | null }) {
  if (value === null) return <span className="text-ink-muted">–</span>;
  return <span className={TONE[signOf(formatPercent(value))]}>{formatSignedPercent(value)}</span>;
}

export function Percent({ value }: { value: string | null }) {
  if (value === null) return <span className="text-ink-muted">–</span>;
  return <>{formatPercent(value)}</>;
}

export function Money({ value }: { value: string | null }) {
  if (value === null) return <span className="text-ink-muted">–</span>;
  return <>{formatMoney(value)}</>;
}

export function Tile({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="rounded border border-rule bg-field p-4">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{children}</p>
      {note && <p className="mt-1 text-sm text-ink-muted">{note}</p>}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-field-border px-1.5 py-0.5 text-xs font-medium text-ink-muted">
      {children}
    </span>
  );
}

const SESSION: Record<string, string> = {
  market_closed: "ราคาปิดของวันทำการล่าสุด",
  unknown: "ไม่ทราบสถานะตลาด ราคาอาจมาจากนอกเวลาซื้อขายปกติ",
};

// Label of a price from price_type and delay_minutes (never a fixed text)
export function priceTypeLabel(quote: Quote): string | null {
  return quote.price_type === "delayed_bar_close" ? `ราคาล่าช้า ${quote.delay_minutes} นาที` : null;
}

export function QuoteTags({ quote }: { quote: Quote }) {
  const labels = [
    priceTypeLabel(quote),
    quote.is_demo ? "ข้อมูลเดโม" : null,
    quote.stale ? "ราคาเก่า" : null,
    SESSION[quote.session_status] ?? null,
  ].filter((label): label is string => label !== null);

  if (labels.length === 0) return null;
  return (
    <span className="flex flex-wrap justify-end gap-1">
      {labels.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </span>
  );
}
