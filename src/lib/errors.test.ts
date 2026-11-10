import { describe, expect, it } from "vitest";
import { ApiError } from "./api";
import { errorMessage } from "./errors";

function apiError(status: number, code: string, extra: { details?: string[]; headers?: Record<string, string> } = {}) {
  return new ApiError(
    status,
    { error: { code, message: "raw developer message", request_id: "req-123", details: extra.details } },
    new Headers(extra.headers),
  );
}

describe("errorMessage", () => {
  it("uses the Thai message of a known code and never the raw message", () => {
    const message = errorMessage(apiError(401, "invalid_credentials"));
    expect(message).toBe("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    expect(message).not.toContain("raw developer message");
  });

  it("falls back to a generic message with the request id for an unknown code", () => {
    expect(errorMessage(apiError(500, "some_new_code"))).toContain("req-123");
  });

  it("shows the wait time from Retry-After when rate limited", () => {
    expect(errorMessage(apiError(429, "rate_limited", { headers: { "Retry-After": "42" } }))).toContain("42");
  });

  it("maps invalid_input details and tolerates unknown ones", () => {
    const message = errorMessage(
      apiError(400, "invalid_input", { details: ["password_too_short", "brand_new_detail"] }),
    );
    expect(message).toContain("อย่างน้อย 6 ตัว");
    expect(message).toContain("ข้อมูลไม่ถูกต้อง");
  });

  it("treats a non-API error as a connection problem", () => {
    expect(errorMessage(new TypeError("Failed to fetch"))).toContain("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  });
});

describe("ApiError", () => {
  it("reads code, details and request id from the error envelope", () => {
    const err = apiError(400, "invalid_input", { details: ["password_too_short"] });
    expect([err.status, err.code, err.details, err.requestId]).toEqual([
      400,
      "invalid_input",
      ["password_too_short"],
      "req-123",
    ]);
  });

  it("falls back to the X-Request-ID header when the body is missing", () => {
    const err = new ApiError(502, null, new Headers({ "X-Request-ID": "hdr-9" }));
    expect([err.code, err.requestId, err.retryAfter]).toEqual(["unknown", "hdr-9", null]);
  });
});
