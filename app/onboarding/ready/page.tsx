"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, Mail, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { registerComplete } from "@/lib/api/account";
import { hrefFor } from "@/lib/onboarding-steps";

// Step 6 — success screen. The /auth/register/complete call happens HERE
// (not on Review) so that every prior selection — modules, vibe, name —
// is captured before the tenant is provisioned server-side. If the call
// fails, the user can retry without losing state.
export default function ReadyStep() {
  const router = useRouter();
  const { registrationId, businessName, email, vertical, modules, fullName, websiteVibe, reset } =
    useOnboarding();
  const [status, setStatus] = useState<"creating" | "ready" | "error">("creating");
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!registrationId) {
      router.replace(hrefFor("create-account"));
      return;
    }

    (async () => {
      try {
        await registerComplete({
          registrationId,
          businessName: businessName.trim() || "My business",
          businessType: vertical ?? null,
          // Plan is picked post-onboarding when the owner hits a billing
          // gate. Free-tier during trial.
          planId: null,
          // Feeds the BE-side WebsiteGenerationService that seeds the
          // managed site's draft. Blank = generator uses vertical defaults.
          websiteVibe: websiteVibe?.trim() || null,
        });
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't finish setup. Please try again.");
        setStatus("error");
      }
    })();
  }, [registrationId, businessName, vertical, websiteVibe, router]);

  const enabledCount = modules.filter((m) => m.enabled).length;
  const firstName = fullName.trim().split(/\s+/)[0];
  const greeting = firstName ? `You're all set, ${firstName}.` : "You're all set.";

  const goToDashboard = () => {
    // Wizard state gets stale once the tenant exists; a future signup on
    // the same browser deserves a clean slate.
    reset();
    router.push("/dashboard");
  };

  const goToBrand = () => {
    reset();
    router.push("/settings/brand");
  };

  const retry = () => {
    setError(null);
    setStatus("creating");
    startedRef.current = false;
  };

  if (status === "creating") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 h-14 w-14">
          <div className="h-full w-full animate-spin rounded-full border-2 border-white/10 border-t-primary" />
        </div>
        <p className="text-[17px] text-white/85">Finishing up your setup…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-left text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
        <Button onClick={retry} variant="primary" size="lg" className="w-full">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary-light">
        <Check size={28} strokeWidth={2.5} />
      </div>
      <h1 className="text-[28px] leading-tight tracking-[-0.02em] text-white md:text-[32px]">
        {greeting}
      </h1>
      <p className="mt-2 text-[15px] text-white/65">
        <span className="font-medium text-white">{businessName.trim() || "Your business"}</span> is ready. {enabledCount} tools active.
      </p>

      <div className="mt-6 rounded-xl border border-white/[0.08] bg-cinema-elev p-4 text-left">
        <div className="flex items-start gap-3">
          <Mail size={20} className="mt-0.5 shrink-0 text-primary-light" />
          <div>
            <p className="text-[14px] font-medium text-white">
              Verify your email to unlock everything
            </p>
            <p className="mt-1 text-[13px] text-white/60">
              We&apos;ve sent a link to <span className="text-white">{email}</span>. You can explore and configure now — publishing and payments unlock once you verify.
            </p>
          </div>
        </div>
      </div>

      {/* Brand-setup nudge — the site renderer already reads Settings →
          Brand live, so setting logo + colours now means the tenant's
          first visitor sees a properly branded site. Optional; the
          primary CTA still goes straight to the dashboard for owners
          who just want to explore first. */}
      <button
        onClick={goToBrand}
        className="mt-6 flex w-full items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.10]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
          <Palette size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium text-white">
            Set your logo &amp; brand colours
          </span>
          <span className="block text-[12.5px] text-white/60">
            Takes 30 seconds. Your site updates instantly.
          </span>
        </span>
        <ArrowRight size={15} className="shrink-0 text-white/50" />
      </button>

      <Button onClick={goToDashboard} variant="primary" size="lg" className="mt-3 w-full">
        Go to my dashboard
      </Button>
    </div>
  );
}
