import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "สมัครสมาชิก · Stock Portfolio" };

export default function RegisterPage() {
  return <RegisterForm />;
}
