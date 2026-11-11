"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { deleteTransaction } from "@/features/transactions/api";
import { ApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatQuantity } from "@/lib/format";
import type { Transaction } from "@/types";

// Confirm deleting a transaction
type Props = {
  transaction: Transaction;
  onDeleted: () => void;
  onConflict: () => void;
  onClose: () => void;
};

export function DeleteTransactionDialog({ transaction, onDeleted, onConflict, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      await deleteTransaction(transaction);
      onDeleted();
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError && err.code === "version_conflict") onConflict();
      else setError(errorMessage(err));
    }
  }

  return (
    <Dialog title="ลบรายการนี้?" onClose={onClose}>
      <div className="grid gap-5">
        {error && <Alert>{error}</Alert>}
        <p className="text-base text-pretty">
          รายการ{transaction.side === "buy" ? "ซื้อ" : "ขาย"}{" "}
          <strong className="font-semibold">
            {transaction.symbol} {formatQuantity(transaction.quantity)} หุ้น
          </strong>{" "}
          เมื่อ {formatDateTime(transaction.executed_at)} จะถูกลบถาวร
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            ยกเลิก
          </Button>
          <Button type="button" variant="danger" onClick={confirm} pending={pending} pendingLabel="กำลังลบ…">
            ลบรายการ
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
