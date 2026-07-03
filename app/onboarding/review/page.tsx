"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";

const SLUG = "review";
const CONFIDENCE_LOW = 0.7;

// The closed list must match backend/conddo-core/src/main/resources/verticals/*.yml.
// Any id shipped here that the BE doesn't recognise will be resolved to the
// "general" catch-all when the tenant is created — a silent misclassification.
const VERTICAL_LABELS: Record<string, string> = {
  pharmacy: "Pharmacy",
  fashion: "Fashion",
  "music-studio": "Music Studio",
  retail: "Retail",
  logistics: "Logistics",
  "professional-services": "Consulting & Services",
  "food-and-beverage": "Food & Beverage",
  "beauty-and-wellness": "Beauty & Wellness",
  general: "General Business",
};

const humanizeModule = (id: string): string => {
  const suffix = id.includes(".") ? id.split(".").slice(1).join(".") : id;
  return suffix
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Step 4 — AI proposes, human confirms. The most important screen in the
// flow: nothing is activated without the owner ticking the checklist.
// Left column: toggleable module list + vertical label.
// Right column: live preview of the platform (a stylised card, not an
//               iframe — real preview happens after publish).
export default function ReviewStep() {
  const router = useRouter();
  const { businessName, description, modules, vertical, verticalConfidence, update, toggleModule, reachStep } =
    useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(businessName || "");
  const [verticalOverride, setVerticalOverride] = useState(vertical ?? "");

  // Gate the primary CTA until the user has demonstrably reviewed — 500ms
  // after mount. Prevents an accidental double-click straight through.
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReviewed(true), 500);
    return () => clearTimeout(t);
  }, []);

  const enabledCount = modules.filter((m) => m.enabled).length;
  const lowConfidence = verticalConfidence > 0 && verticalConfidence < CONFIDENCE_LOW;

  const verticalLabel = VERTICAL_LABELS[verticalOverride] ?? "General Business";

  const onConfirm = async () => {
    setError(null);
    if (!name.trim()) return setError("Give your business a name so we can label your dashboard.");
    if (enabledCount === 0) return setError("Keep at least one tool enabled to continue.");

    // Persist for the next step; the actual /register/complete call
    // happens on the Ready screen once the (optional) vibe step is done
    // so users can still edit here after choosing a vibe.
    setSubmitting(true);
    try {
      update({ businessName: name.trim(), vertical: verticalOverride || vertical });
      reachStep(4);
      const next = nextStep(SLUG);
      if (next) router.push(hrefFor(next.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    const prev = prevStep(SLUG);
    if (prev) router.push(hrefFor(prev.slug));
  };

  if (modules.length === 0) {
    // Shouldn't happen — processing always populates modules — but if the
    // user deep-links here we bounce to description rather than dead-end.
    router.replace(hrefFor("business-description"));
    return null;
  }

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6">
        <h1 className="text-[26px] leading-tight tracking-[-0.01em] md:text-[30px]">
          We think you run a <span className="text-primary-light">{verticalLabel.toLowerCase()}</span> business
        </h1>
        <p className="mt-2 text-[15px] text-white/65">
          Here&apos;s what we&apos;ve set up for you. Add or remove any tool before you continue.
        </p>
      </header>

      {lowConfidence && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-[14px] text-amber-100">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>We&apos;re not entirely sure about some of this. Please check the selections below and update your business type if needed.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        {/* Left — controls */}
        <div className="space-y-5">
          <section>
            <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65">
              Business name
            </label>
            <input
              className="h-11 w-full rounded-md border border-white/10 bg-cinema-elev px-3.5 text-[15px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
              placeholder="Amaka Pharmacy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </section>

          <section>
            <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65">
              Business type
            </label>
            <select
              className="h-11 w-full rounded-md border border-white/10 bg-cinema-elev px-3 text-[15px] text-white focus:border-primary-light focus:outline-none"
              value={verticalOverride}
              onChange={(e) => setVerticalOverride(e.target.value)}
            >
              {Object.entries(VERTICAL_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-[12px] font-medium uppercase tracking-[0.06em] text-white/65">
                Tools
              </label>
              <span className="text-[13px] text-white/45">{enabledCount} of {modules.length} enabled</span>
            </div>
            <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-cinema-elev">
              {modules.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-white">{humanizeModule(m.id)}</p>
                    <p className="mt-0.5 truncate text-[13px] text-white/55">{m.reason}</p>
                  </div>
                  <button
                    onClick={() => toggleModule(m.id)}
                    role="switch"
                    aria-checked={m.enabled}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      m.enabled ? "bg-primary" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        m.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right — preview */}
        <aside className="hidden md:block">
          <div className="sticky top-6 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-white/40">
              Live preview
            </p>
            <div className="rounded-lg border border-white/10 bg-cinema-base p-4">
              <p className="text-[16px] font-semibold text-white">{name || "Your business"}</p>
              <p className="mt-0.5 text-[12px] text-white/50">{verticalLabel}</p>
              <div className="mt-4 space-y-1.5">
                {modules.filter((m) => m.enabled).slice(0, 6).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-[13px] text-white/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
                    {humanizeModule(m.id)}
                  </div>
                ))}
                {enabledCount > 6 && (
                  <p className="pt-1 text-[12px] text-white/40">+ {enabledCount - 6} more</p>
                )}
              </div>
            </div>
            {description && (
              <p className="mt-4 line-clamp-3 text-[12px] italic text-white/45">
                &ldquo;{description}&rdquo;
              </p>
            )}
          </div>
        </aside>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          onClick={goBack}
          className="rounded-md border border-white/10 px-5 py-3 text-[14px] text-white/70 hover:border-white/20 hover:text-white"
        >
          Back
        </button>
        <Button
          onClick={onConfirm}
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={submitting || !reviewed}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? "Saving…" : "Looks good, let's go"}
        </Button>
      </div>
    </div>
  );
}
