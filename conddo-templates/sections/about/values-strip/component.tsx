import type { SectionProps } from "../../../types";
import { RingBullet } from "../../../primitives/RingMotif";

/** Horizontal values row with ring dividers between items. */
export function ValuesStrip({ variables, brand }: SectionProps) {
  const heading = variables.heading ? String(variables.heading) : null;
  const rawValues = Array.isArray(variables.values)
    ? (variables.values as string[])
    : typeof variables.values === "string"
      ? [variables.values]
      : [];
  const values = rawValues
    .map((s) => {
      const [title, description] = s.split("|").map((p) => p.trim());
      return { title, description };
    })
    .filter((v) => v.title);

  if (values.length === 0) return null;

  return (
    <section
      style={{ background: "#FFFFFF", padding: "clamp(56px, 8vw, 96px) 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {heading && (
          <h2
            style={{
              margin: 0,
              marginBottom: 40,
              textAlign: "center",
              fontSize: "clamp(22px, 2.6vw, 28px)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: brand.secondaryColor,
            }}
          >
            {heading}
          </h2>
        )}
        <style>{`
          /* When values wrap to a second row, the ring divider that would
           * have sat between them looks orphaned. Hide dividers on narrow
           * viewports and let the wrap take care of itself. */
          @media (max-width: 640px) {
            .values-strip-divider { display: none !important; }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            alignItems: "stretch",
            justifyContent: "center",
          }}
        >
          {values.map((v, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                flex: "1 1 240px",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "16px 24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: brand.primaryColor,
                    marginBottom: 8,
                  }}
                >
                  {v.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#4B4B50",
                  }}
                >
                  {v.description}
                </p>
              </div>
              {i < values.length - 1 && (
                <div
                  className="values-strip-divider"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: brand.primaryColor,
                    opacity: 0.6,
                  }}
                  aria-hidden
                >
                  <RingBullet size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
