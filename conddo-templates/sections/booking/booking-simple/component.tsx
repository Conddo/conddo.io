import type { SectionProps } from "../../../types";

/** Full-bleed booking CTA. Primary colour background, secondary colour
 *  button. Deliberately simple — this section's job is one click, not
 *  information density. */
export function BookingSimple({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "Book your appointment");
  const subtext = variables.subtext ? String(variables.subtext) : null;
  const ctaText = String(variables.ctaText ?? "Book now");
  const bookingLink = String(variables.bookingLink ?? "#");

  return (
    <section
      style={{ backgroundColor: brand.primaryColor }}
      className="w-full py-24 px-6 text-center"
    >
      <h2 className="mx-auto max-w-2xl text-3xl md:text-5xl font-bold text-white leading-tight">
        {heading}
      </h2>
      {subtext && (
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{subtext}</p>
      )}
      <a
        href={bookingLink}
        style={{ backgroundColor: brand.secondaryColor }}
        className="mt-10 inline-block rounded-full px-10 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
      >
        {ctaText}
      </a>
    </section>
  );
}
