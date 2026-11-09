import type { ApiErrorBody } from "@/types";

// API client (browser, same-origin /api/v1 with CSRF)
const BASE = "/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: string[];
  readonly requestId: string | null;
  readonly retryAfter: number | null;

  constructor(status: number, body: ApiErrorBody | null, headers: Headers) {
    super(body?.error.message ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error.code ?? "unknown";
    this.details = body?.error.details ?? [];
    this.requestId = body?.error.request_id ?? headers.get("X-Request-ID");
    const retry = Number(headers.get("Retry-After"));
    this.retryAfter = Number.isFinite(retry) && retry > 0 ? retry : null;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";
type ApiOptions = { method?: Method; body?: unknown; headers?: HeadersInit };

let csrfToken: Promise<string> | null = null;

function getCsrfToken(): Promise<string> {
  csrfToken ??= send("GET", "/auth/csrf")
    .then((data) => (data as { csrf_token: string }).csrf_token)
    .catch((err) => {
      csrfToken = null;
      throw err;
    });
  return csrfToken;
}

export function resetCsrfToken() {
  csrfToken = null;
}

async function send(method: Method, path: string, body?: unknown, headers?: HeadersInit) {
  const h = new Headers(headers);
  if (body !== undefined) h.set("Content-Type", "application/json");
  if (method !== "GET") h.set("X-CSRF-Token", await getCsrfToken());

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });

  const data: unknown = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data as ApiErrorBody | null, res.headers);
  return data;
}

export async function api<T>(path: string, { method = "GET", body, headers }: ApiOptions = {}): Promise<T> {
  try {
    return (await send(method, path, body, headers)) as T;
  } catch (err) {
    if (method !== "GET" && err instanceof ApiError && err.code === "csrf_failed") {
      resetCsrfToken();
      return (await send(method, path, body, headers)) as T;
    }
    throw err;
  }
}
