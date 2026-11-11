import type { PortfolioInput } from "@/types";

// Portfolio input rules (mirror of backend validation)
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 1000;

export type PortfolioErrors = { name?: string; description?: string };

const length = (value: string) => [...value].length;

export function validatePortfolio(input: PortfolioInput): PortfolioErrors {
  const errors: PortfolioErrors = {};
  const name = input.name.trim();
  if (!name) errors.name = "กรอกชื่อพอร์ต";
  else if (length(name) > NAME_MAX) errors.name = `ชื่อพอร์ตต้องไม่เกิน ${NAME_MAX} ตัวอักษร`;
  if (length(input.description) > DESCRIPTION_MAX) {
    errors.description = `คำอธิบายต้องไม่เกิน ${DESCRIPTION_MAX} ตัวอักษร`;
  }
  return errors;
}
