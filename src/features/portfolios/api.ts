import { api, apiWithEtag } from "@/lib/api";
import type { Portfolio, PortfolioInput, PortfolioPage } from "@/types";

// Portfolio endpoints (/api/v1/portfolios)
export function listPortfolios(cursor?: string | null) {
  const query = new URLSearchParams();
  if (cursor) query.set("cursor", cursor);
  return api<PortfolioPage>(`/portfolios${query.size ? `?${query}` : ""}`);
}

export function getPortfolio(id: string) {
  return api<Portfolio>(`/portfolios/${encodeURIComponent(id)}`);
}

export function createPortfolio(input: PortfolioInput) {
  return api<Portfolio>("/portfolios", { method: "POST", body: input });
}

export async function updatePortfolio(portfolio: Portfolio, input: PortfolioInput) {
  const { data } = await apiWithEtag<Portfolio>(`/portfolios/${encodeURIComponent(portfolio.id)}`, {
    method: "PUT",
    body: input,
    ifMatch: versionTag(portfolio),
  });
  return data;
}

export function deletePortfolio(portfolio: Portfolio) {
  return api<void>(`/portfolios/${encodeURIComponent(portfolio.id)}`, {
    method: "DELETE",
    ifMatch: versionTag(portfolio),
  });
}

// ETag of a portfolio is its version in double quotes
function versionTag(portfolio: Portfolio) {
  return `"${portfolio.version}"`;
}
