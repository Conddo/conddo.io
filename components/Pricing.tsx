"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { Button } from "./ui/Button";

// Legacy Pricing block — the live /pricing page uses CinematicPricing.
// Kept in sync with the canonical five-tier catalog (V67) so that any
// downstream surface (email templates, static campaigns) that imports
// this shows the right numbers. Prices in Naira.

type Cycle = "monthly" | "quarterly" | "yearly";

type Plan = {
  id: "free" | "student" | "starter" | "growth" | "pro";
  name: string;
  prices: Record<Cycle, number>;
  blurb: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
  hint?: string;
  cta: { label: string; href: string };
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    prices: { monthly: 0, quarterly: 0, yearly: 0 },
    blurb: "Start with a website and see if Conddo fits.",
    features: ["Website", "1 staff account", "100 credits/month"],
    cta: { label: "Start free", href: "/onboarding/create-account?plan=free" },
  },
  {
    id: "student",
    name: "Student",
    prices: { monthly: 3_000, quarterly: 7_650, yearly: 25_200 },
    blurb: "For side-hustlers building while in school.",
    inherits: "Everything in Free, plus",
    features: ["Orders & bookings", "Payments", "2 staff accounts", "300 credits/month"],
    hint: "Requires an academic email (.edu, .edu.ng, .ac.uk).",
    cta: { label: "Verify & start", href: "/onboarding/create-account?plan=student" },
  },
  {
    id: "starter",
    name: "Starter",
    prices: { monthly: 5_000, quarterly: 12_750, yearly: 42_000 },
    blurb: "Everything you need to run your business online.",
    inherits: "Everything in Student, plus",
    features: ["Inventory", "Basic analytics", "5 staff accounts", "500 credits/month"],
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=starter" },
  },
  {
    id: "growth",
    name: "Growth",
    prices: { monthly: 15_000, quarterly: 38_250, yearly: 126_000 },
    blurb: "For businesses ready to automate and scale.",
    inherits: "Everything in Starter, plus",
    features: [
      "Custom domain & business email",
      "Email + SMS campaigns",
      "Social scheduler",
      "Marketing dashboard",
      "3,000 credits/month",
    ],
    popular: true,
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=growth" },
  },
  {
    id: "pro",
    name: "Pro",
    prices: { monthly: 30_000, quarterly: 76_500, yearly: 252_000 },
    blurb: "For teams with advanced operational needs.",
    inherits: "Everything in Growth, plus",
    features: [
      "Multi-location",
      "Unlimited staff",
      "Advanced analytics",
      "API access",
      "10,000 credits/month",
    ],
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=pro" },
  },
];

const naira = (n: number) => (n === 0 ? "Free" : `₦${n.toLocaleString("en-NG")}`);
const perLabel: Record<Cycle, string> = { monthly: "/mo", quarterly: "/qtr", yearly: "/yr" };
const cycleLabel: Record<Cycle, string> = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };
const savingsBadge: Record<Cycle, string | null> = {
  monthly: null,
  quarterly: "Save 15%",
  yearly: "Save 30%",
};

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <Section tone="bg" id="pricing">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Simple plans. No hidden fees.
        </h2>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div
          role="tablist"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-neutral-border bg-neutral-surface p-1"
        >
          {(["monthly", "quarterly", "yearly"] as const).map((c) => {
            const active = cycle === c;
            const badge = savingsBadge[c];
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCycle(c)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? "bg-primary text-white" : "text-content-secondary hover:text-ink"
                }`}
              >
                {cycleLabel[c]}
                {badge && (
                  <span
                    className={`ml-2 inline-block rounded-full px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em] ${
                      active ? "bg-white/20 text-white" : "bg-success-bg text-success"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan) => {
          const price = plan.prices[cycle];
          return (
            <div
              key={plan.id}
              className={`relative flex h-full flex-col rounded-lg bg-neutral-surface p-6 ${
                plan.popular ? "border-2 border-primary" : "border border-neutral-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                  ★ Most popular
                </span>
              )}
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-content-secondary">
                {plan.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-[30px] font-medium leading-none text-ink">
                  {naira(price)}
                </span>
                {price > 0 && (
                  <span className="text-[13px] text-content-muted">{perLabel[cycle]}</span>
                )}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-content-secondary">{plan.blurb}</p>

              <div className="my-5 h-px bg-neutral-border" />

              {plan.inherits && (
                <p className="mb-2.5 text-[12px] font-medium text-ink">{plan.inherits}</p>
              )}
              <ul className="mb-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                    <span className="text-[13px] text-content-secondary">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.hint && (
                <p className="mb-3 text-[11px] leading-relaxed text-content-muted">{plan.hint}</p>
              )}

              <Button
                href={`${plan.cta.href}&billing=${cycle}`}
                variant={plan.popular ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                {plan.cta.label}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[14px] text-content-secondary">
        14-day free trial on Starter, Growth, and Pro. No credit card required.
      </p>
    </Section>
  );
}
