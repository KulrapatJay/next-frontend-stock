// Password rules (mirror of backend validation)
export type PasswordRule = { id: string; label: string; test: (password: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "ยาว 6–32 ตัว", test: (p) => p.length >= 6 && p.length <= 32 },
  { id: "lower", label: "มีตัวพิมพ์เล็ก (a–z)", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "มีตัวพิมพ์ใหญ่ (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "special", label: "มีอักขระพิเศษ เช่น ! @ # $", test: (p) => /[!-/:-@[-`{-~]/.test(p) },
  {
    id: "ascii",
    label: "ใช้ภาษาอังกฤษ ตัวเลข สัญลักษณ์ และไม่มีช่องว่าง",
    test: (p) => p.length > 0 && /^[\x21-\x7E]+$/.test(p),
  },
];

export function passwordProblems(password: string, email: string): string[] {
  const problems = PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
  const local = email.trim().toLowerCase();
  if (local && password.toLowerCase().includes(local)) {
    problems.push("ต้องไม่มีอีเมลของคุณอยู่ในรหัสผ่าน");
  }
  return problems;
}

export function passwordError(password: string, email: string): string {
  const containsEmail = PASSWORD_RULES.every((rule) => rule.test(password));
  return containsEmail && email.trim() ? "ต้องไม่มีอีเมลของคุณอยู่ในรหัสผ่าน" : "รหัสผ่านยังไม่ครบเงื่อนไขด้านล่าง";
}
