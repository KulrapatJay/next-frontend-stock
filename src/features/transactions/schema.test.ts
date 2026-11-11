import { describe, expect, it } from "vitest";
import { parseTransaction, toLocalInput, type TransactionForm } from "./schema";

const valid: TransactionForm = {
  side: "buy",
  symbol: "aapl",
  quantity: "0.5",
  price: "200.25",
  fee: "0",
  executed_at: "2026-10-01T14:30",
};

const errorsOf = (patch: Partial<TransactionForm>) => {
  const result = parseTransaction({ ...valid, ...patch });
  return result.ok ? {} : result.errors;
};

describe("parseTransaction", () => {
  it("returns decimal strings untouched, an upper-case symbol and a time with a zone", () => {
    const result = parseTransaction(valid);
    expect(result).toEqual({
      ok: true,
      input: {
        side: "buy",
        symbol: "AAPL",
        quantity: "0.5",
        price: "200.25",
        fee: "0",
        executed_at: new Date("2026-10-01T14:30").toISOString(),
      },
    });
  });

  it("keeps the original executed_at when one is given", () => {
    const result = parseTransaction(valid, "2026-10-01T14:30:15.123456Z");
    expect(result.ok && result.input.executed_at).toBe("2026-10-01T14:30:15.123456Z");
  });

  it.each(["BRK.B", "BF-B", "A", "ABCDEFGHIJKLMNO"])("accepts symbol %s", (symbol) => {
    expect(errorsOf({ symbol })).toEqual({});
  });

  it.each(["", "1ABC", "AB C", "ABCDEFGHIJKLMNOP", "AAPL$"])("rejects symbol %j", (symbol) => {
    expect(errorsOf({ symbol }).symbol).toBeDefined();
  });

  it.each(["0", "0.000", "-1", "1,000", "1e3", ".5", "1.", "abc", "", "1234567890123456789", "1.12345678901"])(
    "rejects quantity %j",
    (quantity) => {
      expect(errorsOf({ quantity }).quantity).toBeDefined();
    },
  );

  it.each(["123456789012345678", "0.0000000001", "1.5"])("accepts quantity %s", (quantity) => {
    expect(errorsOf({ quantity })).toEqual({});
  });

  it("requires a price above zero but allows a zero fee", () => {
    expect(errorsOf({ price: "0" }).price).toBeDefined();
    expect(errorsOf({ fee: "0" })).toEqual({});
    expect(errorsOf({ fee: "" }).fee).toBeDefined();
    expect(errorsOf({ fee: "-1" }).fee).toBeDefined();
  });

  it("rejects a missing or future time", () => {
    expect(errorsOf({ executed_at: "" }).executed_at).toBeDefined();
    expect(errorsOf({ executed_at: toLocalInput(new Date(Date.now() + 3_600_000)) }).executed_at).toBeDefined();
  });
});
