"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, PasswordField } from "@/components/auth/Field";
import { OtpField } from "@/components/auth/OtpField";
import {
  Alert,
  AuthHeading,
  Button,
  PasswordRules,
  PrintedEntries,
  printEntry,
  useCountdown,
  type PrintEntry,
} from "@/components/auth/ui";
import { confirmPasswordReset, requestPasswordReset } from "@/features/auth/api";
import { ApiError } from "@/lib/api";
import { OTP_RESEND_SECONDS } from "@/lib/constants";
import { errorMessage } from "@/lib/errors";
import { isEmail, passwordError, passwordProblems } from "@/lib/password";

// Forgot password
type Errors = { email?: string; otp?: string; password?: string; confirm?: string };

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useCountdown(0);
  const [entries, setEntries] = useState<PrintEntry[]>([]);

  async function requestCode(): Promise<boolean> {
    try {
      const res = await requestPasswordReset(email.trim());
      setChallengeId(res.challenge_id);
      setCooldown(OTP_RESEND_SECONDS);
      setEntries((list) => [...list, printEntry("OTP", `RESET CODE SENT  #${res.challenge_id.slice(0, 8).toUpperCase()}`)]);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    }
  }

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    const emailError = !email.trim() ? "กรอกอีเมล" : !isEmail(email) ? "รูปแบบอีเมลไม่ถูกต้อง" : undefined;
    setErrors({ email: emailError });
    if (emailError) return;
    setPending(true);
    setError(null);
    if (await requestCode()) setStep("otp");
    setPending(false);
  }

  async function resend() {
    setResending(true);
    setError(null);
    setNotice(null);
    if (await requestCode()) {
      setOtp("");
      setNotice("ส่งรหัสใหม่แล้ว รหัสเดิมใช้ไม่ได้อีก");
    }
    setResending(false);
  }

  function submitOtp(e: FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: "กรอกรหัสให้ครบ 6 หลัก" });
      return;
    }
    setErrors({});
    setError(null);
    setNotice(null);
    setStep("password");
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    const problems = passwordProblems(password, email);
    const next: Errors = {
      password: problems.length > 0 ? passwordError(password, email) : undefined,
      confirm: confirm !== password ? "รหัสผ่านทั้งสองช่องไม่ตรงกัน" : undefined,
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await confirmPasswordReset(challengeId, otp, password);
      router.push("/login?reset=1");
    } catch (err) {
      // wrong code: back to the OTP step
      if (err instanceof ApiError && err.code === "invalid_reset") {
        setOtp("");
        setStep("otp");
      }
      setError(errorMessage(err));
      setPending(false);
    }
  }

  if (step === "email") {
    return (
      <>
        <AuthHeading title="ลืมรหัสผ่าน">กรอกอีเมลที่ใช้สมัคร เราจะส่งรหัส 6 หลักไปให้ใช้ตั้งรหัสผ่านใหม่</AuthHeading>
        <div className="grid gap-5">
          {error && <Alert>{error}</Alert>}
          <form onSubmit={submitEmail} noValidate className="grid gap-5">
            <Field
              label="อีเมล"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
            <Button type="submit" pending={pending} pendingLabel="กำลังส่งรหัส…">
              ส่งรหัส
            </Button>
          </form>
        </div>
        <p className="mt-8 text-base">
          นึกออกแล้ว?{" "}
          <Link href="/login" className="font-semibold text-accent underline">
            กลับไปเข้าสู่ระบบ
          </Link>
        </p>
        <PrintedEntries entries={entries} />
      </>
    );
  }

  if (step === "otp") {
    return (
      <>
        <AuthHeading title="กรอกรหัสยืนยัน">
          ถ้ามีบัญชีที่ใช้ <strong className="font-semibold text-ink">{email.trim()}</strong> เราได้ส่งรหัส 6 หลักไปแล้ว
          รหัสใช้ได้ 10 นาที กรอกผิดได้ไม่เกิน 5 ครั้ง
        </AuthHeading>
        <div className="grid gap-5">
          {error && <Alert>{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}
          <form onSubmit={submitOtp} noValidate className="grid gap-5">
            <OtpField label="รหัสจากอีเมล" value={otp} onChange={setOtp} error={errors.otp} autoFocus />
            <Button type="submit">ถัดไป</Button>
          </form>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <button type="button" onClick={() => setStep("email")} className="text-ink-muted underline hover:text-ink">
            เปลี่ยนอีเมล
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || resending}
            className="font-medium text-accent underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
          >
            {cooldown > 0 ? `ส่งรหัสใหม่ได้ใน ${cooldown} วินาที` : resending ? "กำลังส่ง…" : "ส่งรหัสใหม่"}
          </button>
        </div>
        <PrintedEntries entries={entries} />
      </>
    );
  }

  return (
    <>
      <AuthHeading title="ตั้งรหัสผ่านใหม่">ตั้งรหัสผ่านใหม่สำหรับ <strong className="font-semibold text-ink">{email.trim()}</strong></AuthHeading>
      <div className="grid gap-5">
        {error && <Alert>{error}</Alert>}
        <form onSubmit={submitPassword} noValidate className="grid gap-5">
          <PasswordField
            label="รหัสผ่านใหม่"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={<PasswordRules password={password} showFailures={!!errors.password} />}
            maxLength={32}
            autoFocus
            required
          />
          <PasswordField
            label="ยืนยันรหัสผ่านใหม่"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            maxLength={32}
            required
          />
          <p className="text-sm text-ink-muted">เมื่อเปลี่ยนรหัสผ่านแล้ว ทุกอุปกรณ์ที่ล็อกอินอยู่จะถูกออกจากระบบ</p>
          <Button type="submit" pending={pending} pendingLabel="กำลังบันทึก…">
            ตั้งรหัสผ่านใหม่
          </Button>
        </form>
      </div>
      <div className="mt-6 text-sm">
        <button type="button" onClick={() => setStep("otp")} className="text-ink-muted underline hover:text-ink">
          กลับไปแก้รหัสยืนยัน
        </button>
      </div>
      <PrintedEntries entries={entries} />
    </>
  );
}
