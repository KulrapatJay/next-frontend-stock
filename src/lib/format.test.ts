import { describe, expect, it } from "vitest";
import { formatMoney, formatPercent, formatQuantity, formatSignedMoney, formatSignedPercent, signOf } from "./format";

describe("formatMoney", () => {
  it.each([
    ["200.25", "200.25"],
    ["1", "1.00"],
    ["0", "0.00"],
    ["1234567.891", "1,234,567.89"],
    ["-1234.5", "-1,234.50"],
    ["0.125", "0.12"],
    ["0.135", "0.14"],
    ["2.675", "2.68"],
    ["123456789012345678.99", "123,456,789,012,345,678.99"],
  ])("formats %s as %s (round half even, exact)", (input, expected) => {
    expect(formatMoney(input)).toBe(expected);
  });

  it("returns the raw value when it is not a number", () => {
    expect(formatMoney("n/a")).toBe("n/a");
  });
});

describe("formatQuantity", () => {
  it.each([
    ["0.5", "0.5"],
    ["10", "10"],
    ["1000.0000000001", "1,000.0000000001"],
    ["1.2300", "1.23"],
    ["0", "0"],
    ["100", "100"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatQuantity(input)).toBe(expected);
  });
});

describe("formatPercent and formatSignedPercent", () => {
  it.each([
    ["8.5", "8.50%", "+8.50%"],
    ["31.1475409836065573770491803279", "31.15%", "+31.15%"],
    ["-12.345", "-12.34%", "-12.34%"],
    ["0", "0.00%", "0.00%"],
    ["-0.001", "0.00%", "0.00%"],
  ] as const)("%s shows %s and %s", (input, plain, signed) => {
    expect(formatPercent(input)).toBe(plain);
    expect(formatSignedPercent(input)).toBe(signed);
  });
});

describe("signOf and formatSignedMoney", () => {
  it.each([
    ["12.5", "positive", "+12.50"],
    ["-0.5", "negative", "-0.50"],
    ["0", "zero", "0.00"],
    ["-0.00", "zero", "0.00"],
    ["0.001", "positive", "0.00"],
    ["-0.001", "negative", "0.00"],
  ] as const)("%s is %s and shows %s", (input, sign, text) => {
    expect(signOf(input)).toBe(sign);
    expect(formatSignedMoney(input)).toBe(text);
  });
});
