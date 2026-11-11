import Big from "big.js";

// Display formatting (decimal strings are never converted to number)
const HALF_EVEN = 2;

function group(fixed: string): string {
  const [whole, fraction] = fixed.split(".");
  const sign = whole.startsWith("-") && /[1-9]/.test(fixed) ? "-" : "";
  const digits = whole.replace("-", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${digits}${fraction ? `.${fraction}` : ""}`;
}

export function formatMoney(value: string): string {
  try {
    return group(new Big(value).toFixed(2, HALF_EVEN));
  } catch {
    return value;
  }
}

export function formatQuantity(value: string): string {
  try {
    const fixed = new Big(value).toFixed(10, HALF_EVEN);
    return group(fixed.replace(/\.?0+$/, ""));
  } catch {
    return value;
  }
}

// "positive" | "negative" | "zero" of a decimal string, for colouring only
export function signOf(value: string): "positive" | "negative" | "zero" {
  if (!/[1-9]/.test(value)) return "zero";
  return value.trim().startsWith("-") ? "negative" : "positive";
}

export function formatSignedMoney(value: string): string {
  const text = formatMoney(value);
  return signOf(text) === "positive" ? `+${text}` : text;
}

// Percent values arrive already in percent ("8.5" is 8.5%)
export function formatPercent(value: string): string {
  return `${formatMoney(value)}%`;
}

export function formatSignedPercent(value: string): string {
  const text = formatPercent(value);
  return signOf(text) === "positive" ? `+${text}` : text;
}

const dateTimeFormat = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" });

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormat.format(date);
}

const dateFormat = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" });

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}
