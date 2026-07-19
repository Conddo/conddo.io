import type { SectionProps } from "../../../types";

/**
 * Editorial About — a two-column story block on desktop. Left: an optional
 * founder-portrait / studio photo. Right: eyebrow + headline + body copy +
 * an optional pull quote in the brand primary. Falls to single column on
 * mobile without any breakpoint dance.
 */
export function AboutEditorial({ variables, brand }: SectionProps) {
  const eyebrow = variables.eyebrow ? String(variables.eyebrow) : null;
  const heading = String(variables.heading ?? "About");
  const body = String(variables.body ?? "");
  const pullQuote = variables.pullQuote ? String(variables.pullQuote) : null;
  const imageUrl = variables.imageUrl ? String(variables.imageUrl) : null;

  return (
    <section
      style={{
        background: "#FAF9F6",
        padding: "clamp(80px, 12vw, 128px) 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 40,
          gridTemplateColumns: imageUrl
            ? "repeat(auto-fit, minmax(280px, 1fr))"
            : "1fr",
          alignItems: "center",
        }}
        className="about-editorial-grid"
      >
        {imageUrl && (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "4 / 5",
                objectFit: "cover",
                borderRadius: 16,
                background: "rgba(0,0,0,0.05)",
              }}
            />
          </div>
        )}

        <div style={{ maxWidth: 640 }}>
          {eyebrow && (
            <p
              style={{
                margin: 0,
                marginBottom: 14,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(28px, 3.6vw, 40px)",
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: brand.secondaryColor,
            }}
          >
            {heading}
          </h2>

          {body && (
            <div
              style={{
                marginTop: 24,
                fontSize: "clamp(16px, 1.5vw, 18px)",
                lineHeight: 1.7,
                color: "#4B4B50",
                whiteSpace: "pre-line",
              }}
            >
              {body}
            </div>
          )}

          {pullQuote && (
            <blockquote
              style={{
                margin: 0,
                marginTop: 40,
                padding: "8px 0 8px 20px",
                borderLeft: `3px solid ${brand.primaryColor}`,
                fontSize: "clamp(20px, 2.2vw, 26px)",
                lineHeight: 1.35,
                fontWeight: 600,
                color: brand.primaryColor,
                letterSpacing: "-0.005em",
              }}
            >
              &ldquo;{pullQuote}&rdquo;
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}
