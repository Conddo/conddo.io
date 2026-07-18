import { create } from "zustand";
import type { BillingCycle, PlanId } from "./api/subscriptions";

// Onboarding wizard state, shared across the step pages. v3 flow:
// account → vertical → brand → vibe → plan → ready. Fields fill in
// progressively; the AI classifier fields (`modules`, `verticalConfidence`)
// are kept in-place for the review-screen fallback path but the v3 flow
// no longer renders review, so they stay zero-initialised.
//
// `logoFile` is a live File object — deliberately not persisted; if the
// tab is closed mid-onboarding the tenant re-picks the file on return.
// The upload only fires from the Ready step, after the tenant JWT is
// minted by /auth/register/complete.

export type ModuleSuggestion = {
  id: string;
  confidence: number;
  reason: string;
  /** Local toggle the review screen mutates; defaults to true for every
   *  module returned as `recommended` by the classifier. */
  enabled: boolean;
};

export type OnboardingData = {
  // Step 1 — account
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  // Set after POST /auth/register/start; carried through complete.
  registrationId: string | null;

  // Step 2 — free-text business description.
  description: string;

  // Step 3+4 — AI classification result. `vertical` is the classifier's
  // best guess; `modules` is the full ranked list the review screen
  // renders with enabled/disabled toggles.
  vertical: string | null;
  verticalConfidence: number;
  modules: ModuleSuggestion[];

  // Step 3 — brand. logoFile is a live File until the tenant is created,
  // then Ready uploads it and stores the resulting URL back into logoUrl.
  logoFile: File | null;
  logoPreviewUrl: string | null; // object URL for the preview <img>
  logoUrl: string | null;         // set after upload succeeds
  primaryColor: string;           // hex — defaults reflect the marketing brand
  secondaryColor: string;

  // Step 4 — optional website style prompt.
  websiteVibe: string;

  // Step 5 — plan selection. Free-tier + 14-day trial applies when planId
  // is 'free' or null; anything paid kicks off Paystack checkout after Ready.
  planId: PlanId | null;
  planCycle: BillingCycle;
};

type OnboardingStore = OnboardingData & {
  /** Highest step index the user has reached (for the stepper). */
  furthestStep: number;
  update: (patch: Partial<OnboardingData>) => void;
  reachStep: (index: number) => void;
  toggleModule: (id: string) => void;
  reset: () => void;
};

const initial: OnboardingData = {
  fullName: "",
  businessName: "",
  email: "",
  password: "",
  registrationId: null,
  description: "",
  vertical: null,
  verticalConfidence: 0,
  modules: [],
  logoFile: null,
  logoPreviewUrl: null,
  logoUrl: null,
  primaryColor: "#7C5CBF",
  secondaryColor: "#141414",
  websiteVibe: "",
  planId: null,
  planCycle: "monthly",
};

export const useOnboarding = create<OnboardingStore>((set) => ({
  ...initial,
  furthestStep: 1,
  update: (patch) => set(patch),
  reachStep: (index) =>
    set((s) => ({ furthestStep: Math.max(s.furthestStep, index) })),
  toggleModule: (id) =>
    set((s) => ({
      modules: s.modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
    })),
  reset: () => set({ ...initial, furthestStep: 1 }),
}));
