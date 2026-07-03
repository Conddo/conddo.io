"use client";

import { useState } from "react";
import { Zap, ChevronDown, TrendingUp } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  creditsQuery,
  usagePercent,
  usageTone,
  tierLabel,
  nextTierFor,
  actionLabel,
  type CreditSummary,
} from "@/lib/api/credits";

/**
 * Home-screen credits widget (Billing spec §"Credit Usage Dashboard").
 * Shows the tenant's monthly credit consumption at a glance; expands to
 * a per-action breakdown on click. Bar color escalates green → amber (75%)
 * → red (90%) so the owner has ambient awareness of headroom before they
 * hit a "credits exhausted" wall.
 *
 * <p>Top up + Upgrade are stubs until PRs 2c/2d land Paystack integration.
 */
export function CreditsWidget() {
  const { data, loading } = useApiQuery<CreditSummary>(creditsQuery);
  const [expanded, setExpanded] = useState(false);

  if (loading || !data) return <CreditsSkeleton />;

  const percent = usagePercent(data);
  const tone = usageTone(percent);
  const next = nextTierFor(data.tier);
  const showTopUp = tone !== "ok";
  const showUpgrade = tone === "danger" && next !== null;

  const barColor =
    tone === "danger" ? "bg-rose-500" :
    tone === "warn"   ? "bg-amber-400" :
                        "bg-emerald-400";
  const barGlow =
    tone === "danger" ? "shadow-[0_0_18px_rgba(244,63,94,0.35)]" :
    tone === "warn"   ? "shadow-[0_0_18px_rgba(251,191,36,0.30)]" :
                        "";

  const capacity = data.monthlyQuota + data.topupCredits;
  const consumed = data.creditsUsed + data.reservedCredits;

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-cinema-elev p-5">
      {/* Header row — tier + spend/quota. */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary-light" strokeWidth={2.25} />
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
              Credits
            </p>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-white/70">
              {tierLabel(data.tier)}
            </span>
          </div>
          <p className="mt-2 text-[26px] font-medium leading-none tracking-tight text-white md:text-[28px]">
            {data.available.toLocaleString()}
            <span className="ml-1 text-[14px] text-white/45">
              / {capacity.toLocaleString()} left
            </span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-[0.06em] text-white/45">Used this cycle</p>
          <p className="mt-1 font-mono text-[16px] text-white">
            {consumed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bar. */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor} ${barGlow}`}
            style={{ width: `${Math.max(2, percent)}%` }}
            aria-label={`${percent}% used`}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-white/55">
          <span>{percent}% consumed</span>
          {data.cycleEnd && (
            <span>Renews {formatCycle(data.cycleEnd)}</span>
          )}
        </div>
      </div>

      {/* Actions row — only surfaces once you're close to the ceiling. */}
      {(showTopUp || showUpgrade) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {showTopUp && (
            <button
              type="button"
              disabled
              title="Top-ups launch with Paystack integration"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/[0.08] px-3 py-1.5 text-[13px] font-medium text-primary-light hover:bg-primary/[0.12] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Top up
            </button>
          )}
          {showUpgrade && next && (
            <button
              type="button"
              disabled
              title="Plan upgrades launch with Paystack integration"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] font-medium text-white/85 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <TrendingUp size={14} />
              Upgrade to {tierLabel(next.id)}
              <span className="text-white/55">— {next.quota.toLocaleString()}/mo</span>
            </button>
          )}
        </div>
      )}

      {/* Breakdown toggle. */}
      {data.breakdown.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex w-full items-center justify-between rounded-md px-1 py-1 text-[13px] text-white/60 hover:text-white/85"
          aria-expanded={expanded}
        >
          <span>Where did they go?</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {expanded && data.breakdown.length > 0 && (
        <ul className="mt-2 space-y-1.5 border-t border-white/[0.06] pt-3">
          {data.breakdown.map((row) => (
            <li key={row.actionType} className="flex items-center justify-between text-[13px]">
              <span className="text-white/70">{actionLabel(row.actionType)}</span>
              <span className="font-mono text-white/90">
                {row.credits.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CreditsSkeleton() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-cinema-elev p-5">
      <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-3 h-7 w-40 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-white/[0.05]" />
    </section>
  );
}

function formatCycle(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "soon";
  }
}
