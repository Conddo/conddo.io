"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";

const SLUG = "business-description";

/** Vertical tiles shown to the tenant. Order = product priority: the four
 *  we sell hardest (retail, fashion, F&B, services) come first. "Something
 *  else" (general) is the last-resort catch-all — clicking it still gives
 *  the tenant a working baseline (crm/orders/payments) and lets them refine
 *  from Settings → Modules later. */
type VerticalTile = {
  id: string;
  label: string;
  blurb: string;
  emoji: string;
};

const VERTICALS: VerticalTile[] = [
  { id: "retail", label: "Retail", blurb: "Shops, supermarkets, kiosks, provisions.", emoji: "🛍️" },
  { id: "fashion", label: "Fashion", blurb: "Tailoring, boutiques, ready-to-wear.", emoji: "👗" },
  { id: "food-and-beverage", label: "Food & drink", blurb: "Restaurants, bukas, catering, cafes.", emoji: "🍲" },
  { id: "professional-services", label: "Services", blurb: "Consulting, agencies, coaching, legal.", emoji: "💼" },
  { id: "beauty-and-wellness", label: "Beauty & wellness", blurb: "Salons, spas, barbers, makeup.", emoji: "💇🏽‍♀️" },
  { id: "pharmacy", label: "Pharmacy", blurb: "Community pharmacies & chemists.", emoji: "💊" },
  { id: "logistics", label: "Logistics", blurb: "Delivery, courier, dispatch, haulage.", emoji: "🛵" },
  { id: "real-estate", label: "Real estate", blurb: "Estate agents, landlords, property.", emoji: "🏠" },
  { id: "music-studio", label: "Music studio", blurb: "Recording, mixing, sessions.", emoji: "🎧" },
  { id: "general", label: "Something else", blurb: "We'll set up the baseline for you.", emoji: "✨" },
];

/**
 * Step 2 (redesigned) — vertical picker with an optional refine.
 * Most tenants pick a tile and continue; the description textarea is only
 * for owners who want a more customized module set (surfaces `whatsapp.orders`,
 * `analytics`, etc. based on pain signals in what they type).
 */
export default function BusinessDescriptionStep() {
  const router = useRouter();
  const { vertical, description, update, reachStep } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(vertical);
  const [refineOpen, setRefineOpen] = useState<boolean>(!!description);
  const [descValue, setDescValue] = useState<string>(description);
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    if (!selected) {
      setError("Pick the business type that best fits you.");
      return;
    }
    setError(null);
    update({
      vertical: selected,
      description: refineOpen ? descValue.trim() : "",
    });
    reachStep(2);
    const next = nextStep(SLUG);
    if (next) router.push(hrefFor(next.slug));
  };

  const goBack = () => {
    const prev = prevStep(SLUG);
    if (prev) router.push(hrefFor(prev.slug));
  };

  return (
    <div className="w-full max-w-3xl">
      <header className="mb-7 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          What kind of business?
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          Pick the closest match. You can refine with a description if you want a more customized setup.
        </p>
      </header>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {VERTICALS.map((v) => {
          const active = selected === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelected(v.id)}
              className={
                "group flex flex-col items-start rounded-xl border p-4 text-left transition " +
                (active
                  ? "border-primary bg-primary/[0.08] ring-2 ring-primary/25"
                  : "border-white/10 bg-cinema-elev hover:border-white/25 hover:bg-white/[0.04]")
              }
              aria-pressed={active}
            >
              <span className="text-[24px] leading-none">{v.emoji}</span>
              <span className="mt-2 text-[15px] font-medium text-white">{v.label}</span>
              <span className="mt-1 text-[12px] leading-snug text-white/55">{v.blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setRefineOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white/85"
        >
          <ChevronDown
            size={14}
            className={"transition " + (refineOpen ? "rotate-180" : "")}
          />
          Want a more customized setup? Describe your business.
        </button>

        {refineOpen && (
          <div className="mt-3">
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              rows={5}
              placeholder="e.g. I run a small pharmacy in Yaba. Right now I track sales on a spreadsheet and take orders on WhatsApp — I want everything in one place."
              className="w-full rounded-xl border border-white/10 bg-cinema-elev p-4 text-[15px] leading-relaxed text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 text-[12px] text-white/45">
              Optional. Mentioning tools you use today (WhatsApp, spreadsheets, Excel) helps us pick better modules.
            </p>
          </div>
        )}
      </div>

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
          disabled={!selected}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
