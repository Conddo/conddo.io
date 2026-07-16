import type { SectionProps } from "../../../types";

/** Text left on the primary colour, image right. If the tenant has no hero
 *  image yet, the right side falls back to a soft gradient built from the
 *  brand's own colours — never an empty grey placeholder. */
export function HeroSplitImage({ variables, brand }: SectionProps) {
  const business = String(variables.businessName ?? "");
  const tagline = String(variables.tagline ?? business);
  const subtext = variables.subtext ? String(variables.subtext) : null;
  const ctaText = String(variables.ctaText ?? "Shop now");
  const ctaLink = String(variables.ctaLink ?? "#");
  const heroImage = variables.heroImage ? String(variables.heroImage) : null;

  const imageStyle = heroImage
    ? { backgroundImage: `url(${heroImage})` }
    : {
        backgroundImage: `linear-gradient(135deg, ${brand.primaryColor}88, ${brand.secondaryColor}44)`,
      };

  return (
    <section className="w-full min-h-[560px] grid grid-cols-1 md:grid-cols-2">
      <div
        style={{ backgroundColor: brand.primaryColor }}
        className="flex flex-col justify-center px-10 py-16"
      >
        {brand.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={business}
            className="h-10 object-contain mb-8 self-start"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {tagline}
        </h1>
        {subtext && (
          <p className="mt-4 text-white/80 text-lg max-w-sm">{subtext}</p>
        )}
        <a
          href={ctaLink}
          style={{ backgroundColor: brand.secondaryColor }}
          className="mt-8 self-start px-8 py-3 rounded-full text-white font-bold hover:opacity-90 transition-opacity"
        >
          {ctaText}
        </a>
      </div>
      <div className="min-h-[300px] bg-cover bg-center" style={imageStyle} />
    </section>
  );
}
