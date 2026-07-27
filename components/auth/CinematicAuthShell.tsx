"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Wordmark } from "@/components/marketing/Wordmark";
import { useTheme } from "@/components/app/ThemeProvider";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

/** Wraps every auth surface (login, signup, onboarding step, accept-invite,
 *  forgot/reset password) with the cinematic dark shell so the conversion
 *  funnel matches the marketing site.
 *
 *  Three layers of motion run on every auth view:
 *    - Three slow-bobbing gradient pills in the background (12s loop, each
 *      offset) for ambient cinematic motion.
 *    - The AuthCard fades + slides up on mount via a single spring ease.
 *    - Form fields inside the card stagger in via the
 *      AuthFieldGroup variants below.
 *
 *  Sets the html background to cinema-base on mount + restores on unmount
 *  (same pattern as MarketingShell). */
export function CinematicAuthShell({
  back,
  footer,
  children,
}: {
  /** Optional back link rendered top-right of the shell — e.g. for
   *  onboarding sub-steps that should let the user return to a prior step. */
  back?: { label: string; href: string };
  /** Optional small text rendered under the form card. */
  footer?: ReactNode;
  children: ReactNode;
}) {
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
    <div className={`app-shell relative min-h-screen bg-cinema-base text-white overflow-hidden ${themeClass}`}>
      {/* Ambient floating gradient pills — subtle continuous motion behind
          the form. Same family as the marketing hero's shapes, but quieter
          and fewer so the form stays the visual focus. */}
      <AmbientShapes />

      <div className="marketing-hero-dark-grid absolute inset-0 opacity-25 pointer-events-none" aria-hidden />

      {/* Top bar — wordmark + optional back link + theme toggle. */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-x flex items-center justify-between pt-6 md:pt-8">
          <Link href="/" aria-label={`${BRAND_NAME} home`} className="inline-flex items-center">
            <Wordmark tone={mode === "light" ? "dark" : "light"} />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={mode === "dark" ? "Light mode" : "Dark mode"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 backdrop-blur transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {back && (
              <Link
                href={back.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-medium text-[12.5px] text-white/75 backdrop-blur transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <ArrowLeft size={13} />
                {back.label}
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Centered content column. The global CinematicTransition already
          fades + un-blurs the page; this inner motion adds a longer
          delay so the card emerges AFTER the page-level entrance has
          settled, giving the funnel a layered "first the surface,
          then the form" beat instead of competing motion. */}
      <div className="relative container-x flex min-h-[calc(100svh-80px)] items-center justify-center py-12 md:py-16">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
          {footer && (
            <motion.div
              className="mt-8 text-center text-[12.5px] text-white/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.0 }}
            >
              {footer}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/** Three slow-bobbing gradient pills behind the auth surface. Each
 *  enters with a long ease-out, then bobs forever on its own delay so
 *  the cluster never reads as synchronized. Pure decoration — no
 *  pointer events, no semantic meaning. */
function AmbientShapes() {
  const shapes: Array<{
    delay: number;
    width: number;
    height: number;
    rotate: number;
    gradient: string;
    className: string;
  }> = [
    {
      delay: 0.2,
      width: 500,
      height: 120,
      rotate: 14,
      gradient: "from-primary/[0.18]",
      className: "left-[-12%] top-[10%]",
    },
    {
      delay: 0.4,
      width: 380,
      height: 100,
      rotate: -12,
      gradient: "from-rose-500/[0.12]",
      className: "right-[-8%] top-[55%]",
    },
    {
      delay: 0.6,
      width: 240,
      height: 70,
      rotate: -20,
      gradient: "from-violet-400/[0.12]",
      className: "left-[15%] bottom-[8%]",
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -120, rotate: s.rotate - 14 }}
          animate={{ opacity: 1, y: 0, rotate: s.rotate }}
          transition={{
            duration: 2.2,
            delay: s.delay,
            ease: [0.23, 0.86, 0.39, 0.96],
            opacity: { duration: 1.2 },
          }}
          className={cn("absolute", s.className)}
        >
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.4,
            }}
            style={{ width: s.width, height: s.height }}
            className="relative"
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-gradient-to-r to-transparent backdrop-blur-[2px] border-2 border-white/[0.12]",
                s.gradient,
              )}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/** Glass card primitive used by every auth form. Caller renders its own
 *  heading + form inside. Consistent padding + border across surfaces so
 *  the funnel reads as one shell rather than seven look-alikes. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="cinema-tile p-8 md:p-9">
      <motion.h1
        className="text-balance text-[28px] md:text-[32px] font-semibold tracking-tighter text-white leading-[1.1]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          className="mt-2.5 text-[14.5px] text-white/55 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        className="mt-7"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.85,
            },
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Wraps a single auth form row (input field, button, divider, etc.)
 *  so it picks up the staggered entrance from the parent AuthCard's
 *  variants. Caller just wraps each row in <AuthRow>…</AuthRow>. */
export function AuthRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Field building blocks — auth pages compose these so every input has
 *  identical chrome + spacing. Inputs now use a focus-within glow ring
 *  via a wrapper class so we don't have to apply ring utilities on each
 *  consumer. */
export const fieldLabelCls =
  "mb-1.5 block text-[11px] font-medium uppercase tracking-loose text-white/55";

export const fieldInputCls =
  "h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white placeholder:text-white/35 transition-all duration-200 focus:border-primary-light/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-light/20";

export const fieldHelpCls = "mt-1.5 text-[12.5px] text-white/50";

export const fieldErrorCls = "mt-1.5 text-[12.5px] text-rose-300";

/** Primary submit button — white pill with hover shimmer + arrow that
 *  translates on hover. Replaces the manual button markup each page
 *  was writing so submit states are consistent. */
export function AuthSubmitButton({
  loading,
  loadingLabel,
  children,
  disabled,
  type = "submit",
}: {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-3 text-[14.5px] font-medium text-ink transition-all hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {/* Shimmer overlay — a wide gradient strip that sweeps across the
          button on hover. Only visible on hover; muted opacity. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-light/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative inline-flex items-center gap-2">
        {loading ? loadingLabel ?? "Working…" : children}
      </span>
    </button>
  );
}
