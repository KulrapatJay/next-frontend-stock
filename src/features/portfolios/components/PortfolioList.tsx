"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { listPortfolios } from "@/features/portfolios/api";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { Portfolio } from "@/types";
import { DeletePortfolioDialog } from "./DeletePortfolioDialog";
import { PortfolioFormDialog } from "./PortfolioFormDialog";

// Portfolio list with create, edit and delete
type DialogState = { kind: "create" } | { kind: "edit" | "delete"; portfolio: Portfolio } | null;

export function PortfolioList() {
  const [portfolios, setPortfolios] = useState<Portfolio[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const load = useCallback(
    () =>
      listPortfolios()
        .then((page) => {
          setPortfolios(page.data);
          setNextCursor(page.next_cursor);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err))),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await listPortfolios(nextCursor);
      setPortfolios((current) => [...(current ?? []), ...page.data]);
      setNextCursor(page.next_cursor);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  function saved(portfolio: Portfolio) {
    setPortfolios((current) => {
      const list = current ?? [];
      return list.some((p) => p.id === portfolio.id)
        ? list.map((p) => (p.id === portfolio.id ? portfolio : p))
        : [portfolio, ...list];
    });
    setNotice(null);
    setDialog(null);
  }

  function deleted(id: string) {
    setPortfolios((current) => (current ?? []).filter((p) => p.id !== id));
    setNotice(null);
    setDialog(null);
  }

  function conflict() {
    setDialog(null);
    setNotice("พอร์ตนี้ถูกแก้ไขจากที่อื่น ระบบโหลดข้อมูลล่าสุดให้แล้ว ลองทำอีกครั้ง");
    void load();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold leading-tight">พอร์ตของคุณ</h1>
        <Button type="button" size="sm" onClick={() => setDialog({ kind: "create" })}>
          สร้างพอร์ต
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {notice && <Alert>{notice}</Alert>}
        {error && (
          <Alert>
            {error}{" "}
            {portfolios === null && (
              <button type="button" onClick={() => void load()} className="font-semibold underline">
                ลองอีกครั้ง
              </button>
            )}
          </Alert>
        )}

        {portfolios === null && !error && <p className="text-ink-muted">กำลังโหลด…</p>}

        {portfolios?.length === 0 && (
          <div className="rounded border border-dashed border-field-border px-6 py-10 text-center">
            <p className="text-lg font-semibold">ยังไม่มีพอร์ต</p>
            <p className="mt-1 text-ink-muted">สร้างพอร์ตแรกเพื่อเริ่มบันทึกรายการซื้อขายของคุณ</p>
          </div>
        )}

        {portfolios && portfolios.length > 0 && (
          <ul className="grid gap-3">
            {portfolios.map((portfolio) => (
              <li key={portfolio.id} className="rounded border border-rule bg-field p-5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div className="min-w-0 flex-1 basis-64">
                    <Link
                      href={`/portfolios/${portfolio.id}`}
                      className="text-lg font-semibold break-words underline decoration-rule hover:decoration-ink"
                    >
                      {portfolio.name}
                    </Link>
                    {portfolio.description && (
                      <p className="mt-1 line-clamp-2 break-words text-ink-muted">{portfolio.description}</p>
                    )}
                    <p className="mt-2 text-sm text-ink-muted">
                      {portfolio.currency} · สร้างเมื่อ {formatDate(portfolio.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setDialog({ kind: "edit", portfolio })}
                      aria-label={`แก้ไขพอร์ต ${portfolio.name}`}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setDialog({ kind: "delete", portfolio })}
                      aria-label={`ลบพอร์ต ${portfolio.name}`}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {nextCursor && (
          <Button type="button" variant="secondary" onClick={loadMore} pending={loadingMore} pendingLabel="กำลังโหลด…">
            โหลดเพิ่ม
          </Button>
        )}
      </div>

      {dialog?.kind === "create" && (
        <PortfolioFormDialog onSaved={saved} onConflict={conflict} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "edit" && (
        <PortfolioFormDialog
          portfolio={dialog.portfolio}
          onSaved={saved}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeletePortfolioDialog
          portfolio={dialog.portfolio}
          onDeleted={() => deleted(dialog.portfolio.id)}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
