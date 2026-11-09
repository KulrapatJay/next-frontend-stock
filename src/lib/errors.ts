import { ApiError } from "@/lib/api";

// Thai error messages from API error codes
const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  email_not_verified: "ยังไม่ได้ยืนยันอีเมล",
  invalid_verification: "รหัสไม่ถูกต้อง หมดอายุ หรือถูกใช้ไปแล้ว ลองกรอกใหม่หรือขอรหัสใหม่",
  invalid_reset: "รหัสไม่ถูกต้อง หมดอายุ หรือถูกใช้ไปแล้ว ลองกรอกใหม่หรือขอรหัสใหม่",
  invalid_input: "ข้อมูลบางช่องไม่ถูกต้อง",
  unauthenticated: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง",
  csrf_failed: "ตรวจสอบคำขอไม่ผ่าน ลองรีเฟรชหน้าแล้วทำใหม่อีกครั้ง",
  feature_disabled: "ฟีเจอร์นี้ยังไม่เปิดใช้งาน",
  dependency_unavailable: "บริการภายนอกขัดข้อง ลองใหม่ภายหลัง",
  server_busy: "ระบบกำลังทำงานหนัก ลองใหม่อีกครั้ง",
};

export const PASSWORD_DETAIL_MESSAGES: Record<string, string> = {
  password_too_short: "รหัสผ่านต้องมีอย่างน้อย 6 ตัว",
  password_too_long: "รหัสผ่านต้องไม่เกิน 32 ตัว",
  password_contains_space: "รหัสผ่านต้องไม่มีช่องว่าง",
  password_non_ascii: "รหัสผ่านใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และสัญลักษณ์",
  password_missing_lowercase: "ต้องมีตัวพิมพ์เล็ก (a–z)",
  password_missing_uppercase: "ต้องมีตัวพิมพ์ใหญ่ (A–Z)",
  password_missing_special: "ต้องมีอักขระพิเศษ เช่น ! @ # $",
  password_contains_email: "รหัสผ่านต้องไม่มีอีเมลของคุณอยู่ข้างใน",
  password_too_common: "รหัสผ่านนี้คาดเดาง่ายเกินไป ลองตั้งใหม่",
};

export function errorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
  }
  if (err.code === "rate_limited") {
    return err.retryAfter
      ? `ลองบ่อยเกินไป รออีก ${err.retryAfter} วินาทีแล้วลองใหม่`
      : "ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่";
  }
  if (err.code === "invalid_input" && err.details.length > 0) {
    return err.details.map((d) => PASSWORD_DETAIL_MESSAGES[d] ?? "ข้อมูลไม่ถูกต้อง").join(" · ");
  }
  const known = CODE_MESSAGES[err.code];
  if (known) return known;
  return err.requestId
    ? `เกิดข้อผิดพลาด ลองใหม่อีกครั้ง (รหัสอ้างอิง ${err.requestId})`
    : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
}
