import type { SectionProps } from "../../../types";

/**
 * Story-first About section. Eyebrow tag (kicker) in brand primary,
 * heading in brand secondary, and a generous body paragraph. Kept
 * minimal so the copy has room to breathe — every element is bounded
 * so long-form text stays readable.
 */
export function AboutSimple({ variables, brand }: SectionProps) {
  const eyebrow = variables.eyebrow ? String(variables.eyebrow) : null;
  const heading = String(variables.heading ?? "About");
  const body = String(variables.body ?? "");

  return (
    <section className="w-full bg-neutral-50 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && (
          <p
            style={{ color: brand.primaryColor }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.15em]"
          >
            {eyebrow}
          </p>
        )}
        <h2
          style={{ color: brand.secondaryColor }}
          className="text-3xl md:text-4xl font-bold leading-tight"
        >
          {heading}
        </h2>
        {body && (
          <div className="mt-6 space-y-4 text-base md:text-lg leading-relaxed text-neutral-700 whitespace-pre-line">
            {body}
          </div>
        )}
      </div>
    </section>
  );
}
