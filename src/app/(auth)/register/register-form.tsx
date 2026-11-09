"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, PasswordField } from "@/components/auth/Field";
import { Alert, AuthHeading, Button, PasswordRules, PrintedEntries, printEntry, type PrintEntry } from "@/components/auth/ui";
import { VerifyEmailStep } from "@/components/auth/VerifyEmailStep";
import { register } from "@/features/auth/api";
import { errorMessage } from "@/lib/errors";
import { isEmail, passwordError, passwordProblems } from "@/lib/password";

// Register
type Errors = { email?: string; password?: string; confirm?: string };

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [entries, setEntries] = useState<PrintEntry[]>([]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problems = passwordProblems(password, email);
    const next: Errors = {
      email: !email.trim() ? "กรอกอีเมล" : !isEmail(email) ? "รูปแบบอีเมลไม่ถูกต้อง" : undefined,
      password: problems.length > 0 ? passwordError(password, email) : undefined,
      confirm: confirm !== password ? "รหัสผ่านทั้งสองช่องไม่ตรงกัน" : undefined,
    };
    setErrors(next);
    if (next.email || next.password || next.confirm) return;

    setPending(true);
    setError(null);
    try {
      const res = await register(email.trim(), password);
      setChallengeId(res.challenge_id);
      setEntries((list) => [...list, printEntry("REG", `OTP SENT  #${res.challenge_id.slice(0, 8).toUpperCase()}`)]);
      setStep("verify");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (step === "verify") {
    return (
      <>
        <VerifyEmailStep
          email={email.trim()}
          challengeId={challengeId}
          onBack={() => setStep("form")}
          onResent={(id) => setEntries((list) => [...list, printEntry("OTP", `RESENT  #${id.slice(0, 8).toUpperCase()}`)])}
          onVerified={() => router.push("/login?verified=1")}
        />
        <PrintedEntries entries={entries} />
      </>
    );
  }

  return (
    <>
      <AuthHeading title="สมัครสมาชิก">ขั้นที่ 1 จาก 2 · ตั้งอีเมลและรหัสผ่าน แล้วยืนยันอีเมลด้วยรหัส 6 หลัก</AuthHeading>
      <div className="grid gap-5">
        {error && <Alert>{error}</Alert>}
        <form onSubmit={submit} noValidate className="grid gap-5">
          <Field
            label="อีเมล"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <PasswordField
            label="รหัสผ่าน"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={<PasswordRules password={password} showFailures={!!errors.password} />}
            maxLength={32}
            required
          />
          <PasswordField
            label="ยืนยันรหัสผ่าน"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            maxLength={32}
            required
          />
          <Button type="submit" pending={pending} pendingLabel="กำลังสมัคร…">
            สมัครสมาชิก
          </Button>
        </form>
      </div>
      <p className="mt-8 text-base">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-semibold text-accent underline">
          เข้าสู่ระบบ
        </Link>
      </p>
      <PrintedEntries entries={entries} />
    </>
  );
}
