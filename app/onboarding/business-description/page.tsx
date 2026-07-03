"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";

const MIN_CHARS = 40;
const SLUG = "business-description";

// Step 2 — a single welcoming textarea. The AI classifier reads whatever
// the owner types. We keep this screen calm and human: no dropdowns, no
// AI framing, no cognitive tax.
export default function BusinessDescriptionStep() {
  const router = useRouter();
  const { description, update, reachStep } = useOnboarding();
  const [value, setValue] = useState(description);
  const [error, setError] = useState<string | null>(null);

  const chars = value.trim().length;
  const canContinue = chars >= MIN_CHARS;

  const onContinue = () => {
    if (!canContinue) {
      setError(`Please tell us a little more — at least ${MIN_CHARS} characters.`);
      return;
    }
    setError(null);
    update({ description: value.trim() });
    reachStep(2);
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
          Tell us about your business
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          What do you sell or do, and where are you based?
        </p>
      </header>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        placeholder="I run a small community pharmacy in Yaba, Lagos. We fill prescriptions, sell over-the-counter meds, and offer basic health advice to walk-in customers."
        className="w-full rounded-xl border border-white/10 bg-cinema-elev p-5 text-[16px] leading-relaxed text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <p className="mt-2 text-[13px] text-white/45">
        {chars < MIN_CHARS
          ? `A little more detail helps — ${MIN_CHARS - chars} characters to go.`
          : "Looks good. You can add more if you want."}
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={goBack}
          className="rounded-md border border-white/10 px-5 py-3 text-[14px] text-white/70 hover:border-white/20 hover:text-white"
        >
          Back
        </button>
        <Button
          onClick={onContinue}
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={!canContinue}
        >
          Set up my business
        </Button>
      </div>
    </div>
  );
}
