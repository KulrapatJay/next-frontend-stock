"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { listTransactions } from "@/features/transactions/api";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney, formatQuantity } from "@/lib/format";
import type { Transaction } from "@/types";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { TransactionFormDialog } from "./TransactionFormDialog";

// Transactions of one portfolio: list, record, edit, delete
type DialogState = { kind: "create" } | { kind: "edit" | "delete"; transaction: Transaction } | null;

export function TransactionSection({ portfolioId, onChanged }: { portfolioId: string; onChanged: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const load = useCallback(
    () =>
      listTransactions(portfolioId)
        .then((page) => {
          setTransactions(page.data);
          setNextCursor(page.next_cursor);
          setError(null);
        })
        .catch((err) => setError(errorMessage(err))),
    [portfolioId],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await listTransactions(portfolioId, nextCursor);
      setTransactions((current) => [...(current ?? []), ...page.data]);
      setNextCursor(page.next_cursor);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  function changed() {
    setDialog(null);
    setNotice(null);
    load();
    onChanged();
  }

  function conflict() {
    setDialog(null);
    setNotice("รายการนี้ถูกแก้ไขจากที่อื่น ระบบโหลดข้อมูลล่าสุดให้แล้ว ลองทำอีกครั้ง");
    load();
  }

  return (
    <section aria-labelledby="transactions-heading" className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="transactions-heading" className="text-xl font-bold leading-tight">
          รายการซื้อขาย
        </h2>
        <Button type="button" size="sm" onClick={() => setDialog({ kind: "create" })}>
          บันทึกรายการ
        </Button>
      </div>

      <div className="mt-4 grid gap-4">
        {notice && <Alert>{notice}</Alert>}
        {error && (
          <Alert>
            {error}{" "}
            {transactions === null && (
              <button type="button" onClick={() => load()} className="font-semibold underline">
                ลองอีกครั้ง
              </button>
            )}
          </Alert>
        )}

        {transactions === null && !error && <p className="text-ink-muted">กำลังโหลด…</p>}

        {transactions?.length === 0 && (
          <div className="rounded border border-dashed border-field-border px-6 py-10 text-center">
            <p className="text-lg font-semibold">ยังไม่มีรายการ</p>
            <p className="mt-1 text-ink-muted">บันทึกการซื้อหุ้นครั้งแรกของพอร์ตนี้</p>
          </div>
        )}

        {transactions && transactions.length > 0 && (
          <div className="overflow-x-auto rounded border border-rule bg-field">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-rule text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    วันเวลา
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    ประเภท
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    หุ้น
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    จำนวน
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    ราคา (USD)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    ค่าธรรมเนียม
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-rule last:border-0">
                    <td className="whitespace-nowrap px-4 py-3">{formatDateTime(tx.executed_at)}</td>
                    <td className={`px-4 py-3 font-medium ${tx.side === "buy" ? "text-success" : "text-danger"}`}>
                      {tx.side === "buy" ? "ซื้อ" : "ขาย"}
                    </td>
                    <td className="px-4 py-3 font-semibold">{tx.symbol}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatQuantity(tx.quantity)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(tx.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(tx.fee)}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setDialog({ kind: "edit", transaction: tx })}
                          aria-label={`แก้ไขรายการ ${tx.symbol} ${formatDateTime(tx.executed_at)}`}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => setDialog({ kind: "delete", transaction: tx })}
                          aria-label={`ลบรายการ ${tx.symbol} ${formatDateTime(tx.executed_at)}`}
                        >
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {nextCursor && (
          <Button type="button" variant="secondary" onClick={loadMore} pending={loadingMore} pendingLabel="กำลังโหลด…">
            โหลดเพิ่ม
          </Button>
        )}
      </div>

      {dialog?.kind === "create" && (
        <TransactionFormDialog
          portfolioId={portfolioId}
          onSaved={changed}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "edit" && (
        <TransactionFormDialog
          portfolioId={portfolioId}
          transaction={dialog.transaction}
          onSaved={changed}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeleteTransactionDialog
          transaction={dialog.transaction}
          onDeleted={changed}
          onConflict={conflict}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}
