"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";
import { registerVerify, registerResend } from "@/lib/api/account";

const CODE_LENGTH = 4;

// Built from the Stitch "OTP Verification" screen. The code is emailed (Resend
// free path), so this verifies the account email. Sub-step of step 1.
export default function VerifyEmailStep() {
  const router = useRouter();
  const { email, registrationId, resendCooldownSeconds, update } = useOnboarding();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(resendCooldownSeconds || 30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onVerify = async () => {
    setError(null);
    const code = digits.join("");
    if (code.length < CODE_LENGTH) return setError("Enter the full code.");
    if (!registrationId) return setError("Your session expired. Please start over.");
    setSubmitting(true);
    try {
      await registerVerify({ registrationId, code });
      const next = nextStep("verify-email");
      if (next) router.push(hrefFor(next.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Check it and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!registrationId) return setError("Your session expired. Please start over.");
    setError(null);
    try {
      const { resendCooldownSeconds: cd } = await registerResend(registrationId);
      update({ resendCooldownSeconds: cd });
      setSeconds(cd || 30);
      setDigits(Array(CODE_LENGTH).fill(""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code. Please wait a moment.");
    }
  };

  const goBack = () => {
    const prev = prevStep("verify-email");
    if (prev) router.push(hrefFor(prev.slug));
  };

  const masked = email || "your email";
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="w-full max-w-md rounded-xl border border-white/[0.06] bg-cinema-elev p-8">
      <header className="mb-7 text-center">
        <h1 className="text-[24px] leading-tight tracking-[-0.01em] md:text-[26px]">
          Verify your account
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-white/65">
          We&apos;ve sent a 4-digit code to{" "}
          <span className="font-medium text-white">{masked}</span>. Enter it below to continue.
        </p>
      </header>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="mb-6 flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-16 w-14 rounded-lg border border-white/10 bg-cinema-elev text-center font-mono text-[24px] text-white focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        ))}
      </div>

      <p className="mb-5 text-center text-[13px] text-white/45">
        {seconds > 0 ? (
          <>Resend code in {mm}:{ss}</>
        ) : (
          <button className="font-medium text-primary hover:underline" onClick={onResend}>
            Resend code
          </button>
        )}
      </p>

      <Button onClick={onVerify} variant="primary" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
        {submitting ? "Verifying…" : "Verify and continue"}
      </Button>

      <button
        onClick={goBack}
        className="mt-4 block w-full text-center text-[14px] text-white/65 hover:text-white"
      >
        Change my details
      </button>

      <p className="mt-6 text-center text-[13px] text-white/45">
        Need help?{" "}
        <a href="#" className="font-medium text-primary hover:underline">Contact support</a>
      </p>
    </div>
  );
}
