"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, type ModuleSuggestion } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";
import { classifyBusiness, type ClassifiedModule } from "@/lib/api/account";

const PHRASES = [
  "Reading your business description…",
  "Selecting the right tools…",
  "Configuring your platform…",
];
const PHRASE_INTERVAL_MS = 1400;
const SLUG = "processing";

// Step 3 — the AI classification runs here. Keeps the user on the screen
// for a considered 2-5s (typical Anthropic latency) with cycling copy.
// If classify() fails entirely we fall back to a sensible default set of
// modules so the flow never dead-ends (per the spec's design principles).
export default function ProcessingStep() {
  const router = useRouter();
  const { registrationId, description, modules, update, reachStep } = useOnboarding();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(
      () => setPhraseIndex((i) => (i + 1) % PHRASES.length),
      PHRASE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Guard against React 18 StrictMode double-invocation double-firing the
    // classify request; the ref persists across the extra render.
    if (startedRef.current) return;
    startedRef.current = true;

    // If we already have modules cached (user hit back then forward), skip
    // the classify roundtrip and land on review immediately.
    if (modules.length > 0) {
      const next = nextStep(SLUG);
      if (next) router.replace(hrefFor(next.slug));
      return;
    }

    if (!registrationId || !description) {
      router.replace(hrefFor("business-description"));
      return;
    }

    (async () => {
      try {
        const result = await classifyBusiness({
          registrationId,
          description,
        });
        const toModule = (m: ClassifiedModule, enabled: boolean): ModuleSuggestion => ({
          id: m.id,
          confidence: m.confidence,
          reason: m.reason,
          enabled,
        });
        const recommendedIds = new Set(result.recommended.map((m) => m.id));
        // Merge: every module ranked, but only `recommended` are toggled on.
        const merged: ModuleSuggestion[] = result.scores.map((m) =>
          toModule(m, recommendedIds.has(m.id)),
        );
        // Trust the backend's chosen vertical. Never guess from module id
        // prefixes — that heuristic used to leak consultancies onto retail
        // dashboards when their top module id had no dot in it.
        update({
          modules: merged,
          vertical: result.vertical,
          verticalConfidence: result.verticalConfidence,
        });
        reachStep(3);
      } catch {
        // Fallback: seed the vertical-agnostic "general" bundle so the review
        // screen has something to render even on a classifier outage. The
        // owner can add/remove freely; the BE will treat "general" as the
        // catch-all business tools set. NEVER fall back to a real vertical
        // (retail, pharmacy, etc.) — that misrepresents unclassified signups.
        update({
          modules: [
            { id: "crm", confidence: 0.5, reason: "Customer records", enabled: true },
            { id: "orders", confidence: 0.5, reason: "Orders & invoicing", enabled: true },
            { id: "payments", confidence: 0.5, reason: "Payments", enabled: true },
          ],
          vertical: "general",
          verticalConfidence: 0.5,
        });
        reachStep(3);
      } finally {
        // Small floor delay so the screen doesn't blink if the API returns
        // instantly (cached / dev stub) — feels considered, not glitchy.
        setTimeout(() => {
          const next = nextStep(SLUG);
          if (next) router.replace(hrefFor(next.slug));
        }, 1500);
      }
    })();
  }, [registrationId, description, modules.length, router, update, reachStep]);

  return (
    <div className="w-full max-w-md text-center">
      <div className="mx-auto mb-8 h-14 w-14">
        <div className="h-full w-full animate-spin rounded-full border-2 border-white/10 border-t-primary" />
      </div>
      <p
        key={phraseIndex}
        className="animate-in fade-in text-[17px] text-white/85"
        style={{ animationDuration: "400ms" }}
      >
        {PHRASES[phraseIndex]}
      </p>
      <p className="mt-4 text-[13px] text-white/45">
        This usually takes a few seconds.
      </p>
    </div>
  );
}
