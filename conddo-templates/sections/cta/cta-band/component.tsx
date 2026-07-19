import type { SectionProps } from "../../../types";
import { RingMotif } from "../../../primitives/RingMotif";

/**
 * Full-width closing CTA band. Bright gold background per the brief; the
 * only place the primary colour covers the frame (gold is otherwise used
 * sparingly). Ring watermark set in charcoal fades in behind the copy.
 */
export function CtaBand({ variables, brand }: SectionProps) {
  const headline = String(variables.headline ?? "");
  const subtext = variables.subtext ? String(variables.subtext) : null;
  const ctaText = variables.ctaText ? String(variables.ctaText) : null;
  const ctaLink = variables.ctaLink ? String(variables.ctaLink) : "#";

  return (
    <section
      style={{
        position: "relative",
        background: brand.primaryColor,
        color: brand.secondaryColor,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-6%",
          bottom: "-30%",
          color: brand.secondaryColor,
          pointerEvents: "none",
        }}
      >
        <RingMotif size={520} count={10} strokeWidth={1.25} opacity={0.09} />
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 1000,
          margin: "0 auto",
          padding: "clamp(72px, 10vw, 112px) 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.15,
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: brand.secondaryColor,
          }}
        >
          {headline}
        </h2>
        {subtext && (
          <p
            style={{
              margin: 0,
              marginTop: 16,
              fontSize: "clamp(15px, 1.5vw, 17px)",
              lineHeight: 1.6,
              color: "#333336",
              maxWidth: 620,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {subtext}
          </p>
        )}
        {ctaText && (
          <div style={{ marginTop: 36 }}>
            <a
              href={ctaLink}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "16px 32px",
                borderRadius: 999,
                background: "#FFFFFF",
                color: brand.secondaryColor,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.01em",
                textDecoration: "none",
                boxShadow: "0 2px 12px rgba(31,31,34,0.14)",
                transition: "transform 180ms ease",
              }}
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
