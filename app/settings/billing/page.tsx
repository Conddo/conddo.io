"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, Sparkles, Info } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import {
  subscriptionsApi,
  type BillingCycle,
  type PlanId,
  type SubscriptionStatus,
} from "@/lib/api/subscriptions";
import { meQuery } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { openPaystackInline, paystackInlineAvailable } from "@/lib/paystack-inline";

// Catalog mirrors the marketing pricing page (Pricing v2 / V67). Source of
// truth at run time is /billing/plans; this static copy lets the page render
// fully before that request lands and gives a compile-time home for the
// price ladder we display.
const PLAN_CATALOG: {
  id: PlanId;
  name: string;
  blurb: string;
  monthly: number;
  quarterly: number;
  yearly: number;
  requiresAcademicEmail?: boolean;
}[] = [
  { id: "free",    name: "Free",    blurb: "Website + basic dashboard.",         monthly: 0,      quarterly: 0,       yearly: 0 },
  { id: "student", name: "Student", blurb: "For side-hustlers in school.",       monthly: 3_000,  quarterly: 7_650,   yearly: 25_200, requiresAcademicEmail: true },
  { id: "starter", name: "Starter", blurb: "Run your business online.",          monthly: 5_000,  quarterly: 12_750,  yearly: 42_000 },
  { id: "growth",  name: "Growth",  blurb: "Automate + market at scale.",        monthly: 15_000, quarterly: 38_250,  yearly: 126_000 },
  { id: "pro",     name: "Pro",     blurb: "Multi-location + advanced ops.",     monthly: 30_000, quarterly: 76_500,  yearly: 252_000 },
];

const statusChip: Record<SubscriptionStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  trialing: { tone: "warning", label: "Trial" },
  grace: { tone: "warning", label: "Grace period" },
  expired: { tone: "danger", label: "Expired" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" });
}

