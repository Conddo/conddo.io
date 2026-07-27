"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Wordmark } from "@/components/marketing/Wordmark";
import { useTheme } from "@/components/app/ThemeProvider";
import { routeBySlug, TOTAL_STEPS } from "@/lib/onboarding-steps";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Onboarding chrome — cinematic dark version. Shared shell for every
 * step in the Onboarding v2 flow (create-account → business-description →
 * processing → review → website-vibe → ready). Matches the auth flow +
 * marketing surface so the conversion path reads as one continuous
 * experience.
 *
 * Sets the html background to cinema-base on mount + restores on
 * unmount, same pattern as MarketingShell and CinematicAuthShell.
 */
export function OnboardingChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  const current = routeBySlug(slug)?.progressIndex ?? 1;
  const { mode, toggle: toggleTheme } = useTheme();
  const themeClass = mode === "light" ? "theme-light" : "theme-dark";

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = mode === "light" ? "#f8f8f6" : "#0a0a0c";
    return () => {
      html.style.backgroundColor = prev;
    };
  }, [mode]);

  return (
    <div className={`app-shell relative flex min-h-screen flex-col overflow-hidden bg-cinema-base text-white ${themeClass}`}>
      {/* Ambient cinematic glow. */}
      <div className="absolute inset-0 bg-cinema-glow opacity-90 pointer-events-none" aria-hidden />
      <div className="marketing-hero-dark-grid absolute inset-0 opacity-30 pointer-events-none" aria-hidden />

      {/* Header — wordmark + step counter + theme toggle + Save & Exit. */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-5 md:px-8 md:py-6">
        <Link href="/" aria-label={`${BRAND_NAME} home`} className="inline-flex items-center">
          <Wordmark tone={mode === "light" ? "dark" : "light"} />
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={mode === "dark" ? "Light mode" : "Dark mode"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 backdrop-blur transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <span className="font-mono text-[11px] uppercase tracking-loose text-white/45">
            Step {current} of {TOTAL_STEPS}
          </span>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-medium text-[12.5px] text-white/75 backdrop-blur transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            Save &amp; Exit
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 flex grow flex-col items-center px-6 py-8 md:py-12">
        <div className="mx-auto flex w-full max-w-container flex-col items-center">
          {/* Progress bars — primary-light track for active, primary/30 for
              done, white/10 for upcoming so the gradient reads as forward
              motion against the dark surface. */}
          <nav aria-label="Progress" className="mb-10 flex gap-2 md:mb-14">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => {
              const done = n < current;
              const active = n === current;
              return (
                <span
                  key={n}
                  className={`h-1.5 rounded-full transition-all ${
                    active
                      ? "w-12 bg-primary-light"
                      : done
                        ? "w-8 bg-primary-light/40"
                        : "w-8 bg-white/10"
                  }`}
                />
              );
            })}
          </nav>

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/[0.06] py-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-loose text-white/35">
          © 2026 Conddo.io
        </p>
      </footer>
    </div>
  );
}
