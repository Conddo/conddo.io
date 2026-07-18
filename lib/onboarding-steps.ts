// The guided signup flow. Per the Onboarding v2 spec:
//   1. Account       — email + password (no OTP)
//   2. Description   — one big textarea, free-text
//   3. Processing    — AI classification runs, cycling copy
//   4. Review        — AI proposes modules; owner confirms
//   5. Website vibe  — optional style prompt (Skip for now)
//   6. Ready         — success + banner about verifying email later
//
// The FLOW list drives OnboardingChrome's progress dots. "processing" has
// no back button and no visible progress advance — it lives between
// steps 2 and 4 but reuses step 2's progress index so the dots feel
// stable.

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
    slug: "processing",
    progressIndex: 2,
    title: "",
    subtitle: "",
    hideBack: true,
  },
  {
    slug: "review",
    progressIndex: 3,
    title: "Here's what we've set up for you",
    subtitle: "Review the tools we've selected. Add or remove any before you continue.",
  },
  {
    slug: "website-vibe",
    progressIndex: 4,
    title: "One more thing",
    subtitle: "Describe the vibe you want for your website. This step is optional.",
  },
  {
    slug: "ready",
    progressIndex: 5,
    title: "You're all set",
    subtitle: "",
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
