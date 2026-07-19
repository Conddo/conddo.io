import type { SectionProps } from "../../../types";

/**
 * Understated proof band. Sits directly beneath a hero.
 *
 * <p>Each stat is a pipe-delimited "headline|caption" string. The headline
 * is set large in the brand secondary; the caption is small caps in mid-gray
 * with wide tracking, mirroring the wordmark's descriptor treatment.
 */
export function ProofStrip({ variables, brand }: SectionProps) {
  const label = variables.label ? String(variables.label) : null;
  const rawStats = Array.isArray(variables.stats)
    ? (variables.stats as string[])
    : typeof variables.stats === "string"
      ? [variables.stats]
      : [];
  const stats = rawStats
    .map((s) => {
      const [headline, caption] = s.split("|").map((p) => p.trim());
      return { headline, caption };
    })
    .filter((s) => s.headline);

  if (!label && stats.length === 0) return null;

  return (
    <section
      style={{
        background: "#FAF9F6",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "36px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
        }}
      >
        {label && (
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6D6E71",
            }}
          >
            {label}
          </p>
        )}

        {stats.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 24,
              gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(140px, 1fr))`,
              width: "100%",
              maxWidth: 900,
            }}
          >
            {stats.map((s, i) => (
              <li
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
              >
                <div
                  style={{
                    fontSize: "clamp(24px, 3vw, 34px)",
                    fontWeight: 700,
                    color: brand.secondaryColor,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  {s.headline}
                </div>
                {s.caption && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#6D6E71",
                    }}
                  >
                    {s.caption}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
