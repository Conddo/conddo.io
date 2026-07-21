import Link from "next/link";
import { Wordmark } from "@/components/marketing/Wordmark";
import { BRAND_NAME, supportEmail, careersEmail } from "@/lib/brand";

/** Minimal three-column footer + brand block. Same operations-platform tone
 *  as the new home — short, no padding. Tagline + lede sit on the brand
 *  side; everything else is direct nav. */
const groups: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Overview",  href: "/product" },
      { label: "Features",  href: "/product#platform" },
      { label: "Solutions", href: "/businesses" },
      { label: "Pricing",   href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",   href: "/about" },
      { label: "Contact", href: `mailto:${supportEmail()}` },
      { label: "Careers", href: `mailto:${careersEmail()}` },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy",  href: "/privacy" },
      { label: "Terms",    href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="container-x py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand column — logo + the operations-platform positioning. */}
          <div>
            <Link href="/" aria-label={`${BRAND_NAME} home`} className="inline-block">
              <Wordmark tone="light" className="text-[18px] [&_span:last-child]:text-[18px]" />
            </Link>
            <p className="mt-5 text-pretty text-[14px] leading-relaxed text-white/70">
              The operating system for modern businesses.
            </p>
            <p className="mt-2 text-pretty text-[13px] leading-relaxed text-white/45">
              One platform for customers, payments, operations, and growth.
            </p>
          </div>

          {/* Link columns — Product / Company / Legal. */}
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

        {/* Bottom bar — copyright + closing tag. */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-white/40">
            © 2026 Conddo.io
          </p>
          <p className="text-[12.5px] text-white/40">
            Built for businesses that are growing.
          </p>
        </div>
      </div>
    </footer>
  );
}
