import type { SectionProps } from "../../../types";

/** Row of testimonial cards on a soft-tinted background. Each testimonial
 *  is a {@code quote|attribution} pair. Attribution shows below the quote
 *  with a small primary-colour accent line — subtle but on-brand. */
export function TestimonialsCards({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "What our customers say");
  const raw = variables.testimonials;
  const rows = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  const items = rows.map(parseTestimonial).filter((t) => t.quote);

  if (items.length === 0) return null;

  return (
    <section
      className="w-full py-20 px-6"
      style={{
        // Very soft tint of the primary so the section reads as a distinct
        // band without needing another hardcoded background colour.
        backgroundColor: `${brand.primaryColor}0D`,
      }}
    >
      <h2
        style={{ color: brand.primaryColor }}
        className="mb-12 text-center text-3xl font-bold md:text-4xl"
      >
        {heading}
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <blockquote
            key={i}
            className="rounded-2xl border border-white bg-white p-6 shadow-sm"
          >
            <p className="text-[15px] leading-relaxed text-gray-700">
              &ldquo;{t.quote}&rdquo;
            </p>
            {t.attribution && (
              <footer className="mt-4 flex items-center gap-3">
                <span
                  className="h-6 w-0.5 rounded-full"
                  style={{ backgroundColor: brand.primaryColor }}
                />
                <cite className="not-italic text-[13px] font-semibold text-gray-900">
                  {t.attribution}
                </cite>
              </footer>
            )}
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function parseTestimonial(row: string): { quote: string; attribution: string } {
  const [quote = "", attribution = ""] = String(row).split("|").map((s) => s.trim());
  return { quote, attribution };
}
