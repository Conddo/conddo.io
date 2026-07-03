"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContinueWithGoogle } from "@/components/ui/ContinueWithGoogle";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";
import { registerStart } from "@/lib/api/account";
import { registerStartWithGoogle, hasGoogleClient } from "@/lib/api/google";
import { clearAccessToken } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const inputCls =
  "h-11 w-full rounded-md border border-white/10 bg-cinema-elev px-3.5 text-[15px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none";
const labelCls =
  "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65";

// Step 1 of the Onboarding v2 flow — friction-free account creation.
// No phone number, no OTP: users go straight to describing their business
// after this. Email verification is deferred to a post-onboarding link
// surfaced as a dashboard banner.
export default function CreateAccountStep() {
  const router = useRouter();
  const { update } = useOnboarding();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anyone landing here is starting a new session — strip any leftover
  // token so the public /auth/register/start call isn't poisoned with a
  // stale Bearer.
  useEffect(() => { clearAccessToken(); }, []);

  const onContinue = async () => {
    setError(null);
    if (!fullName.trim()) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    try {
      const { registrationId } = await registerStart({
        fullName: fullName.trim(),
        // Phone is still required by the /auth/register/start DTO; supply an
        // empty-safe placeholder. The BE ignores it under CONDDO_REQUIRE_OTP_VERIFY=false.
        phone: "+2340000000000",
        email: email.trim(),
        password,
      });
      update({ fullName, email, password, registrationId });
      const next = nextStep("create-account");
      if (next) router.push(hrefFor(next.slug));
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === "EMAIL_ALREADY_REGISTERED" || err.code === "USER_ALREADY_EXISTS")
      ) {
        setError(
          "That email already has a Conddo account. Sign in instead, or use a different email.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Couldn't create your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <header className="mb-8 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          Create your account
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          Free for 14 days. No credit card.
        </p>
      </header>

      <div className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className={labelCls}>Full name</label>
          <input
            className={inputCls}
            placeholder="Amaka Obi"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Business email</label>
          <input
            className={inputCls}
            type="email"
            placeholder="amaka@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input
              className={`${inputCls} pr-11`}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/65"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-1.5 text-[13px] text-white/45">Minimum 8 characters.</p>
        </div>
        <div>
          <label className={labelCls}>Confirm password</label>
          <input
            className={inputCls}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button onClick={onContinue} variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? "Creating account…" : "Create account"}
        </Button>

        {hasGoogleClient() && (
          <>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-border" />
              <span className="text-[12px] uppercase tracking-[0.08em] text-white/45">or</span>
              <span className="h-px flex-1 bg-neutral-border" />
            </div>
            <ContinueWithGoogle
              disabled={submitting}
              onCredential={async (idToken) => {
                setError(null);
                setSubmitting(true);
                try {
                  const { registrationId } = await registerStartWithGoogle({
                    idToken,
                    phone: "+2340000000000",
                  });
                  update({ registrationId });
                  const next = nextStep("create-account");
                  if (next) router.push(hrefFor(next.slug));
                } catch (err) {
                  if (
                    err instanceof ApiError &&
                    (err.code === "EMAIL_ALREADY_REGISTERED" || err.code === "USER_ALREADY_EXISTS")
                  ) {
                    setError("That Google email already has a Conddo account. Sign in instead.");
                  } else {
                    setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
              onError={(msg) => setError(msg)}
            />
          </>
        )}

        <p className="text-center text-[14px] text-white/65">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-white/45">
        By clicking &ldquo;Create account&rdquo;, you agree to our{" "}
        <a href="#" className="text-white/65 underline">Terms of Service</a> and{" "}
        <a href="#" className="text-white/65 underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
