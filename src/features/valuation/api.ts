import { api } from "@/lib/api";
import type { AccountValuation, Valuation } from "@/types";

// Valuation endpoint (/api/v1/portfolios/{id}/valuation)
export function getValuation(portfolioId: string) {
  return api<Valuation>(`/portfolios/${encodeURIComponent(portfolioId)}/valuation`);
}

// Valuation of every portfolio together (/api/v1/valuation)
export function getAccountValuation() {
  return api<AccountValuation>("/valuation");
}
