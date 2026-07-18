// The guided signup flow (v3 — picker-first, deterministic):
//   1. Account         — email + password (no OTP)
//   2. Vertical        — pick a business type + optional description refine
//   3. Brand           — logo + primary/secondary colours
//   4. Website vibe    — optional style prompt (Skip)
//   5. Plan            — pick a subscription tier (trial applies until charge)
//   6. Ready           — provisions tenant, uploads logo, patches brand
//
// v2 had a Processing + Review pair between description and vibe — the
// AI classifier needed both a "hide the latency" screen and a chance for
// the owner to correct the module set. The keyword classifier is instant
// and picks straight from the vertical's YAML, so those two screens are
// gone. Their page directories are left in the tree unlinked; safe to
// delete later.

export type OnboardingRoute = {
  slug: string;
  progressIndex: number; // 1..TOTAL_STEPS
  title: string;
  subtitle: string;
  /** When true the OnboardingChrome hides the back button (used for the
   *  processing step, which is a one-way transition). */
  hideBack?: boolean;
};

export const TOTAL_STEPS = 5;

export const FLOW: OnboardingRoute[] = [
  {
    slug: "create-account",
    progressIndex: 1,
    title: "Create your account",
    subtitle: "Free for 14 days. No credit card.",
  },
  {
    slug: "business-description",
    progressIndex: 2,
    title: "What kind of business?",
    subtitle: "Pick the closest match. You can refine with a description if you want a more customized setup.",
  },
  {
    slug: "brand",
    progressIndex: 3,
    title: "Add your brand",
    subtitle: "Upload your logo and pick your colours. You can change these later.",
  },
  {
    slug: "website-vibe",
    progressIndex: 4,
    title: "Website vibe",
    subtitle: "Describe how you want your site to feel. Optional — skip if unsure.",
  },
  {
    slug: "plan",
    progressIndex: 5,
    title: "Pick a plan",
    subtitle: "You get 14 days free. Change or cancel any time.",
  },
  {
    slug: "ready",
    progressIndex: 5,
    title: "You're all set",
    subtitle: "",
    hideBack: true,
  },
];

export const hrefFor = (slug: string) => `/onboarding/${slug}`;

export const routeBySlug = (slug: string) => FLOW.find((r) => r.slug === slug);

export const nextStep = (slug: string) => {
  const i = FLOW.findIndex((r) => r.slug === slug);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : undefined;
};

export const prevStep = (slug: string) => {
  const i = FLOW.findIndex((r) => r.slug === slug);
  if (i <= 0) return undefined;
  // Walking backwards skips any hideBack step so users can't land on the
  // processing screen via the back button.
  for (let j = i - 1; j >= 0; j--) {
    if (!FLOW[j].hideBack) return FLOW[j];
  }
  return undefined;
};
