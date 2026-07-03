import { create } from "zustand";

// Onboarding wizard state, shared across the six step pages. Mirrors the
// Onboarding v2 flow: account → description → processing → review → vibe →
// ready. Fields fill in progressively; there is no OTP because email
// verification is deferred until after the tenant is created (banner in
// the dashboard).

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

  // Step 5 — optional website style prompt.
  websiteVibe: string;
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
  websiteVibe: "",
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
