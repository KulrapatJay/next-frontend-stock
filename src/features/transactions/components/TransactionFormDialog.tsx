"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { createTransaction, updateTransaction } from "@/features/transactions/api";
import {
  parseTransaction,
  toLocalInput,
  type TransactionErrors,
  type TransactionForm,
} from "@/features/transactions/schema";
import { ApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { Transaction } from "@/types";

// Record or edit a buy/sell
type Props = {
  portfolioId: string;
  transaction?: Transaction;
  onSaved: () => void;
  onConflict: () => void;
  onClose: () => void;
};

const SIDES = [
  { value: "buy", label: "ซื้อ" },
  { value: "sell", label: "ขาย" },
] as const;

const FIELD_OF_CODE: Record<string, keyof TransactionForm> = {
  unknown_symbol: "symbol",
  insufficient_shares: "quantity",
};

export function TransactionFormDialog({ portfolioId, transaction, onSaved, onConflict, onClose }: Props) {
  const [form, setForm] = useState<TransactionForm>(() => ({
    side: transaction?.side ?? "buy",
    symbol: transaction?.symbol ?? "",
    quantity: transaction?.quantity ?? "",
    price: transaction?.price ?? "",
    fee: transaction?.fee ?? "0",
    executed_at: toLocalInput(transaction ? new Date(transaction.executed_at) : new Date()),
  }));
  const [maxTime] = useState(() => toLocalInput(new Date()));
  const [timeTouched, setTimeTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<TransactionErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const idempotencyKey = useRef<string | null>(null);

  function change<K extends keyof TransactionForm>(field: K, value: TransactionForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    idempotencyKey.current = null;
    if (field === "executed_at") setTimeTouched(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseTransaction(form, transaction && !timeTouched ? transaction.executed_at : undefined);
    setError(null);
    setFieldErrors(parsed.ok ? {} : parsed.errors);
    if (!parsed.ok) return;

    setPending(true);
    try {
      if (transaction) {
        await updateTransaction(transaction, parsed.input);
      } else {
        idempotencyKey.current ??= crypto.randomUUID();
        await createTransaction(portfolioId, parsed.input, idempotencyKey.current);
      }
      onSaved();
    } catch (err) {
      setPending(false);
      const code = err instanceof ApiError ? err.code : "";
      if (code === "version_conflict") return onConflict();
      if (code === "idempotency_conflict") idempotencyKey.current = null;
      const field = FIELD_OF_CODE[code];
      if (field) setFieldErrors({ [field]: errorMessage(err) });
      else setError(errorMessage(err));
    }
  }

  return (
    <Dialog title={transaction ? "แก้ไขรายการ" : "บันทึกรายการซื้อขาย"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-5">
        {error && <Alert>{error}</Alert>}

        <fieldset className="grid gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">ประเภท</legend>
          <div className="grid grid-cols-2 gap-3">
            {SIDES.map((side) => (
              <label
                key={side.value}
                className="flex h-12 cursor-pointer items-center justify-center rounded border border-field-border bg-field text-base font-medium transition-colors hover:border-ink-muted has-checked:border-accent has-checked:bg-accent has-checked:text-accent-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              >
                <input
                  type="radio"
                  name="side"
                  value={side.value}
                  checked={form.side === side.value}
                  onChange={() => change("side", side.value)}
                  className="sr-only"
                />
                {side.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label="ชื่อย่อหุ้น"
          value={form.symbol}
          onChange={(e) => change("symbol", e.target.value.toUpperCase())}
          error={fieldErrors.symbol}
          placeholder="AAPL"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={15}
          autoFocus={!transaction}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="จำนวนหุ้น"
            value={form.quantity}
            onChange={(e) => change("quantity", e.target.value)}
            error={fieldErrors.quantity}
            inputMode="decimal"
            autoComplete="off"
          />
          <Field
            label="ราคาต่อหุ้น (USD)"
            value={form.price}
            onChange={(e) => change("price", e.target.value)}
            error={fieldErrors.price}
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
        <Field
          label="ค่าธรรมเนียม (USD)"
          value={form.fee}
          onChange={(e) => change("fee", e.target.value)}
          error={fieldErrors.fee}
          hint="ถ้าไม่มีให้ใส่ 0"
          inputMode="decimal"
          autoComplete="off"
        />
        <Field
          label="วันและเวลาที่ซื้อขาย"
          type="datetime-local"
          value={form.executed_at}
          max={maxTime}
          onChange={(e) => change("executed_at", e.target.value)}
          error={fieldErrors.executed_at}
          hint="ตามเวลาของเครื่องคุณ"
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
