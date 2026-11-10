# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual retail investors tracking their own stock portfolio. Confirmed by the owner. Their core job in the app is to record their own buys and sells. Other audiences (active traders, advisors managing client portfolios) were not confirmed and are out of scope until stated.

## Product Purpose

A stock portfolio tracker where an investor keeps an accurate, hand-entered history of transactions: buys and sells. The portfolio view (holdings, value, profit/loss) is derived from that history. Success is an investor who trusts the numbers because every transaction behind them is recorded and visible.

## Positioning

Not yet defined. What sets this apart from a brokerage app or a spreadsheet was not answered. Do not invent a differentiator in copy or design.

## Operating Context

- Market and currency: US stock market, amounts in USD (confirmed).
- Data entry is manual: the user records transactions themselves. Brokerage account linking is not confirmed and should not be assumed.
- A separate backend API (`NEXT_PUBLIC_API_URL`, local default `http://localhost:8080/api`) owns all data. The frontend authenticates with an httpOnly-style cookie named `token`; `/dashboard` is the protected area and `/login` the public auth page (`src/lib/constants.ts`, `src/proxy.ts`).

## Capabilities and Constraints

- Built today: login page stub (TODO form), empty protected `/dashboard`, navbar, footer, error and not-found pages, fetch wrapper at `src/lib/api.ts`. No product features exist yet.
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Geist fonts. Source under `src/`.
- Terminology: transaction types are buy and sell. Dividends are out of scope for phase 1 (owner decision, 2026-11-10): the backend has no dividend event yet, so the UI must not offer or compute them.
- Open decisions, record rather than assume:
  - UI language. Evidence points to Thai (`<html lang="th">`, login title "เข้าสู่ระบบ"), while the market is USD/US and the app title is English. Whether the UI is Thai-first, bilingual or English is unconfirmed.
  - Whether prices come from a market data feed or are entered by hand, and how cost basis and realized/unrealized P&L are computed (the backend's responsibility).
  - Light and dark theme support (scaffold follows system preference; not confirmed as a requirement).

## Brand Commitments

None confirmed. The name "Stock Portfolio" is a working title from the scaffold.

## Evidence on Hand

No real content, data, screenshots, testimonials or brand assets exist yet. The home page is the unmodified create-next-app template. Do not fabricate users, portfolio figures, performance claims or proof.

## Product Principles

1. Transactions are the source of truth. Anything shown (holdings, totals, profit/loss) should trace back to recorded buys and sells.
2. Entry is the primary task. Recording a transaction should be fast, correct, and hard to get wrong, since the whole product depends on accurate entry.
3. Money is exact and legible. Amounts, quantities, dates and currency (USD) are never ambiguous or rounded misleadingly.
4. Make no claims the data can't back. No invented performance, advice or recommendations; the app records and reports, it doesn't tell the investor what to do.

## Accessibility & Inclusion

No product-specific requirement established. Falls back to the baseline in the craft floor.
