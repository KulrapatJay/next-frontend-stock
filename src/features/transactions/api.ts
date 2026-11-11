import { api } from "@/lib/api";
import type { Transaction, TransactionInput, TransactionPage } from "@/types";

// Transaction endpoints (/api/v1/portfolios/{id}/transactions)
const base = (portfolioId: string) => `/portfolios/${encodeURIComponent(portfolioId)}/transactions`;
const one = (tx: Transaction) => `${base(tx.portfolio_id)}/${encodeURIComponent(tx.id)}`;
const versionTag = (tx: Transaction) => `"${tx.version}"`;

export function listTransactions(portfolioId: string, cursor?: string | null) {
  const query = new URLSearchParams();
  if (cursor) query.set("cursor", cursor);
  return api<TransactionPage>(`${base(portfolioId)}${query.size ? `?${query}` : ""}`);
}

export function createTransaction(portfolioId: string, input: TransactionInput, idempotencyKey: string) {
  return api<Transaction>(base(portfolioId), { method: "POST", body: input, idempotencyKey });
}

export function updateTransaction(tx: Transaction, input: TransactionInput) {
  return api<Transaction>(one(tx), { method: "PUT", body: input, ifMatch: versionTag(tx) });
}

export function deleteTransaction(tx: Transaction) {
  return api<void>(one(tx), { method: "DELETE", ifMatch: versionTag(tx) });
}
