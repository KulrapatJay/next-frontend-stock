import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, apiWithEtag, resetCsrfToken } from "./api";

type Call = { url: string; method: string; headers: Headers; body: string | undefined };

function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(body === null ? null : JSON.stringify(body), { status, headers });
}

const failure = (status: number, code: string) => json(status, { error: { code, message: "m", request_id: "r" } });

function mockFetch(handler: (call: Call) => Response) {
  const calls: Call[] = [];
  let tokens = 0;
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    const call = {
      url,
      method: init.method ?? "GET",
      headers: new Headers(init.headers),
      body: init.body as string | undefined,
    };
    calls.push(call);
    if (url === "/api/v1/auth/csrf") return json(200, { csrf_token: `csrf-${++tokens}`, expires_at: "x" });
    return handler(call);
  });
  return calls;
}

const requests = (calls: Call[]) => calls.filter((call) => call.url !== "/api/v1/auth/csrf");

beforeEach(() => {
  resetCsrfToken();
});

describe("api", () => {
  it("sends GET without a CSRF token", async () => {
    const calls = mockFetch(() => json(200, { ok: true }));
    expect(await api("/auth/me")).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].headers.has("X-CSRF-Token")).toBe(false);
  });

  it("fetches one CSRF token and reuses it for later writes", async () => {
    const calls = mockFetch(() => json(200, {}));
    await api("/a", { method: "POST", body: { quantity: "0.5" } });
    await api("/b", { method: "POST" });
    expect(calls.map((call) => call.url)).toEqual(["/api/v1/auth/csrf", "/api/v1/a", "/api/v1/b"]);
    expect(calls[1].headers.get("X-CSRF-Token")).toBe("csrf-1");
    expect(calls[2].headers.get("X-CSRF-Token")).toBe("csrf-1");
    expect(calls[1].body).toBe('{"quantity":"0.5"}');
    expect(calls[1].headers.get("Content-Type")).toBe("application/json");
  });

  it("retries once with a fresh token after csrf_failed", async () => {
    let attempts = 0;
    const calls = mockFetch(() => (++attempts === 1 ? failure(403, "csrf_failed") : json(200, { done: true })));
    expect(await api("/a", { method: "POST" })).toEqual({ done: true });
    expect(requests(calls).map((call) => call.headers.get("X-CSRF-Token"))).toEqual(["csrf-1", "csrf-2"]);
  });

  it("gives up when csrf_failed repeats", async () => {
    const calls = mockFetch(() => failure(403, "csrf_failed"));
    await expect(api("/a", { method: "POST" })).rejects.toMatchObject({ code: "csrf_failed", status: 403 });
    expect(requests(calls)).toHaveLength(2);
  });

  it("does not retry other errors", async () => {
    const calls = mockFetch(() => failure(412, "version_conflict"));
    await expect(api("/a", { method: "PUT", ifMatch: '"3"' })).rejects.toBeInstanceOf(ApiError);
    expect(requests(calls)).toHaveLength(1);
  });

  it("returns null for 204", async () => {
    mockFetch(() => json(204, null));
    expect(await api("/a", { method: "DELETE", ifMatch: '"1"' })).toBeNull();
  });
});

describe("apiWithEtag", () => {
  it("returns the ETag exactly as sent, quotes included", async () => {
    mockFetch(() => json(200, { version: 3 }, { ETag: '"3"' }));
    expect(await apiWithEtag("/portfolios/p1")).toEqual({ data: { version: 3 }, etag: '"3"' });
  });

  it("returns a null etag when the header is absent", async () => {
    mockFetch(() => json(200, {}));
    expect((await apiWithEtag("/portfolios")).etag).toBeNull();
  });

  it("sends If-Match and Idempotency-Key unchanged", async () => {
    const calls = mockFetch(() => json(200, {}));
    await apiWithEtag("/a", { method: "PUT", ifMatch: '"3"', body: {} });
    await apiWithEtag("/b", { method: "POST", idempotencyKey: "key-1", body: {} });
    const [put, post] = requests(calls);
    expect(put.headers.get("If-Match")).toBe('"3"');
    expect(post.headers.get("Idempotency-Key")).toBe("key-1");
  });

  it("keeps the same Idempotency-Key on the csrf retry", async () => {
    let attempts = 0;
    const calls = mockFetch(() => (++attempts === 1 ? failure(403, "csrf_failed") : json(201, {}, { ETag: '"1"' })));
    await apiWithEtag("/a", { method: "POST", idempotencyKey: "key-1", body: {} });
    expect(requests(calls).map((call) => call.headers.get("Idempotency-Key"))).toEqual(["key-1", "key-1"]);
  });
});
