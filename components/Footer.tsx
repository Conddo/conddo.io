import Link from "next/link";
import { Wordmark } from "@/components/marketing/Wordmark";
import { BRAND_NAME, supportEmail, careersEmail } from "@/lib/brand";

/** Minimal three-column footer + brand block. Same operations-platform tone
 *  as the new home — short, no padding. Tagline + lede sit on the brand
 *  side; everything else is direct nav. */
const groups: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Conddo Enterprise", href: "/enterprise" },
      { label: "Conddo App", href: "/conddo-app" },
      { label: "Conddo Commute", href: "/commute" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Conddo", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink border-t border-white/5">
      <div className="container-x py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand column */}
          <div>
            <Link href="/" aria-label={`${BRAND_NAME} home`} className="inline-block">
              <Wordmark tone="light" className="text-[18px]" />
            </Link>
            <p className="mt-5 text-pretty text-[14px] leading-relaxed text-white/70">
              Practical technology for business, work and everyday life.
            </p>
          </div>

          {/* Link columns */}
          {groups.map((g) => (
            <div key={g.heading}>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-white/40">
                {g.heading}
              </p>
              <ul className="space-y-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-white/40">
            © 2026 Conddo. All rights reserved.
          </p>
          <p className="text-[12.5px] text-white/40">
            One ecosystem. Purpose-built solutions.
          </p>
        </div>
      </div>
    </footer>
  );
}
