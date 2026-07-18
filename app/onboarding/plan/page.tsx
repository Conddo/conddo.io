"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";
import { subscriptionsApi, type Plan, type BillingCycle } from "@/lib/api/subscriptions";

const SLUG = "plan";

/** Which cycles the picker shows. Monthly and yearly cover 95% of choices;
 *  quarterly can be exposed later on the /settings/billing screen. */
const CYCLES: { id: BillingCycle; label: string; savingsCopy?: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly", savingsCopy: "Save ~30%" },
];

/**
 * Step 5 — plan picker. Every tenant gets a 14-day free trial regardless of
 * pick; picking a paid tier just tells the BE which one to bill after the
 * trial ends. Ready calls /auth/register/complete with the chosen planId
 * and drops the tenant on the dashboard.
 *
 * If a tenant picks a paid plan and wants to pay right away (e.g. because
 * a feature is gated behind Growth+), Ready hands them off to Paystack
 * checkout after the tenant is provisioned.
 */
export default function PlanStep() {
  const router = useRouter();
  const { planId, planCycle, update, reachStep } = useOnboarding();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [selected, setSelected] = useState<Plan["id"] | null>(planId);
  const [cycle, setCycle] = useState<BillingCycle>(planCycle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    subscriptionsApi
      .plans()
      .then((r) => {
        if (!alive) return;
        // Free is included but shown as "Start free" — the trial default.
        setPlans(r.data);
        if (!selected) setSelected("starter");
      })
      .catch(() => {
        if (!alive) return;
        setError("Couldn't load plans right now. You can pick later — Continue starts your free trial.");
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onContinue = () => {
    if (!plans) {
      // Load failed — carry on with a null planId so BE assigns the default.
      update({ planId: null, planCycle: cycle });
    } else {
      update({ planId: selected ?? "starter", planCycle: cycle });
    }
    reachStep(5);
    const next = nextStep(SLUG);
    if (next) router.push(hrefFor(next.slug));
  };

  const goBack = () => {
    const prev = prevStep(SLUG);
    if (prev) router.push(hrefFor(prev.slug));
  };

  const displayPrice = (plan: Plan) => {
    const raw = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    if (raw == null || raw === 0) return "Free";
    return `₦${raw.toLocaleString()}`;
  };

  const shown = (plans ?? []).filter((p) => p.id !== "student"); // student is invite-only

  return (
    <div className="w-full max-w-4xl">
      <header className="mb-7 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          Pick a plan
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          You get 14 days free on any tier. Change or cancel anytime.
        </p>
      </header>

      <div className="mb-5 flex justify-center gap-1 rounded-lg border border-white/10 bg-cinema-elev p-1">
        {CYCLES.map((c) => {
          const active = cycle === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCycle(c.id)}
              className={
                "rounded-md px-3.5 py-1.5 text-[13px] transition " +
                (active ? "bg-white/10 text-white" : "text-white/60 hover:text-white/85")
              }
              aria-pressed={active}
            >
              {c.label}
              {c.savingsCopy && (
                <span className={"ml-2 text-[11px] " + (active ? "text-emerald-300" : "text-emerald-400/70")}>
                  {c.savingsCopy}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/70">
          {error}
        </div>
      )}

      {!plans && !error ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-white/50">
          <Loader2 size={14} className="animate-spin" /> Loading plans…
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {shown.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                aria-pressed={active}
                className={
                  "flex flex-col items-start rounded-xl border p-5 text-left transition " +
                  (active
                    ? "border-primary bg-primary/[0.08] ring-2 ring-primary/25"
                    : "border-white/10 bg-cinema-elev hover:border-white/25")
                }
              >
                <div className="flex w-full items-start justify-between">
                  <span className="text-[15px] font-semibold text-white">{plan.displayName}</span>
                  {active && <Check size={16} className="text-emerald-300" />}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[24px] font-semibold text-white">
                    {displayPrice(plan)}
                  </span>
                  {plan.monthlyPrice ? (
                    <span className="text-[12px] text-white/50">
                      / {cycle === "yearly" ? "year" : "month"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-[12px] leading-snug text-white/60">
                  {planBlurb(plan.id)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          onClick={goBack}
          className="rounded-md border border-white/10 px-5 py-3 text-[14px] text-white/70 hover:border-white/20 hover:text-white"
        >
          Back
        </button>
        <Button onClick={onContinue} variant="primary" size="lg" className="flex-1">
          Start free trial
        </Button>
      </div>
      <p className="mt-3 text-center text-[12px] text-white/45">
        We won&apos;t charge you until day 15. Card details are captured only if you upgrade before then.
      </p>
    </div>
  );
}

/** One-liner per tier — kept out of the plan feature map because the BE
 *  feature map is a gate-value dict, not a marketing blurb. */
function planBlurb(id: Plan["id"]): string {
  switch (id) {
    case "free":
      return "The essentials — website + customers + payments. Great for testing.";
    case "starter":
      return "Everything in Free, plus orders, marketing, and staff accounts.";
    case "growth":
      return "For businesses running orders and marketing at scale.";
    case "pro":
      return "Unlimited everything, priority support, multi-location.";
    case "student":
      return "Discounted tier for verified students.";
    default:
      return "";
  }
}
