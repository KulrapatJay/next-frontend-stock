import { describe, expect, it } from "vitest";
import { PASSWORD_RULES, passwordProblems } from "./password";

const failing = (password: string) => PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.id);

describe("PASSWORD_RULES", () => {
  it("passes a password that meets every rule", () => {
    expect(failing("Zq9!kVx1")).toEqual([]);
  });

  it.each([
    ["Aa!12", ["length"]],
    [`Aa!${"x".repeat(30)}`, ["length"]],
    ["AAAA!1", ["lower"]],
    ["aaaa!1", ["upper"]],
    ["Aaaa11", ["special"]],
    ["Aa! 123", ["ascii"]],
    ["Aa!รหัสผ่าน", ["ascii"]],
  ])("flags %j as %j", (password, ids) => {
    expect(failing(password)).toEqual(ids);
  });

  it("accepts the 6 and 32 character boundaries", () => {
    expect(failing("Aa!123")).toEqual([]);
    expect(failing(`Aa!${"x".repeat(29)}`)).toEqual([]);
  });
});

describe("passwordProblems", () => {
  it("returns nothing for a valid password", () => {
    expect(passwordProblems("Zq9!kVx1", "user@example.com")).toEqual([]);
  });

  it("reports a password that contains the email, ignoring case", () => {
    expect(passwordProblems("X!User@Example.com", " user@example.com ")).toHaveLength(1);
  });

  it("skips the email check when no email is given", () => {
    expect(passwordProblems("Zq9!kVx1", "")).toEqual([]);
  });
});
