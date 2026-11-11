"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getPortfolio } from "@/features/portfolios/api";
import { ValuationSection } from "@/features/valuation/components/ValuationSection";
import { TransactionSection } from "@/features/transactions/components/TransactionSection";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { Portfolio } from "@/types";
import { DeletePortfolioDialog } from "./DeletePortfolioDialog";
import { PortfolioFormDialog } from "./PortfolioFormDialog";

// Portfolio detail: header, holdings and transactions
export function PortfolioDetail() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(
    () =>
      getPortfolio(portfolioId)
        .then((data) => {
          setPortfolio(data);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err))),
    [portfolioId],
  );

  useEffect(() => {
    load();
  }, [load]);

  function conflict() {
    setDialog(null);
    setNotice("พอร์ตนี้ถูกแก้ไขจากที่อื่น ระบบโหลดข้อมูลล่าสุดให้แล้ว ลองทำอีกครั้ง");
    void load();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8">
      <Link href="/portfolios" className="text-sm text-ink-muted underline hover:text-ink">
        ← พอร์ตทั้งหมด
      </Link>

      <div className="mt-4 grid gap-4">
        {notice && <Alert>{notice}</Alert>}
        {error && <Alert>{error}</Alert>}
        {!portfolio && !error && <p className="text-ink-muted">กำลังโหลด…</p>}

        {portfolio && (
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1 basis-64">
              <h1 className="text-2xl font-bold leading-tight break-words">{portfolio.name}</h1>
              {portfolio.description && (
                <p className="mt-2 whitespace-pre-line break-words text-ink-muted">{portfolio.description}</p>
              )}
              <p className="mt-2 text-sm text-ink-muted">
                {portfolio.currency} · สร้างเมื่อ {formatDate(portfolio.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setDialog("edit")}>
                แก้ไข
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => setDialog("delete")}>
                ลบ
              </Button>
            </div>
          </div>
        )}
      </div>

      {portfolio && (
        <>
          <ValuationSection portfolioId={portfolio.id} refreshKey={refreshKey} />
          <TransactionSection portfolioId={portfolio.id} onChanged={() => setRefreshKey((key) => key + 1)} />
        </>
      )}

      {portfolio && dialog === "edit" && (
        <PortfolioFormDialog
          portfolio={portfolio}
          onSaved={(saved) => {
            setPortfolio(saved);
            setNotice(null);
            setDialog(null);
          }}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
      {portfolio && dialog === "delete" && (
        <DeletePortfolioDialog
          portfolio={portfolio}
          onDeleted={() => router.replace("/portfolios")}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
