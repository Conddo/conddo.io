"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { registerComplete } from "@/lib/api/account";
import { brandApi } from "@/lib/api/brand";
import { mediaApi } from "@/lib/api/media";
import { hrefFor } from "@/lib/onboarding-steps";

// Step 6 — success screen. The /auth/register/complete call happens HERE
// (not on Review) so that every prior selection — modules, vibe, name —
// is captured before the tenant is provisioned server-side. If the call
// fails, the user can retry without losing state.
export default function ReadyStep() {
  const router = useRouter();
  const {
    registrationId,
    businessName,
    email,
    vertical,
    fullName,
    websiteVibe,
    logoFile,
    primaryColor,
    secondaryColor,
    planId,
    reset,
  } = useOnboarding();
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
        // Provisions the tenant + owner user + sites row + credit account
        // + fires TenantActivatedEvent. Sets our access token as a side
        // effect so subsequent /brand + /media calls are authenticated.
        await registerComplete({
          registrationId,
          businessName: businessName.trim() || "My business",
          businessType: vertical ?? null,
          planId: planId ?? null,
          websiteVibe: websiteVibe?.trim() || null,
        });

        // Best-effort brand apply. Failures here don't roll back the
        // tenant — the owner can redo it from Settings → Brand. We batch
        // logo upload + colour patch so the site's first render already
        // carries their brand.
        let logoUrl: string | null = null;
        if (logoFile) {
          try {
            const res = await mediaApi.upload(logoFile, "logo");
            logoUrl = res.data.url;
          } catch {
            /* swallow — brand save still runs with colours only */
          }
        }
        try {
          await brandApi.patch({
            logoUrl,
            primaryColor,
            secondaryColor,
          });
        } catch {
          /* swallow — owner can retry from Settings → Brand */
        }

        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't finish setup. Please try again.");
        setStatus("error");
      }
    })();
  }, [registrationId, businessName, vertical, websiteVibe, planId, logoFile, primaryColor, secondaryColor, router]);

  const firstName = fullName.trim().split(/\s+/)[0];
  const greeting = firstName ? `You're all set, ${firstName}.` : "You're all set.";

  const goToDashboard = () => {
    // Wizard state gets stale once the tenant exists; a future signup on
    // the same browser deserves a clean slate.
    reset();
    router.push("/dashboard");
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
        <span className="font-medium text-white">{businessName.trim() || "Your business"}</span> is ready.
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

      <Button onClick={goToDashboard} variant="primary" size="lg" className="mt-6 w-full">
        Go to my dashboard
      </Button>
    </div>
  );
}
