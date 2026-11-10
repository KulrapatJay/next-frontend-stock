"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { confirmEmailVerification, requestEmailVerification } from "@/features/auth/api";
import { OTP_RESEND_SECONDS } from "@/lib/constants";
import { useCountdown } from "@/hooks/useCountdown";
import { errorMessage } from "@/lib/errors";
import { AuthHeading } from "./AuthHeading";
import { OtpField } from "./OtpField";

// Email verification (OTP)
type Props = {
  email: string;
  challengeId: string;
  onVerified: () => void;
  onBack: () => void;
  onResent?: (challengeId: string) => void;
};

export function VerifyEmailStep({ email, challengeId: initialChallenge, onVerified, onBack, onResent }: Props) {
  const [challengeId, setChallengeId] = useState(initialChallenge);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useCountdown(OTP_RESEND_SECONDS);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("กรอกรหัสให้ครบ 6 หลัก");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await confirmEmailVerification(challengeId, otp);
      onVerified();
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const res = await requestEmailVerification(email);
      setChallengeId(res.challenge_id);
      setOtp("");
      setCooldown(OTP_RESEND_SECONDS);
      setNotice("ส่งรหัสใหม่แล้ว รหัสเดิมใช้ไม่ได้อีก");
      onResent?.(res.challenge_id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <AuthHeading title="ยืนยันอีเมล">
        ถ้าอีเมลนี้รับข้อความได้ เราได้ส่งรหัส 6 หลักไปที่ <strong className="font-semibold text-ink">{email}</strong>{" "}
        แล้ว รหัสใช้ได้ 10 นาที
      </AuthHeading>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <OtpField label="รหัสยืนยัน" value={otp} onChange={setOtp} error={error} autoFocus />
        {notice && <Alert tone="success">{notice}</Alert>}
        <Button type="submit" pending={pending} pendingLabel="กำลังยืนยัน…">
          ยืนยันอีเมล
        </Button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" onClick={onBack} className="text-ink-muted underline hover:text-ink">
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
    </>
  );
}
