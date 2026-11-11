"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { deletePortfolio } from "@/features/portfolios/api";
import { ApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { Portfolio } from "@/types";

// Confirm deleting a portfolio
type Props = {
  portfolio: Portfolio;
  onDeleted: () => void;
  onConflict: () => void;
  onClose: () => void;
};

export function DeletePortfolioDialog({ portfolio, onDeleted, onConflict, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      await deletePortfolio(portfolio);
      onDeleted();
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError && err.code === "version_conflict") onConflict();
      else setError(errorMessage(err));
    }
  }

  return (
    <Dialog title="ลบพอร์ตนี้?" onClose={onClose}>
      <div className="grid gap-5">
        {error && <Alert>{error}</Alert>}
        <p className="text-base text-pretty">
          พอร์ต <strong className="font-semibold break-words">{portfolio.name}</strong> จะถูกลบถาวร
          และลบได้เฉพาะพอร์ตที่ไม่มีรายการซื้อขายเหลืออยู่
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            ยกเลิก
          </Button>
          <Button type="button" variant="danger" onClick={confirm} pending={pending} pendingLabel="กำลังลบ…">
            ลบพอร์ต
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
