"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, TextAreaField } from "@/components/ui/Field";
import { createPortfolio, updatePortfolio } from "@/features/portfolios/api";
import { DESCRIPTION_MAX, NAME_MAX, validatePortfolio, type PortfolioErrors } from "@/features/portfolios/rules";
import { ApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { Portfolio } from "@/types";

// Create or edit a portfolio
type Props = {
  portfolio?: Portfolio;
  onSaved: (portfolio: Portfolio) => void;
  onConflict: () => void;
  onClose: () => void;
};

export function PortfolioFormDialog({ portfolio, onSaved, onConflict, onClose }: Props) {
  const [name, setName] = useState(portfolio?.name ?? "");
  const [description, setDescription] = useState(portfolio?.description ?? "");
  const [fieldErrors, setFieldErrors] = useState<PortfolioErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const input = { name: name.trim(), description };
    const errors = validatePortfolio(input);
    setFieldErrors(errors);
    setError(null);
    if (errors.name || errors.description) return;

    setPending(true);
    try {
      onSaved(portfolio ? await updatePortfolio(portfolio, input) : await createPortfolio(input));
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError && err.code === "portfolio_name_conflict") {
        setFieldErrors({ name: errorMessage(err) });
      } else if (err instanceof ApiError && err.code === "version_conflict") {
        onConflict();
      } else {
        setError(errorMessage(err));
      }
    }
  }

  return (
    <Dialog title={portfolio ? "แก้ไขพอร์ต" : "สร้างพอร์ต"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-5">
        {error && <Alert>{error}</Alert>}
        <Field
          label="ชื่อพอร์ต"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          hint={`ไม่เกิน ${NAME_MAX} ตัวอักษร`}
          autoComplete="off"
          autoFocus
        />
        <TextAreaField
          label="คำอธิบาย (ไม่บังคับ)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description}
          hint={`ไม่เกิน ${DESCRIPTION_MAX} ตัวอักษร`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            ยกเลิก
          </Button>
          <Button type="submit" pending={pending} pendingLabel="กำลังบันทึก…">
            บันทึก
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
