import type { SectionProps } from "../../../types";
import { RingMotif, RingBullet } from "../../../primitives/RingMotif";

/**
 * Full-width alternating service detail blocks.
 *
 * <p>Each block is a pipe-delimited string:
 * {@code anchorId|title|description|deliverable1;deliverable2;deliverable3}.
 * The renderer alternates ring-motif placement (left / right) so a page
 * with eight blocks doesn't feel like a repeated stack, and stamps a
 * scroll-target id on each so a paired {@code services-anchor-nav}
 * lands cleanly on it.
 */
export function ServiceBlocksAlternating({ variables, brand }: SectionProps) {
  const raw = Array.isArray(variables.blocks)
    ? (variables.blocks as string[])
    : typeof variables.blocks === "string"
      ? [variables.blocks]
      : [];
  const blocks = raw
    .map((s) => {
      const [anchorId, title, description, deliverables] = s.split("|").map((p) => p?.trim() ?? "");
      const list = (deliverables ?? "")
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean);
      return { anchorId, title, description, deliverables: list };
    })
    .filter((b) => b.title);

  return (
    <section style={{ background: "#FAF9F6" }}>
      {blocks.map((b, i) => {
        const ringOnRight = i % 2 === 0;
        return (
          <div
            key={b.anchorId || i}
            id={b.anchorId || undefined}
            style={{
              position: "relative",
              padding: "clamp(64px, 9vw, 96px) 24px",
              borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : undefined,
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                [ringOnRight ? "right" : "left"]: "-8%",
                top: "50%",
                transform: "translateY(-50%)",
                color: brand.primaryColor,
                pointerEvents: "none",
              }}
            >
              <RingMotif size={420} count={9} strokeWidth={1.25} opacity={0.09} />
            </div>

            <div
              style={{
                position: "relative",
                maxWidth: 900,
                margin: "0 auto",
              }}
            >
              <p
                style={{
                  margin: 0,
                  marginBottom: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: brand.primaryColor,
                }}
              >
                Service · {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: "clamp(26px, 3.4vw, 34px)",
                  fontWeight: 700,
                  color: brand.secondaryColor,
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                }}
              >
                {b.title}
              </h3>
              {b.description && (
                <p
                  style={{
                    margin: 0,
                    marginTop: 16,
                    fontSize: "clamp(16px, 1.5vw, 18px)",
                    lineHeight: 1.65,
                    color: "#4B4B50",
                    maxWidth: 680,
                  }}
                >
                  {b.description}
                </p>
              )}
              {b.deliverables.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#6D6E71",
                    }}
                  >
                    What this looks like
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {b.deliverables.map((d, j) => (
                      <li
                        key={j}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 14px",
                          background: "#FFFFFF",
                          border: "1px solid rgba(0,0,0,0.07)",
                          borderRadius: 999,
                          fontSize: 13.5,
                          color: brand.secondaryColor,
                        }}
                      >
                        <span style={{ color: brand.primaryColor, display: "inline-flex" }}>
                          <RingBullet size={10} />
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
