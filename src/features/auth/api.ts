import { api, resetCsrfToken } from "@/lib/api";
import type { AuthConfig, OtpAccepted, SessionResponse, User } from "@/types";

// Auth endpoints (/api/v1/auth/*)
export function getAuthConfig() {
  return api<AuthConfig>("/auth/config");
}

export function getCurrentUser() {
  return api<User>("/auth/me");
}

export function register(email: string, password: string) {
  return api<OtpAccepted>("/auth/register", { method: "POST", body: { email, password } });
}

export function requestEmailVerification(email: string) {
  return api<OtpAccepted>("/auth/email-verification/request", { method: "POST", body: { email } });
}

export function confirmEmailVerification(challengeId: string, otp: string) {
  return api<void>("/auth/email-verification/confirm", {
    method: "POST",
    body: { challenge_id: challengeId, otp },
  });
}

export async function login(email: string, password: string) {
  const session = await api<SessionResponse>("/auth/login", { method: "POST", body: { email, password } });
  resetCsrfToken();
  return session;
}

export async function logout() {
  await api<void>("/auth/logout", { method: "POST" });
  resetCsrfToken();
}

export function requestPasswordReset(email: string) {
  return api<OtpAccepted>("/auth/password-reset/request", { method: "POST", body: { email } });
}

export function confirmPasswordReset(challengeId: string, otp: string, newPassword: string) {
  return api<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: { challenge_id: challengeId, otp, new_password: newPassword },
  });
}

export function startGoogleSignIn() {
  return api<{ authorization_url: string }>("/auth/google/start", { method: "POST" });
}
