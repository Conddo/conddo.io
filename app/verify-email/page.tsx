"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { verifyEmail, resendVerificationEmail } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";

type Status = "verifying" | "success" | "expired" | "invalid" | "error";

// Landing target of the emailed verification link. Reads ?token=xxx, POSTs
// once on mount, then routes to the dashboard on success (banner will
// disappear automatically once /me refetches). On expiry/invalid, offers a
// resend if the user is signed in (they land here from their own inbox so
// usually they are).
function VerifyEmailBody() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const token = params.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }

    (async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        // Give the user a beat to read the confirmation, then continue.
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err) {
        if (err instanceof ApiError && err.code === "EMAIL_VERIFICATION_EXPIRED") {
          setStatus("expired");
        } else if (err instanceof ApiError && err.code === "EMAIL_VERIFICATION_INVALID") {
          setStatus("invalid");
        } else {
          setStatus("error");
        }
      }
    })();
  }, [params, router]);

  const onResend = async () => {
    if (resendStatus === "sending") return;
    setResendStatus("sending");
    try {
      await resendVerificationEmail();
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  const signedIn = typeof window !== "undefined" && !!getAccessToken();

  return (
    <div className="min-h-screen bg-cinema-base px-6 py-12 text-white">
      <div className="mx-auto max-w-md text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-6 h-14 w-14">
              <div className="h-full w-full animate-spin rounded-full border-2 border-white/10 border-t-primary" />
            </div>
            <p className="text-[17px] text-white/85">Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary-light">
              <Check size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-[28px] leading-tight tracking-[-0.02em]">Email verified</h1>
            <p className="mt-2 text-[15px] text-white/65">
              Taking you to your dashboard…
            </p>
          </>
        )}

        {(status === "expired" || status === "invalid" || status === "error") && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
              <AlertCircle size={28} />
            </div>
            <h1 className="text-[24px] leading-tight tracking-[-0.02em]">
              {status === "expired"
                ? "This link has expired"
                : status === "invalid"
                  ? "This link isn't valid"
                  : "Something went wrong"}
            </h1>
            <p className="mt-2 text-[15px] text-white/65">
              {status === "error"
                ? "We couldn't reach the server. Please try again in a moment."
                : "It may have already been used, or a newer link is now the active one. You can send yourself a fresh one below."}
            </p>

            {signedIn ? (
              <div className="mt-6">
                {resendStatus === "sent" ? (
                  <p className="text-[14px] text-primary-light">
                    New link on the way. Check your inbox.
                  </p>
                ) : (
                  <Button
                    onClick={onResend}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={resendStatus === "sending"}
                  >
                    {resendStatus === "sending" ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    {resendStatus === "sending" ? "Sending…" : "Send me a new link"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-[14px] text-white/60">
                  Sign in and you&apos;ll see a &ldquo;Resend link&rdquo; button in the top banner.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  variant="primary"
                  size="lg"
                  className="mt-4 w-full"
                >
                  Sign in
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cinema-base" />}>
      <VerifyEmailBody />
    </Suspense>
  );
}
