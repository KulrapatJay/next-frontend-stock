import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน · Stock Portfolio" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
