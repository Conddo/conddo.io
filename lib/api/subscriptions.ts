// Subscriptions module — typed API surface for billing tiers.
// Pricing v2 (V67): five tiers × three cycles.
//
// A tenant has a subscription pointing at a plan. Plans are tier identifiers —
// the BE owns the canonical list via /billing/plans and gates module access
// via feature_key checks.

import { api } from "./client";

/** Product tier ids. Pre-V67 names (launcher / scaler) still resolve on the
 *  BE for backwards-compat but shouldn't be used in new code. */
export type PlanId = "free" | "student" | "starter" | "growth" | "pro";
export type BillingCycle = "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "trialing" | "grace" | "expired" | "cancelled";

// Feature keys gate specific modules / actions. Keep this in sync with the
// plan_features table in the spec — the BE returns the boolean / numeric
// value the FE checks against.
export type FeatureKey =
  | "website"
  | "custom_domain"
  | "business_email"
  | "order_management"
  | "bookings"
  | "email_campaigns"
  | "sms_campaigns"
  | "social_scheduler"
  | "ad_management"
  | "multi_location"
  | "api_access"
  | "advanced_analytics"
  | "staff_accounts"
  | "brand_package_subscription"   // BE live 2026-06-07
  | "media_storage_mb";              // numeric quota (e.g. "500", "5120", "unlimited")

export type Plan = {
  id: PlanId;
  displayName: string;             // "Free" / "Student" / "Starter" / "Growth" / "Pro"
  monthlyPrice: number | null;     // ₦
  quarterlyPrice: number | null;   // ₦
  yearlyPrice: number | null;      // ₦ — V67
  isCustom: boolean;               // reserved; false for every V67 tier
  // Feature map — true/false for boolean gates, string for numeric limits
  // ("2", "5", "unlimited"). FE coerces.
  features: Partial<Record<FeatureKey, string>>;
};

export type Subscription = {
  planId: PlanId;
  planDisplayName: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amountPaid: number;          // ₦ (last paid, 0 during trial)
  startedAt: string;            // ISO
  expiresAt: string;            // ISO — when current period ends
  cancelledAt?: string | null;  // ISO if cancelled
  trialEndsAt?: string | null;  // ISO during trial; null after
  daysRemaining: number;        // server-computed convenience
};

// Returns the gate value for a feature on the tenant's current plan. Coerces
// "true"/"false" → boolean; numeric strings → number; "unlimited" → Infinity.
export function featureValue(plan: Plan | null, key: FeatureKey): boolean | number {
  if (!plan) return false;
  const raw = plan.features[key];
  if (raw == null) return false;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "unlimited") return Number.POSITIVE_INFINITY;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Boolean(raw);
}

export function hasFeature(plan: Plan | null, key: FeatureKey): boolean {
  const v = featureValue(plan, key);
  return v === true || (typeof v === "number" && v > 0);
}

export type UpgradeInput = { planId: PlanId; billingCycle: BillingCycle };

/** Paystack hosted checkout response. The FE redirects the user to
 *  `authorizationUrl`; after payment, Paystack bounces them back to our
 *  callback at /settings/billing/return?reference=<reference>. */
export type CheckoutInitResult = {
  authorizationUrl: string;
  reference: string;
  accessCode?: string;
};

/** Result of verifying a Paystack checkout reference. `status` is the
 *  Paystack-canonical state; `subscription` is the post-charge state of
 *  the tenant's subscription (always present on `success`). */
export type CheckoutVerifyStatus = "success" | "pending" | "failed" | "abandoned";

export type CheckoutVerifyResult = {
  status: CheckoutVerifyStatus;
  reference: string;
  amount?: number;             // ₦ — what was actually charged
  paidAt?: string | null;
  failureReason?: string | null;
  subscription?: Subscription;
};

export const subscriptionsApi = {
  // List all plans (catalog). Public — also used by the marketing pricing page
  // when we want server-driven pricing.
  plans: () => api.get<Plan[]>("/billing/plans"),
  // Current tenant's subscription.
  current: () => api.get<Subscription>("/billing/subscription"),
  /** Initiate Paystack checkout for a plan switch. Server creates the
   *  Paystack transaction (with the tenant + plan + cycle metadata) and
   *  returns the hosted-checkout URL. FE redirects the user; on payment,
   *  Paystack bounces back to /settings/billing/return?reference=… */
  checkout: (body: UpgradeInput) =>
    api.post<CheckoutInitResult>("/billing/checkout", body),
  /** Verify a Paystack reference after the user returns from checkout.
   *  Polled by /settings/billing/return until a terminal status. */
  verify: (reference: string) =>
    api.get<CheckoutVerifyResult>(`/billing/verify?reference=${encodeURIComponent(reference)}`),
  // Cancel — takes effect at period end (cancelledAt set, status stays active
  // until expiresAt then flips to cancelled).
  cancel: () => api.post<Subscription>("/billing/cancel"),
};
