import type { SectionProps } from "../../../types";

/** Text-only hero on a light background. Primary colour appears only on the
 *  headline + CTA — the rest of the section stays neutral so the section
 *  reads as "trust me" rather than "look at me". */
export function HeroMinimal({ variables, brand }: SectionProps) {
  const business = String(variables.businessName ?? "");
  const tagline = String(variables.tagline ?? business);
  const subtext = variables.subtext ? String(variables.subtext) : null;
  const ctaText = String(variables.ctaText ?? "Get in touch");
  const ctaLink = String(variables.ctaLink ?? "#");

  return (
    <section className="w-full min-h-[480px] flex flex-col justify-center px-10 md:px-20 py-20 bg-white border-b border-gray-100">
      {brand.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt={business}
          className="h-10 object-contain mb-12 self-start"
        />
      )}
      <h1
        style={{ color: brand.primaryColor }}
        className="text-5xl md:text-6xl font-bold max-w-2xl leading-tight"
      >
        {tagline}
      </h1>
      {subtext && (
        <p className="mt-6 text-gray-600 text-xl max-w-lg">{subtext}</p>
      )}
      <a
        href={ctaLink}
        style={{ backgroundColor: brand.primaryColor, color: "#FFFFFF" }}
        className="mt-10 self-start px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
      >
        {ctaText}
      </a>
    </section>
  );
}
