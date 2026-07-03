"use client";

import { useState } from "react";
import { Mail, Loader2, X } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery, resendVerificationEmail, type Me } from "@/lib/api/account";

/**
 * Persistent, non-intrusive banner shown at the top of every authenticated
 * page while the signed-in user's email is unverified. Renders nothing when
 * the user is verified, or while /me is still loading (avoids flash on
 * navigation).
 *
 * Copy per the Onboarding v2 spec — the tone is calm, the ask is small:
 * verify to unlock publishing, payments, automations.
 */
export function VerifyEmailBanner() {
  const { data: me } = useApiQuery<Me>(meQuery);
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!me || me.user.emailVerified) return null;
  if (collapsed) return null;

  const onResend = async () => {
    if (status === "sending") return;
    setStatus("sending");
    try {
      await resendVerificationEmail();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-[13px] md:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <Mail size={16} className="shrink-0 text-amber-300" />
        <p className="min-w-0 flex-1 text-amber-100">
          <span className="font-medium text-amber-50">Verify your email</span>{" "}
          <span className="text-amber-100/85">
            to unlock publishing, payments, and automations. Check your inbox for a link from Conddo.
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {status === "sent" ? (
            <span className="text-[12px] text-amber-200">Sent — check your inbox.</span>
          ) : status === "error" ? (
            <button
              onClick={onResend}
              className="text-[12px] font-medium text-amber-200 underline hover:text-amber-100"
            >
              Try again
            </button>
          ) : (
            <button
              onClick={onResend}
              disabled={status === "sending"}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-200 underline hover:text-amber-100 disabled:opacity-60"
            >
              {status === "sending" && <Loader2 size={12} className="animate-spin" />}
              Resend link
            </button>
          )}
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Dismiss until next reload"
            className="text-amber-200/60 hover:text-amber-100"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
