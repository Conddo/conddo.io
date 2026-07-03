"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";

const SLUG = "website-vibe";

// Step 5 — optional. A single freeform prompt that seeds the website
// generator's theme/component selection. Skip is a first-class citizen:
// the button sits alongside the primary CTA, not buried in fine print.
export default function WebsiteVibeStep() {
  const router = useRouter();
  const { websiteVibe, update, reachStep } = useOnboarding();
  const [value, setValue] = useState(websiteVibe);

  const advance = (vibe: string) => {
    update({ websiteVibe: vibe });
    reachStep(5);
    const next = nextStep(SLUG);
    if (next) router.push(hrefFor(next.slug));
  };

  const goBack = () => {
    const prev = prevStep(SLUG);
    if (prev) router.push(hrefFor(prev.slug));
  };

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-7 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          One more thing
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          Describe the vibe you want for your website. For example: clean and professional, bold and colourful, minimal.
        </p>
      </header>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        placeholder="Warm and trustworthy. Green accents. Photos of real customers."
        className="w-full rounded-xl border border-white/10 bg-cinema-elev p-5 text-[16px] leading-relaxed text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <p className="mt-2 text-[13px] text-white/45">
        You can change this any time from your dashboard.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={goBack}
          className="rounded-md border border-white/10 px-5 py-3 text-[14px] text-white/70 hover:border-white/20 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={() => advance("")}
          className="rounded-md border border-white/10 px-5 py-3 text-[14px] text-white/70 hover:border-white/20 hover:text-white"
        >
          Skip for now
        </button>
        <Button
          onClick={() => advance(value.trim())}
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={value.trim().length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
