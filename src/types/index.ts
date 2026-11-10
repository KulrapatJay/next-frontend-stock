import type { components } from "./api.gen";

// API types (aliases of the generated schemas)
type Schemas = components["schemas"];

export type ApiErrorBody = Schemas["http.ErrorResponse"];
export type User = Schemas["http.UserResponse"];
export type SessionResponse = Schemas["http.SessionResponse"];
export type OtpAccepted = Schemas["http.OTPAcceptedResponse"];
export type AuthConfig = Schemas["http.AuthConfigResponse"];
export type ResetToken = Schemas["http.ResetTokenResponse"];
