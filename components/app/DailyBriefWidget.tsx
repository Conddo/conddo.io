"use client";

import { Sparkles, Mail } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { briefQuery, type DailyBrief } from "@/lib/api/brief";

/**
 * The AI Daily Business Brief — Conddo's opinionated morning check-in.
 * Read hits GET /api/v1/me/brief which serves a cached brief for the day
 * (or generates one on first read).
 *
 * <p>Sits above the KPI row so the moment the owner opens the dashboard,
 * the first thing they see is a warm, plain-English "here's what needs
 * your attention today" — not a wall of numbers they have to interpret.
 *
 * <p>Unverified accounts get a soft "verify to unlock" card instead — the
 * BE returns state=verify-email and the widget pivots without a separate
 * fetch or error state.
 */
export function DailyBriefWidget() {
  const { data, loading } = useApiQuery<DailyBrief>(briefQuery);

  if (loading || !data) return <BriefSkeleton />;

  if (data.state === "verify-email") {
    return (
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/[0.15] text-amber-300">
            <Mail size={18} strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-[16px] font-medium text-amber-50">{data.headline}</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-amber-100/85">{data.body}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-primary/[0.06] via-cinema-elev to-cinema-elev p-5">
      {/* Ambient glow to reinforce this-is-something-special. */}
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/[0.10] blur-2xl"
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.15] text-primary-light">
          <Sparkles size={18} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-primary-light/80">
            Today
          </p>
          <h2 className="mt-1 text-[18px] font-medium leading-snug tracking-tight text-white md:text-[19px]">
            {data.headline}
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-white/75">
            {data.body}
          </p>
        </div>
      </div>
    </section>
  );
}

function BriefSkeleton() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-cinema-elev p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-full animate-pulse rounded bg-white/[0.04]" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
    </section>
  );
}
