// Credits API — the tenant's current credit standing. Feeds the dashboard
// widget (available, tier, breakdown by action type, cycle window).

import { api } from "./client";

export type CreditTier = "free" | "starter" | "growth";

export type CreditBreakdown = {
  actionType: string;
  credits: number;
};

export type CreditSummary = {
  tier: CreditTier;
  monthlyQuota: number;
  creditsUsed: number;
  topupCredits: number;
  reservedCredits: number;
  available: number;
  cycleStart: string | null;
  cycleEnd: string | null;
  breakdown: CreditBreakdown[];
};

/** GET /api/v1/me/credits — the current tenant's credit summary. */
export async function getCreditSummary(): Promise<CreditSummary> {
  const { data } = await api.get<CreditSummary>("/me/credits");
  return data;
}

/** As a Result for use with useApiQuery. */
export const creditsQuery = () => api.get<CreditSummary>("/me/credits");

// ----- Display helpers ------------------------------------------------------

const TIER_LABELS: Record<CreditTier, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
};

const NEXT_TIER: Record<CreditTier, { id: CreditTier; quota: number } | null> = {
  free:    { id: "starter", quota: 1_000 },
  starter: { id: "growth",  quota: 10_000 },
  growth:  null,
};

const ACTION_LABELS: Record<string, string> = {
  "ai.provisioning":              "AI setup",
  "order.processed":              "Orders",
  "workflow.trigger":             "Automations",
  "marketing.ai_message":         "AI marketing",
  "website.generation":           "Website builds",
  "website.ai_copy_regeneration": "AI copy edits",
};

export const tierLabel = (tier: CreditTier) => TIER_LABELS[tier] ?? tier;
export const nextTierFor = (tier: CreditTier) => NEXT_TIER[tier];
export const actionLabel = (action: string) =>
  ACTION_LABELS[action] ?? action.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Fraction of the cycle allocation consumed — used for the progress bar. */
export const usagePercent = (s: CreditSummary): number => {
  const cap = s.monthlyQuota + s.topupCredits;
  if (cap <= 0) return 0;
  const used = s.creditsUsed + s.reservedCredits;
  return Math.min(100, Math.round((used / cap) * 100));
};

/** Bar color tier — matches the spec's green → amber (75%) → red (90%). */
export const usageTone = (percent: number): "ok" | "warn" | "danger" => {
  if (percent >= 90) return "danger";
  if (percent >= 75) return "warn";
  return "ok";
};
