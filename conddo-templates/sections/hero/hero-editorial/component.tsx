import type { SectionProps } from "../../../types";
import { RingMotif } from "../../../primitives/RingMotif";

/**
 * Editorial hero for services / professional / PR businesses.
 *
 * <p>Design intent (per brand brief):
 * <ul>
 *   <li>Off-white background carries 70% of the space; the copy earns the ink.</li>
 *   <li>Small-caps eyebrow with wide tracking to echo the "PUBLIC RELATIONS"
 *       wordmark treatment.</li>
 *   <li>Charcoal headline. When {@code accentPhrase} is set, that substring is
 *       highlighted in the brand primary — the story-telling gold accent that
 *       makes the eye land on the key idea.</li>
 *   <li>Two CTAs: solid primary + outlined charcoal secondary. Both real
 *       buttons, both large enough to hit on mobile.</li>
 *   <li>Concentric ring watermark to the right, deliberately faint. On mobile
 *       it drops out entirely to give the copy full width.</li>
 * </ul>
 */
export function HeroEditorial({ variables, brand }: SectionProps) {
  const eyebrow = variables.eyebrow ? String(variables.eyebrow) : null;
  const headline = String(variables.headline ?? "");
  const accentPhrase = variables.accentPhrase ? String(variables.accentPhrase) : null;
  const subtext = variables.subtext ? String(variables.subtext) : null;
  const primaryCtaText = variables.primaryCtaText ? String(variables.primaryCtaText) : null;
  const primaryCtaLink = variables.primaryCtaLink ? String(variables.primaryCtaLink) : "#";
  const secondaryCtaText = variables.secondaryCtaText ? String(variables.secondaryCtaText) : null;
  const secondaryCtaLink = variables.secondaryCtaLink ? String(variables.secondaryCtaLink) : "#";

  // Split the headline so the accent phrase (if present) can be coloured
  // in-place rather than sitting on its own line. Falls through to a single
  // charcoal string when no accent is given.
  const parts = accentPhrase
    ? (() => {
        const idx = headline.indexOf(accentPhrase);
        if (idx < 0) return [{ text: headline }];
        return [
          { text: headline.slice(0, idx) },
          { text: accentPhrase, accent: true },
          { text: headline.slice(idx + accentPhrase.length) },
        ];
      })()
    : [{ text: headline }];

  return (
    <section
      style={{
        position: "relative",
        background: "#FAF9F6",
        color: brand.secondaryColor,
        overflow: "hidden",
      }}
    >
      {/* Ring watermark — sits behind the copy. On mobile it drops to a
       *  smaller size + moves off-screen; on tablet+ it becomes the
       *  ambient hero visual the brief calls for. */}
      <div
        aria-hidden
        className="hero-editorial-watermark"
        style={{
          position: "absolute",
          right: "-40%",
          top: "50%",
          transform: "translateY(-50%)",
          color: brand.primaryColor,
          pointerEvents: "none",
        }}
      >
        <RingMotif size={520} count={12} strokeWidth={1.25} opacity={0.09} />
      </div>
      <style>{`
        @media (min-width: 768px) {
          .hero-editorial-watermark { right: -8% !important; }
          .hero-editorial-watermark svg { width: 720px !important; height: 720px !important; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(80px, 12vw, 160px) 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div style={{ maxWidth: 780 }}>
          {eyebrow && (
            <p
              style={{
                margin: 0,
                marginBottom: 24,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              {eyebrow}
            </p>
          )}

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(38px, 6vw, 68px)",
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: brand.secondaryColor,
            }}
          >
            {parts.map((p, i) => (
              <span
                key={i}
                style={p.accent ? { color: brand.primaryColor } : undefined}
              >
                {p.text}
              </span>
            ))}
          </h1>

          {subtext && (
            <p
              style={{
                margin: 0,
                marginTop: 24,
                fontSize: "clamp(16px, 1.6vw, 19px)",
                lineHeight: 1.6,
                color: "#4B4B50",
                maxWidth: 640,
              }}
            >
              {subtext}
            </p>
          )}

          {(primaryCtaText || secondaryCtaText) && (
            <div
              style={{
                marginTop: 40,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {primaryCtaText && (
                <a
                  href={primaryCtaLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "16px 28px",
                    borderRadius: 999,
                    background: brand.primaryColor,
                    color: "#1F1F22",
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: "0.01em",
                    textDecoration: "none",
                    border: `1.5px solid ${brand.primaryColor}`,
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                    boxShadow: "0 2px 8px rgba(217,164,41,0.25)",
                  }}
                >
                  {primaryCtaText}
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "16px 28px",
                    borderRadius: 999,
                    background: "transparent",
                    color: brand.secondaryColor,
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: "0.01em",
                    textDecoration: "none",
                    border: `1.5px solid ${brand.secondaryColor}`,
                    transition: "background 180ms ease",
                  }}
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
