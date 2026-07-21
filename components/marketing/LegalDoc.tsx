import type { ReactNode } from "react";

/** Shared prose wrapper for /privacy and /terms. Keeps the marketing dark
 *  surface, centers the reading column, and applies consistent legal-doc
 *  typography without pulling in @tailwindcss/typography. */
export function LegalDoc({
  title,
  effective,
  updated,
  children,
}: {
  title: string;
  effective: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-28 pb-24 px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 border-b border-white/10 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Conddo</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-4 text-sm text-white/60">
            Effective date: {effective} · Last updated: {updated}
          </p>
        </header>
        <article className="legal-prose text-white/80 leading-relaxed">
          {children}
        </article>
      </div>
      <style>{`
        .legal-prose h2 {
          color: #fff;
          font-size: 1.35rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }
        .legal-prose h3 {
          color: rgba(255,255,255,0.92);
          font-size: 1.05rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .legal-prose p { margin: 0.75rem 0; }
        .legal-prose ul {
          margin: 0.75rem 0 1rem;
          padding-left: 1.25rem;
          list-style: disc;
        }
        .legal-prose li { margin: 0.35rem 0; }
        .legal-prose a { color: #c9b3ff; text-decoration: underline; }
        .legal-prose strong { color: #fff; font-weight: 600; }
        .legal-prose hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 2.5rem 0;
        }
      `}</style>
    </div>
  );
}
