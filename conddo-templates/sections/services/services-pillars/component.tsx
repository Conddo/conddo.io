import type { SectionProps } from "../../../types";
import { RingBullet } from "../../../primitives/RingMotif";

/**
 * Homepage service-pillars grid — 3 or 4 cards, each a top-level category.
 * The full service list lives on a dedicated Services page; this is the
 * scannable overview.
 *
 * <p>Each pillar is {@code "title|description"}. Cards render on white
 * with a soft shadow, generous padding, and a gold ring accent at the
 * top-left corner (echoes the wordmark's signal motif).
 */
export function ServicesPillars({ variables, brand }: SectionProps) {
  const eyebrow = variables.eyebrow ? String(variables.eyebrow) : null;
  const heading = String(variables.heading ?? "What we do");
  const subheading = variables.subheading ? String(variables.subheading) : null;
  const linkText = variables.linkText ? String(variables.linkText) : null;
  const linkHref = variables.linkHref ? String(variables.linkHref) : "#";
  const rawPillars = Array.isArray(variables.pillars)
    ? (variables.pillars as string[])
    : typeof variables.pillars === "string"
      ? [variables.pillars]
      : [];
  const pillars = rawPillars
    .map((s) => {
      const [title, description] = s.split("|").map((p) => p.trim());
      return { title, description };
    })
    .filter((p) => p.title);

  return (
    <section
      style={{
        background: "#FAF9F6",
        padding: "clamp(64px, 10vw, 112px) 24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          {eyebrow && (
            <p
              style={{
                margin: 0,
                marginBottom: 14,
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
          {subheading && (
            <p
              style={{
                margin: 0,
                marginTop: 16,
                fontSize: "clamp(15px, 1.5vw, 17px)",
                lineHeight: 1.6,
                color: "#4B4B50",
              }}
            >
              {subheading}
            </p>
          )}
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 20,
            gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
          }}
        >
          {pillars.map((p, i) => (
            <li
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "32px 28px",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "transform 220ms ease, box-shadow 220ms ease",
              }}
            >
              <span
                style={{
                  color: brand.primaryColor,
                  display: "inline-flex",
                }}
              >
                <RingBullet size={22} />
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: brand.secondaryColor,
                  letterSpacing: "-0.005em",
                }}
              >
                {p.title}
              </h3>
              {p.description && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "#4B4B50",
                  }}
                >
                  {p.description}
                </p>
              )}
            </li>
          ))}
        </ul>

        {linkText && (
          <div style={{ marginTop: 40 }}>
            <a
              href={linkHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: brand.secondaryColor,
                textDecoration: "none",
                borderBottom: `1.5px solid ${brand.primaryColor}`,
                paddingBottom: 3,
              }}
            >
              {linkText} <span aria-hidden>&rarr;</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
