import type { components } from "./api.gen";

// API types (aliases of the generated schemas)
type Schemas = components["schemas"];

export type ApiErrorBody = Schemas["http.ErrorResponse"];
export type User = Schemas["http.UserResponse"];
export type SessionResponse = Schemas["http.SessionResponse"];
export type OtpAccepted = Schemas["http.OTPAcceptedResponse"];
export type AuthConfig = Schemas["http.AuthConfigResponse"];
export type Portfolio = Schemas["http.PortfolioResponse"];
export type PortfolioPage = Schemas["http.PortfolioPageResponse"];
export type PortfolioInput = Schemas["http.UpdatePortfolioRequest"];
export type Transaction = Schemas["http.TransactionResponse"];
export type TransactionPage = Schemas["http.TransactionPageResponse"];
export type TransactionInput = Schemas["http.TransactionRequest"];
export type Valuation = Schemas["http.ValuationResponse"];
export type Position = Schemas["http.PositionResponse"];
export type Quote = Schemas["http.QuoteResponse"];
export type AccountValuation = Schemas["http.AccountValuationResponse"];
export type AccountPortfolio = Schemas["http.AccountPortfolioResponse"];
export type Allocation = Schemas["http.AllocationResponse"];
export type ResetToken = Schemas["http.ResetTokenResponse"];
