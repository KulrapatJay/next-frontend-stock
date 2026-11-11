import { z } from "zod";
import type { TransactionInput } from "@/types";

// Transaction form rules (mirror of backend validation; numbers stay decimal strings)
const DECIMAL = /^\d{1,18}(\.\d{1,10})?$/;
const DECIMAL_MESSAGE = "กรอกเป็นตัวเลข ไม่เกิน 18 หลักก่อนจุด และ 10 หลักหลังจุด";
const isPositive = (value: string) => /[1-9]/.test(value);

const decimal = z.string().trim().min(1, "กรอกตัวเลข").regex(DECIMAL, DECIMAL_MESSAGE);

export const transactionSchema = z.object({
  side: z.enum(["buy", "sell"], "เลือกซื้อหรือขาย"),
  symbol: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "กรอกชื่อย่อหุ้น")
    .regex(/^[A-Z][A-Z0-9.-]{0,14}$/, "ชื่อย่อหุ้นไม่ถูกต้อง เช่น AAPL หรือ BRK.B"),
  quantity: decimal.refine(isPositive, "จำนวนหุ้นต้องมากกว่า 0"),
  price: decimal.refine(isPositive, "ราคาต้องมากกว่า 0"),
  fee: decimal,
  executed_at: z
    .string()
    .min(1, "เลือกวันและเวลาที่ซื้อขาย")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "วันและเวลาไม่ถูกต้อง")
    .refine((value) => new Date(value).getTime() <= Date.now(), "วันและเวลาต้องไม่อยู่ในอนาคต"),
});

export type TransactionForm = z.input<typeof transactionSchema>;
export type TransactionErrors = Partial<Record<keyof TransactionForm, string>>;

type Parsed = { ok: true; input: TransactionInput } | { ok: false; errors: TransactionErrors };

// originalExecutedAt: sent unchanged when the user did not touch the time, to keep its full precision
export function parseTransaction(form: TransactionForm, originalExecutedAt?: string): Parsed {
  const result = transactionSchema.safeParse(form);
  if (!result.success) {
    const errors: TransactionErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof TransactionForm;
      errors[field] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const executedAt = originalExecutedAt ?? new Date(result.data.executed_at).toISOString();
  return { ok: true, input: { ...result.data, executed_at: executedAt } };
}

// Value for <input type="datetime-local"> in the browser's time zone
export function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
