import type { SectionProps } from "../../../types";

/** Full-width centered hero on the primary colour. Logo top, headline center,
 *  CTA in secondary colour. The optional heroImage fades behind as ambient
 *  texture — kept behind the text so the CTA stays legible. */
export function HeroBoldCentered({ variables, brand }: SectionProps) {
  const business = String(variables.businessName ?? "");
  const tagline = String(variables.tagline ?? business);
  const subtext = variables.subtext ? String(variables.subtext) : null;
  const ctaText = String(variables.ctaText ?? "Get started");
  const ctaLink = String(variables.ctaLink ?? "#");
  const heroImage = variables.heroImage ? String(variables.heroImage) : null;

  return (
    <section
      style={{ backgroundColor: brand.primaryColor }}
      className="relative w-full min-h-[560px] flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden"
    >
      {brand.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt={business}
          className="h-12 object-contain mb-10"
        />
      )}
      <h1 className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight">
        {tagline}
      </h1>
      {subtext && (
        <p className="mt-6 text-lg text-white/80 max-w-xl">{subtext}</p>
      )}
      <a
        href={ctaLink}
        style={{ backgroundColor: brand.secondaryColor }}
        className="mt-10 inline-block px-10 py-4 rounded-full text-white font-bold text-lg hover:opacity-90 transition-opacity"
      >
        {ctaText}
      </a>
      {heroImage && (
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      )}
    </section>
  );
}
