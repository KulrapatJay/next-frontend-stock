"use client";

import { useEffect, useId, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { inputClass } from "@/components/ui/Field";
import { getValuation } from "@/features/valuation/api";
import { errorMessage } from "@/lib/errors";
import { signOf } from "@/lib/format";
import type { AccountValuation, Valuation } from "@/types";
import { AllocationChart } from "./AllocationChart";

// Allocation of the whole account or of one portfolio chosen by the user
const ALL = "all";
const STORAGE_KEY = "dashboard.allocation-portfolio";

function readChoice(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ALL;
  } catch {
    return ALL;
  }
}

function saveChoice(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
}

type Loaded = { id: string; valuation: Valuation } | { id: string; error: string };

export function AllocationSection({ account }: { account: AccountValuation }) {
  const selectId = useId();
  const [choice, setChoice] = useState(readChoice);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const known = account.portfolios.some((portfolio) => portfolio.portfolio_id === choice);
  const selected = known ? choice : ALL;

  useEffect(() => {
    if (selected === ALL) return;
    let cancelled = false;
    getValuation(selected)
      .then((valuation) => !cancelled && setLoaded({ id: selected, valuation }))
      .catch((err) => !cancelled && setLoaded({ id: selected, error: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  function choose(value: string) {
    setChoice(value);
    saveChoice(value);
  }

  const single = selected !== ALL && loaded?.id === selected ? loaded : null;
  const failure = single && "error" in single ? single.error : null;
  const valuation = single && "valuation" in single ? single.valuation : null;
  const loading = selected !== ALL && !single;

  const rows = valuation
    ? valuation.positions.filter((position) => signOf(position.quantity) !== "zero")
    : account.allocation;
  const complete = (valuation ?? account).coverage === "complete";

  return (
    <section aria-labelledby="allocation-heading" className="rounded border border-rule bg-field p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="allocation-heading" className="text-xl font-bold leading-tight">
          สัดส่วนหุ้นที่ถือ
        </h2>
        <div className="grid gap-1">
          <label htmlFor={selectId} className="text-sm text-ink-muted">
            แสดงของ
          </label>
          <select
            id={selectId}
            value={selected}
            onChange={(event) => choose(event.target.value)}
            className={`${inputClass} h-10 sm:w-64`}
          >
            <option value={ALL}>ทุกพอร์ต</option>
            {account.portfolios.map((portfolio) => (
              <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4" aria-live="polite">
        {failure && <Alert>{failure}</Alert>}
        {loading && <p className="text-ink-muted">กำลังโหลด…</p>}
        {!loading && !failure && !complete && selected !== ALL && (
          <Alert>
            {valuation?.coverage === "unavailable"
              ? "ตอนนี้ยังไม่มีราคาของหุ้นในพอร์ตนี้"
              : `ไม่มีราคาของ ${valuation?.missing_symbols.join(", ")}`}
          </Alert>
        )}
        {!loading && !failure && rows.length === 0 && <p className="text-ink-muted">ตอนนี้ไม่มีหุ้นที่ถืออยู่</p>}
        {!loading && !failure && rows.length > 0 && <AllocationChart rows={rows} canDraw={complete} />}
      </div>
    </section>
  );
}
