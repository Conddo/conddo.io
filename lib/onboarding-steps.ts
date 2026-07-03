// The guided signup flow (PRD §15), built from the Stitch designs.
//
// There are 6 *routes* but only 5 numbered *progress steps* — email OTP
// verification (verify-email) is a sub-step of step 1 (account creation), so
// it shares progressIndex 1. This matches the Stitch screens, which label the
// flow "Step X of 5" (Create account = 1 … Ready = 5).

export type OnboardingRoute = {
  slug: string;
  progressIndex: number; // 1..TOTAL_STEPS
  title: string;
  subtitle: string;
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
    slug: "verify-email",
    progressIndex: 1,
    title: "Verify your email",
    subtitle: "Enter the 4-digit code we emailed you.",
  },
  {
    slug: "business-type",
    progressIndex: 2,
    title: "What kind of business do you run?",
    subtitle: "We set everything up based on your answer.",
  },
  {
    slug: "business-profile",
    progressIndex: 3,
    title: "Tell us about your business",
    subtitle: "This builds your website automatically based on the details you provide.",
  },
  {
    slug: "choose-plan",
    progressIndex: 4,
    title: "Choose your plan.",
    subtitle: "14 days free on every plan. No credit card needed.",
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
  return i > 0 ? FLOW[i - 1] : undefined;
};
