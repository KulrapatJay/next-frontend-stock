"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, PasswordField } from "@/components/ui/Field";
import { login, requestEmailVerification } from "@/features/auth/api";
import { AuthHeading } from "@/features/auth/components/AuthHeading";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { PrintedEntries, printEntry, type PrintEntry } from "@/features/auth/components/PrintedEntries";
import { VerifyEmailStep } from "@/features/auth/components/VerifyEmailStep";
import { ApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { isEmail } from "@/lib/validation";

// Login
function safeRedirect(): string {
  const from = new URLSearchParams(window.location.search).get("from");
  return from && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard";
}

export function LoginForm({ notice: urlNotice, print }: { notice: ReactNode; print: ReactNode }) {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [entries, setEntries] = useState<PrintEntry[]>([]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errors = {
      email: !email.trim() ? "กรอกอีเมล" : !isEmail(email) ? "รูปแบบอีเมลไม่ถูกต้อง" : undefined,
      password: !password ? "กรอกรหัสผ่าน" : undefined,
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setPending(true);
    setError(null);
    setNotice(null);
    setUnverified(false);
    try {
      await login(email.trim(), password);
      // Next keeps this page cached after navigating away: do not leave credentials behind
      setEmail("");
      setPassword("");
      setPending(false);
      router.replace(safeRedirect());
    } catch (err) {
      if (err instanceof ApiError && err.code === "email_not_verified") setUnverified(true);
      else setError(errorMessage(err));
      setPending(false);
    }
  }

  async function sendVerification() {
    setSending(true);
    setError(null);
    try {
      const res = await requestEmailVerification(email.trim());
      setChallengeId(res.challenge_id);
      setStep("verify");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (step === "verify") {
    return (
      <VerifyEmailStep
        email={email.trim()}
        challengeId={challengeId}
        onBack={() => setStep("login")}
        onVerified={() => {
          setStep("login");
          setUnverified(false);
          setNotice("ยืนยันอีเมลแล้ว เข้าสู่ระบบได้เลย");
          setEntries((list) => [...list, printEntry("VRF", "EMAIL VERIFIED")]);
        }}
      />
    );
  }

  return (
    <>
      <AuthHeading title="เข้าสู่ระบบ">เปิดบันทึกการซื้อขายหุ้นของคุณ</AuthHeading>
      <div className="grid gap-5">
        {!notice && urlNotice}
        {notice && <Alert tone="success">{notice}</Alert>}
        {error && <Alert>{error}</Alert>}
        {unverified && (
          <Alert>
            <p>อีเมลนี้ยังไม่ได้ยืนยัน ต้องยืนยันด้วยรหัส 6 หลักก่อนเข้าสู่ระบบ</p>
            <button
              type="button"
              onClick={sendVerification}
              disabled={sending}
              className="mt-2 font-semibold underline disabled:opacity-60"
            >
              {sending ? "กำลังส่งรหัส…" : "ส่งรหัสยืนยันไปที่อีเมล"}
            </button>
          </Alert>
        )}
        <form onSubmit={submit} noValidate className="grid gap-5">
          <Field
            label="อีเมล"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />
          <div className="grid gap-2">
            <PasswordField
              label="รหัสผ่าน"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              required
            />
            <Link href="/forgot-password" className="justify-self-end text-sm font-medium text-accent underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <Button type="submit" pending={pending} pendingLabel="กำลังเข้าสู่ระบบ…">
            เข้าสู่ระบบ
          </Button>
        </form>
        <div className="flex items-center gap-3 text-sm text-ink-muted" aria-hidden>
          <span className="h-px flex-1 bg-rule" />
          หรือ
          <span className="h-px flex-1 bg-rule" />
        </div>
        <GoogleButton onError={setError} />
      </div>
      <p className="mt-8 text-base">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-semibold text-accent underline">
          สมัครสมาชิก
        </Link>
      </p>
      {entries.length > 0 ? <PrintedEntries entries={entries} /> : print}
    </>
  );
}

const NOTICES: Record<string, { tone: "error" | "success"; text: string; print?: [string, string] }> = {
  verified: { tone: "success", text: "ยืนยันอีเมลแล้ว เข้าสู่ระบบได้เลย", print: ["VRF", "EMAIL VERIFIED"] },
  reset: {
    tone: "success",
    text: "ตั้งรหัสผ่านใหม่แล้ว เข้าสู่ระบบด้วยรหัสใหม่ได้เลย",
    print: ["RST", "PASSWORD CHANGED"],
  },
  failed: { tone: "error", text: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ อาจยกเลิกไปหรือเกิน 10 นาที ลองใหม่อีกครั้ง" },
  link_required: {
    tone: "error",
    text: "อีเมลนี้มีบัญชีที่ใช้รหัสผ่านอยู่แล้ว เข้าสู่ระบบด้วยรหัสผ่านก่อน แล้วจึงเชื่อมบัญชี Google ภายหลัง",
  },
};

export function LoginNotice({ part }: { part: "alert" | "print" }) {
  const params = useSearchParams();
  const router = useRouter();
  const google = params.get("google");
  const key = params.get("verified") ? "verified" : params.get("reset") ? "reset" : google;

  useEffect(() => {
    if (part === "alert" && (google === "success" || google === "linked")) router.replace("/dashboard");
  }, [part, google, router]);

  const notice = key ? NOTICES[key] : undefined;
  if (!notice) return null;
  if (part === "print") return notice.print ? <PrintedEntries entries={[printEntry(...notice.print)]} /> : null;
  return <Alert tone={notice.tone}>{notice.text}</Alert>;
}
