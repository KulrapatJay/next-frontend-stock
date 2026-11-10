import { describe, expect, it } from "vitest";
import { isEmail } from "./validation";

describe("isEmail", () => {
  it("accepts an address with surrounding spaces", () => {
    expect(isEmail("  user@example.com ")).toBe(true);
  });

  it.each(["", "user", "user@", "user@example", "us er@example.com", "user@@example.com"])("rejects %j", (value) => {
    expect(isEmail(value)).toBe(false);
  });
});
