import type { SectionProps } from "../../../types";

/**
 * Full-width testimonial on brand secondary, meant to feel like a pause
 * point mid-scroll. Big quote in white, gold quotation glyph, brand
 * primary attribution — reads like an editorial pull quote.
 */
export function TestimonialCentered({ variables, brand }: SectionProps) {
  const quote = String(variables.quote ?? "");
  const attribution = variables.attribution ? String(variables.attribution) : null;
  const role = variables.role ? String(variables.role) : null;
  if (!quote) return null;
  return (
    <section
      style={{
        background: brand.secondaryColor,
        color: "#FFFFFF",
        padding: "clamp(72px, 11vw, 128px) 24px",
      }}
    >
      <figure
        style={{
          maxWidth: 860,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            fontFamily: "Georgia, 'Playfair Display', serif",
            fontSize: 64,
            lineHeight: 0.6,
            color: brand.primaryColor,
            marginBottom: 8,
          }}
        >
          &ldquo;
        </span>
        <blockquote
          style={{
            margin: 0,
            fontSize: "clamp(22px, 2.6vw, 30px)",
            lineHeight: 1.4,
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "-0.005em",
          }}
        >
          {quote}
        </blockquote>
        {(attribution || role) && (
          <figcaption
            style={{
              marginTop: 32,
              display: "inline-flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {attribution && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: brand.primaryColor,
                }}
              >
                {attribution}
              </span>
            )}
            {role && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {role}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
