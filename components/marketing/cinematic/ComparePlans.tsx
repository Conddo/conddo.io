"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Cinematic compare-plans matrix — 5 plan columns × feature rows.
 *  Grouped into Core / Growth / Scale so the visual hierarchy matches
 *  the upgrade path. Rows where a plan doesn't include a feature show
 *  an em-dash instead of a check so visual scanning is fast. */

type PlanKey = "free" | "student" | "starter" | "growth" | "pro";

type Row = { label: string } & Record<PlanKey, boolean>;

const groups: { heading: string; rows: Row[] }[] = [
  {
    heading: "Core platform",
    rows: [
      { label: "Website",             free: true,  student: true,  starter: true,  growth: true, pro: true },
      { label: "Customers & CRM",     free: false, student: true,  starter: true,  growth: true, pro: true },
      { label: "Orders & Bookings",   free: false, student: true,  starter: true,  growth: true, pro: true },
      { label: "Payments",            free: false, student: true,  starter: true,  growth: true, pro: true },
      { label: "Inventory",           free: false, student: false, starter: true,  growth: true, pro: true },
      { label: "Analytics",           free: false, student: false, starter: true,  growth: true, pro: true },
    ],
  },
  {
    heading: "Growth tools",
    rows: [
      { label: "Custom Domain",         free: false, student: false, starter: false, growth: true, pro: true },
      { label: "Business Email",        free: false, student: false, starter: false, growth: true, pro: true },
      { label: "Marketing Tools",       free: false, student: false, starter: false, growth: true, pro: true },
      { label: "SMS & Email Campaigns", free: false, student: false, starter: false, growth: true, pro: true },
    ],
  },
  {
    heading: "Scale features",
    rows: [
      { label: "Multi-location",         free: false, student: false, starter: false, growth: false, pro: true },
      { label: "API Access",             free: false, student: false, starter: false, growth: false, pro: true },
      { label: "Advanced Reporting",     free: false, student: false, starter: false, growth: false, pro: true },
      { label: "Priority phone support", free: false, student: false, starter: false, growth: false, pro: true },
    ],
  },
];

const PLAN_HEADERS: { key: PlanKey; label: string; accent?: boolean }[] = [
  { key: "free",    label: "Free" },
  { key: "student", label: "Student" },
  { key: "starter", label: "Starter" },
  { key: "growth",  label: "Growth", accent: true },
  { key: "pro",     label: "Pro" },
];

export function ComparePlans() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-32">
        <div className="max-w-3xl mb-12 md:mb-16">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Compare plans
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Choose what fits today. Grow into more.
          </motion.h2>
        </div>

        <motion.div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-5 py-4 text-[11px] font-mono uppercase tracking-[0.12em] text-white/40">
                    Feature
                  </th>
                  {PLAN_HEADERS.map((p) => (
                    <th
                      key={p.key}
                      className={`px-4 py-4 text-center text-[12px] font-medium ${
                        p.accent ? "text-primary-light" : "text-white/85"
                      }`}
                    >
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g, gi) => (
                  <FeatureGroup key={g.heading} group={g} isFirst={gi === 0} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureGroup({
  group,
  isFirst,
}: {
  group: { heading: string; rows: Row[] };
  isFirst: boolean;
}) {
  return (
    <>
      <tr className={isFirst ? "" : "border-t border-white/[0.06]"}>
        <td
          colSpan={1 + PLAN_HEADERS.length}
          className="px-5 pt-7 pb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40"
        >
          {group.heading}
        </td>
      </tr>
      {group.rows.map((r) => (
        <tr
          key={r.label}
          className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
        >
          <td className="px-5 py-3.5 text-[14px] text-white/85">{r.label}</td>
          {PLAN_HEADERS.map((p) => (
            <Cell key={p.key} included={r[p.key]} accent={p.accent} />
          ))}
        </tr>
      ))}
    </>
  );
}

function Cell({ included, accent = false }: { included: boolean; accent?: boolean }) {
  return (
    <td className="px-4 py-3.5 text-center">
      {included ? (
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
            accent ? "bg-primary/15 text-primary-light" : "bg-white/[0.06] text-white/85"
          }`}
        >
          <Check size={13} strokeWidth={2.5} />
        </span>
      ) : (
        <span className="text-white/25">—</span>
      )}
    </td>
  );
}