export default function BillingSettings() {
  const toast = useToast();
  const sub = useApiQuery(subscriptionsApi.current);
  const meQ = useApiQuery(meQuery);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  // Cycle the picker cards render prices for. Independent from the tenant's
  // CURRENT sub cycle (which we treat as read-only for display below) so
  // the user can price-shop yearly before committing.
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");

  const data = sub.data;
  const subError = sub.error;
  const isMissingSubscription = subError instanceof ApiError && (
    subError.status === 404 ||
    /no active subscription/i.test(subError.message)
  );
  const isHardError = subError && !isMissingSubscription;

  const currentPlan = data?.planId ?? null;

  async function selectPlan(targetId: PlanId) {
    if (targetId === currentPlan) return;
    setUpgrading(targetId);

    let checkout: { authorizationUrl: string; reference: string; accessCode?: string };
    try {
      const { data } = await subscriptionsApi.checkout({
        planId: targetId,
        billingCycle: selectedCycle,
      });
      checkout = data;
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "STUDENT_VERIFICATION_REQUIRED") {
        // BE gate — this account's email doesn't end in an academic suffix.
        // Surface the exact reason so the user knows the fix is "use your
        // school email, not the workaround of a personal one".
        toast.error(
          "Student plan needs an academic email",
          "Sign in with your .edu / .edu.ng / .ac.uk email to switch to Student.",
        );
      } else if (apiErr?.status === 503) {
        toast.error(
          "Paystack isn't set up yet",
          "Ops needs to add PAYSTACK_SECRET_KEY on the backend before checkout works.",
        );
      } else {
        toast.error(
          "Couldn't start checkout",
          apiErr?.message ?? "Please try again.",
        );
      }
      setUpgrading(null);
      return;
    }

    // Prefer Paystack Inline (modal on our page) when the SDK is loaded
    // and we have the public key + tenant email. Falls back to the BE's
    // hosted-checkout URL if any prerequisite is missing — same user value,
    // worse UX but never broken.
    const targetPlan = PLAN_CATALOG.find((p) => p.id === targetId);
    const email = meQ.data?.user?.email;
    const cyclePrice = targetPlan
      ? targetPlan[selectedCycle]
      : 0;
    const amountKobo = cyclePrice > 0 ? cyclePrice * 100 : null;
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (paystackInlineAvailable() && publicKey && email && amountKobo) {
      try {
        openPaystackInline({
          key: publicKey,
          email,
          amount: amountKobo,
          ref: checkout.reference,
          metadata: { planId: targetId, billingCycle: selectedCycle },
          callback: async (response) => {
            // Modal closes immediately on success — verify with BE and
            // refresh the subscription state so the page updates inline.
            try {
              const { data: v } = await subscriptionsApi.verify(response.reference);
              if (v.status === "success") {
                toast.success(
                  "Subscription activated",
                  `You're on the ${v.subscription?.planDisplayName ?? targetPlan?.name ?? "new"} plan.`,
                );
              } else if (v.status === "pending") {
                toast.success(
                  "Payment received — confirming with Paystack",
                  "Your subscription will activate shortly.",
                );
              } else {
                toast.error(
                  "Payment didn't complete",
                  v.failureReason ?? "Try again or pick a different plan.",
                );
              }
            } catch {
              toast.toast({
                tone: "info",
                title: "Payment sent — verifying",
                description: "Refresh in a moment to see your updated plan.",
              });
            } finally {
              sub.refetch();
              setUpgrading(null);
            }
          },
          onClose: () => {
            // User dismissed the modal without paying. No charge happened
            // and no FE state to roll back — just clear the spinner.
            toast.toast({
              tone: "info",
              title: "Payment cancelled",
              description: "No charges were made — pick a plan again whenever you're ready.",
            });
            setUpgrading(null);
          },
        });
      } catch {
        // SDK loaded but threw — fall back to the redirect path so the
        // user can still complete payment.
        toast.toast({
          tone: "info",
          title: "Opening Paystack",
          description: "Falling back to the hosted checkout page.",
        });
        window.location.href = checkout.authorizationUrl;
      }
      return;
    }

    // Fallback path — redirect to the BE-generated hosted-checkout URL.
    // Spinner stays through the navigate (no flicker back to idle).
    toast.success("Redirecting to Paystack…", "Complete payment to activate your plan.");
    window.location.href = checkout.authorizationUrl;
  }

  return (
    <SettingsShell active="billing" title="Subscription & Billing" description="Manage your plan, payment method, and invoices.">
      <div className="space-y-8">
        {/* Hard error — only shown for real network/server failures, not
            "this tenant has no sub yet" (which is a normal first-visit). */}
        {isHardError && (
          <div className="rounded-xl border border-danger/30 bg-rose-500/[0.06] px-5 py-4">
            <p className="text-[14px] font-medium text-white">Couldn't load your subscription</p>
            <p className="mt-1 text-[13px] text-white/65">
              {subError instanceof ApiError ? subError.message : "Please try again."}
            </p>
            <Button variant="secondary" size="md" className="mt-3" onClick={sub.refetch}>
              Try again
            </Button>
          </div>
        )}

        {/* Loading state — light placeholder so the picker reveals smoothly. */}
        {sub.loading && (
          <div className="h-20 animate-pulse rounded-xl bg-white/[0.02]" />
        )}

        {/* No active subscription — guidance banner that frames the picker
            below as the path forward. Shown when BE explicitly reports
            "no active subscription" (404 or the message check). */}
        {!sub.loading && isMissingSubscription && (
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.08] px-5 py-4">
            <Info className="mt-0.5 shrink-0 text-primary" size={20} />
            <div>
              <p className="text-[14px] font-medium text-white">No active subscription yet</p>
              <p className="mt-0.5 text-[13px] text-white/65">
                Pick a plan below to activate your workspace. We'll redirect you to Paystack to complete payment.
              </p>
            </div>
          </div>
        )}

        {/* Active subscription state — trial banner + current-plan card */}
        {data && (
          <>
            {data.status === "trialing" && data.trialEndsAt && (
              <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-amber-500/15 px-5 py-4">
                <Sparkles className="mt-0.5 shrink-0 text-amber-300" size={20} />
                <div>
                  <p className="text-[14px] font-medium text-white">
                    {data.daysRemaining > 0
                      ? `${data.daysRemaining} day${data.daysRemaining === 1 ? "" : "s"} left in your free trial`
                      : "Your trial ends today"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-white/65">
                    Trial ends {fmtDate(data.trialEndsAt)}. Add billing details to keep your workspace live after that.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-[18px] font-medium text-white">{data.planDisplayName}</h3>
                    <Chip tone={statusChip[data.status].tone}>{statusChip[data.status].label}</Chip>
                  </div>
                  {data.amountPaid > 0 && (
                    <p className="font-mono text-[14px] text-white/65">
                      {naira(data.amountPaid)} / {data.billingCycle}
                    </p>
                  )}
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/45">
                    <CalendarClock size={14} />
                    {data.cancelledAt
                      ? `Cancelled — access ends ${fmtDate(data.expiresAt)}`
                      : data.status === "trialing"
                      ? `Trial ends ${fmtDate(data.trialEndsAt)}`
                      : `Renews ${fmtDate(data.expiresAt)}`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Plan picker — ALWAYS rendered. Doesn't depend on a current sub
            existing; that's the whole point of this page on a fresh tenant. */}
        {!isHardError && (
          <div>
            <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-[18px] font-medium tracking-[-0.01em] text-white">
                  {data ? "Change plan" : "Choose a plan"}
                </h2>
                <p className="mt-1 text-[14px] text-white/65">
                  {data
                    ? "Upgrades take effect immediately and are prorated. Downgrades apply at the end of your billing period."
                    : "Starter, Growth, and Pro include a 14-day free trial. You won't be charged until day 15."}
                </p>
              </div>
              <CycleSelector value={selectedCycle} onChange={setSelectedCycle} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {PLAN_CATALOG.map((p) => {
                const isCurrent = p.id === currentPlan;
                const price = p[selectedCycle];
                const perLabel =
                  selectedCycle === "monthly"
                    ? "/mo"
                    : selectedCycle === "quarterly"
                    ? "/qtr"
                    : "/yr";
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border bg-cinema-elev p-5 flex flex-col ${
                      isCurrent
                        ? "border-2 border-primary"
                        : "border-white/[0.06] hover:border-primary-light"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/65">
                        {p.name}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-primary">
                          <CheckCircle2 size={12} /> Current
                        </span>
                      )}
                    </div>
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="font-mono text-[22px] text-white">
                        {price === 0 ? "Free" : naira(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-[13px] text-white/45">{perLabel}</span>
                      )}
                    </div>
                    <p className="mb-3 text-[13px] text-white/65 flex-1">{p.blurb}</p>
                    {p.requiresAcademicEmail && (
                      <p className="mb-3 text-[11px] text-white/45 leading-relaxed">
                        Requires an academic email (.edu, .edu.ng, .ac.uk).
                      </p>
                    )}
                    <Button
                      variant={isCurrent ? "secondary" : "primary"}
                      size="md"
                      className="w-full"
                      disabled={isCurrent || upgrading !== null}
                      onClick={() => selectPlan(p.id)}
                    >
                      {upgrading === p.id
                        ? "Switching…"
                        : isCurrent
                        ? "Current plan"
                        : "Switch to this plan"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SettingsShell>
  );
}

/** Segmented control for monthly / quarterly / yearly. Small dark chip;
 *  the yearly + quarterly options show a "Save" badge so the savings are
 *  obvious without a footnote. */
function CycleSelector({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  const labels: Record<BillingCycle, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };
  const badges: Record<BillingCycle, string | null> = {
    monthly: null,
    quarterly: "-15%",
    yearly: "-30%",
  };
  return (
    <div
      role="tablist"
      aria-label="Billing cycle"
      className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1"
    >
      {(["monthly", "quarterly", "yearly"] as const).map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c)}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              active ? "bg-primary text-white" : "text-white/60 hover:text-white/85"
            }`}
          >
            {labels[c]}
            {badges[c] && (
              <span
                className={`ml-1.5 inline-block rounded px-1 py-0.5 font-mono text-[9.5px] tracking-wide ${
                  active ? "bg-white/15 text-white" : "bg-primary/15 text-primary-light"
                }`}
              >
                {badges[c]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
