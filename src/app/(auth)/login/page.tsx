import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm, LoginNotice } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ · Stock Portfolio" };

export default function LoginPage() {
  return (
    <LoginForm
      notice={
        <Suspense>
          <LoginNotice part="alert" />
        </Suspense>
      }
      print={
        <Suspense>
          <LoginNotice part="print" />
        </Suspense>
      }
    />
  );
}
