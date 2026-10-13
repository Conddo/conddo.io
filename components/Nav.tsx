"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/marketing/Wordmark";
import { BRAND_NAME } from "@/lib/brand";

/** Marketing nav links. /product is the deep-dive (so we don't clash with
 *  the dashboard's auth-gated /features), /businesses is "Solutions" in
 *  the footer's language but stays "Businesses" in the header for
 *  scannability. */
const links: { label: string; href: string }[] = [
  { label: "Our Ecosystem", href: "/#ecosystem" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

/** Cinematic floating glass header — a single rounded-full capsule that
 *  floats above the cinematic surface, well clear of the viewport top edge
 *  so it reads as actively detached, not "stuck to the top".
 *
 *  Layout inside the capsule:
 *    [logo] [nav links centered] [Sign in] [Get started]
 *
 *  The whole capsule shrinks slightly on scroll and the backdrop-blur
 *  intensifies — so the header settles into a denser glass state when
 *  the user has moved past the hero. */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 pointer-events-none">
      {/* Outer wrapper holds the top spacing — the capsule itself never
          touches the viewport edge, which is what makes it read as
          "floating" rather than as a sticky bar. */}
      <div
        className={`transition-all duration-300 ${
          scrolled ? "pt-3 md:pt-4" : "pt-5 md:pt-7"
        } pb-1 px-3 md:px-6`}
      >
        <div className="max-w-container mx-auto">
          {/* The single floating capsule — rounded-full, glass, slight
              inner gap between the three sections (brand / nav / utility).
              On mobile the center nav collapses; the utility group shrinks
              to a hamburger that drops a glass panel below. */}
          <div
            className={`pointer-events-auto relative flex items-center justify-between gap-2 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 ${
              scrolled
                ? "h-12 md:h-13 pl-3 pr-1.5 md:pl-4 md:pr-2"
                : "h-14 md:h-15 pl-4 pr-2 md:pl-5 md:pr-2.5"
            }`}
          >
            {/* Brand — inline wordmark (no PNG plate). */}
            <Link
              href="/"
              aria-label={`${BRAND_NAME} home`}
              className="inline-flex items-center shrink-0"
            >
              <Wordmark tone="light" />
            </Link>

            {/* Center nav — absolute-centered inside the capsule so it
                doesn't push the brand/utility to the edges. Hidden under
                md; the hamburger handles mobile. */}
            <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
              <div className="flex items-center gap-0.5">
                {links.map((l) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex items-center px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-colors rounded-full ${
                        active ? "text-white" : "text-white/65 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-full bg-white/12"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative">{l.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Utility */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/login"
                className="inline-flex items-center px-3.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/#ecosystem"
                className={`group inline-flex items-center gap-1.5 rounded-full bg-white text-ink font-medium tracking-tight transition-all hover:bg-white/90 hover:gap-2 ${
                  scrolled ? "px-3.5 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13px]"
                }`}
              >
                Explore Our Solutions
                <ArrowRight size={13} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden ${
                scrolled ? "h-9 w-9" : "h-10 w-10"
              }`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — glass panel that drops below the floating capsule. */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto md:hidden px-3 mt-2"
        >
          <div className="max-w-container mx-auto">
            <div className="rounded-3xl border border-white/10 bg-[#0a0a0c]/95 backdrop-blur-2xl p-3 shadow-2xl">
              <ul className="flex flex-col gap-1">
                {links.map((l) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] transition-colors ${
                          active
                            ? "bg-white/10 font-medium text-white"
                            : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {l.label}
                        <ArrowRight size={14} className={active ? "text-primary-light" : "text-white/30"} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="my-3 border-t border-white/10" />
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.04]"
                >
                  Sign in
                </Link>
                <Link
                  href="/#ecosystem"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[14px] font-medium text-ink"
                >
                  <Sparkles size={13} />
                  Explore Our Solutions
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
