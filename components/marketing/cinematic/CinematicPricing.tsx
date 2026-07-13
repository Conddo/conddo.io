"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

/** Cinematic pricing block — five plan cards above a Monthly / Quarterly /
 *  Yearly toggle. Growth keeps the "Most popular" ribbon. Free is a real
 *  permanent tier (no trial banner); Student is a discounted Starter that
 *  requires an academic email at signup (BE enforces this — the FE just
 *  labels it).
 *
 *  Single source of truth for the /pricing card row. The BILLING_TIERS_SPEC
 *  matrix + comparison table live in ComparePlans.tsx. */

type Cycle = "monthly" | "quarterly" | "yearly";

type Plan = {
  id: "free" | "student" | "starter" | "growth" | "pro";
  name: string;
  blurb: string;
  /** Naira per cycle. */
  prices: { monthly: number; quarterly: number; yearly: number };
  credits: number;
  /** Copy under the feature list — one-line hook. */
  hint?: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
  cta: { label: string; href: string };
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Start with a website and see if Conddo fits.",
    prices: { monthly: 0, quarterly: 0, yearly: 0 },
    credits: 100,
    features: [
      "Website & online presence",
      "1 staff account",
      "Basic dashboard",
      "Community support",
    ],
    cta: { label: "Start free", href: "/onboarding/create-account?plan=free" },
  },
  {
    id: "student",
    name: "Student",
    blurb: "For side-hustlers building while in school.",
    prices: { monthly: 3_000, quarterly: 7_650, yearly: 25_200 },
    credits: 300,
    hint: "Requires an academic email (.edu, .edu.ng, .ac.uk, etc.)",
    features: [
      "Everything in Free, plus:",
      "Orders & bookings",
      "Payments",
      "2 staff accounts",
      "Email support",
    ],
    cta: { label: "Verify & start", href: "/onboarding/create-account?plan=student" },
  },
  {
    id: "starter",
    name: "Starter",
    blurb: "Everything you need to run your business online.",
    prices: { monthly: 5_000, quarterly: 12_750, yearly: 42_000 },
    credits: 500,
    features: [
      "Everything in Student, plus:",
      "Inventory management",
      "Basic analytics",
      "5 staff accounts",
      "Email support",
    ],
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=starter" },
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "For businesses ready to automate and scale.",
    prices: { monthly: 15_000, quarterly: 38_250, yearly: 126_000 },
    credits: 3_000,
    popular: true,
    inherits: "Everything in Starter, plus:",
    features: [
      "Custom domain & business email",
      "Email + SMS campaigns",
      "Social media scheduling",
      "Marketing dashboard",
      "Advanced customer engagement",
      "Priority support",
    ],
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=growth" },
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For teams with advanced operational needs.",
    prices: { monthly: 30_000, quarterly: 76_500, yearly: 252_000 },
    credits: 10_000,
    inherits: "Everything in Growth, plus:",
    features: [
      "Multi-location management",
      "Unlimited staff accounts",
      "Advanced analytics & reporting",
      "API access",
      "Priority phone support",
    ],
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=pro" },
  },
];

export function CinematicPricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-16 md:py-24">
        <div className="flex justify-center mb-12">
          <CycleToggle value={cycle} onChange={setCycle} />
        </div>

        {/* 5 cards. 1 col mobile → 2 cols tablet → 5 cols on wide. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 max-w-[1400px] mx-auto">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} cycle={cycle} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CycleToggle({
  value,
  onChange,
}: {
  value: Cycle;
  onChange: (c: Cycle) => void;
}) {
  const labelFor: Record<Cycle, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };
  const badgeFor: Record<Cycle, string | null> = {
    monthly: null,
    quarterly: "Save 15%",
    yearly: "Save 30%",
  };
  return (
    <div className="relative inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] p-1 backdrop-blur">
      {(["monthly", "quarterly", "yearly"] as const).map((c) => {
        const active = value === c;
        const badge = badgeFor[c];
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`relative z-10 px-5 py-2 text-[13px] font-medium tracking-tight transition-colors rounded-full ${
              active ? "text-white" : "text-white/55 hover:text-white/85"
            }`}
          >
            {active && (
              <motion.span
                layoutId="cycle-toggle-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {labelFor[c]}
              {badge && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.1em] ${
                    active ? "bg-white/15 text-white" : "bg-primary/15 text-primary-light"
                  }`}
                >
                  {badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({ plan, cycle, index }: { plan: Plan; cycle: Cycle; index: number }) {
  const price = plan.prices[cycle];
  const perLabel = cycle === "monthly" ? "mo" : cycle === "quarterly" ? "qtr" : "yr";

  return (
    <motion.div
      className={`relative rounded-3xl border p-5 md:p-6 backdrop-blur transition-colors flex flex-col ${
        plan.popular
          ? "border-primary/45 bg-primary/[0.04]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.06 + index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white">
          Most popular
        </span>
      )}

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-light">
        {plan.name}
      </p>
      <p className="mt-2 text-[13px] text-white/55 leading-relaxed min-h-[42px]">
        {plan.blurb}
      </p>

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-2">
        <p className="font-mono text-3xl md:text-[36px] font-medium text-white leading-none tabular-nums">
          {price === 0 ? "Free" : `₦${price.toLocaleString("en-NG")}`}
        </p>
        {price > 0 && (
          <span className="text-[12px] text-white/40">/{perLabel}</span>
        )}
      </div>

      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/50">
        {plan.credits.toLocaleString("en-NG")} credits / month
      </p>

      {/* CTA */}
      <Link
        href={plan.cta.href}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors ${
          plan.popular
            ? "bg-primary text-white hover:bg-primary-hover"
            : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        }`}
      >
        {plan.cta.label}
        <ArrowRight size={13} />
      </Link>

      {plan.hint && (
        <p className="mt-3 text-[11px] text-white/40 leading-relaxed">
          {plan.hint}
        </p>
      )}

      {plan.inherits && (
        <p className="mt-5 text-[11px] uppercase tracking-[0.12em] text-white/40 font-mono">
          {plan.inherits}
        </p>
      )}

      {/* Feature list */}
      <ul className={`${plan.inherits ? "mt-2.5" : "mt-5"} space-y-2 flex-1`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-white/80 leading-snug">
            <Check size={13} className="mt-1 shrink-0 text-primary-light" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {(plan.id === "starter" || plan.id === "growth" || plan.id === "pro") && (
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          14-day free trial · No credit card
        </p>
      )}
    </motion.div>
  );
}
