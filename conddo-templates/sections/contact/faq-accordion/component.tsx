import type { SectionProps } from "../../../types";

/** Semantic-HTML FAQ. Uses native details/summary so the accordion behaves
 *  correctly without hydration + stays searchable for SEO. */
export function FaqAccordion({ variables, brand }: SectionProps) {
  const heading = variables.heading ? String(variables.heading) : "Common questions";
  const raw = Array.isArray(variables.items)
    ? (variables.items as string[])
    : typeof variables.items === "string"
      ? [variables.items]
      : [];
  const items = raw
    .map((s) => {
      const [question, answer] = s.split("|").map((p) => p.trim());
      return { question, answer };
    })
    .filter((i) => i.question);

  if (items.length === 0) return null;

  return (
    <section
      style={{ background: "#FFFFFF", padding: "clamp(64px, 9vw, 96px) 24px" }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <h2
          style={{
            margin: 0,
            marginBottom: 32,
            fontSize: "clamp(22px, 2.8vw, 30px)",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: brand.secondaryColor,
          }}
        >
          {heading}
        </h2>
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((it, i) => (
            <details
              key={i}
              style={{
                borderTop: i === 0 ? "1px solid rgba(0,0,0,0.08)" : undefined,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  padding: "18px 4px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: brand.secondaryColor,
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span>{it.question}</span>
                <span
                  aria-hidden
                  style={{
                    color: brand.primaryColor,
                    fontSize: 20,
                    lineHeight: 1,
                    fontWeight: 400,
                  }}
                >
                  +
                </span>
              </summary>
              {it.answer && (
                <p
                  style={{
                    margin: 0,
                    padding: "0 4px 18px",
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "#4B4B50",
                  }}
                >
                  {it.answer}
                </p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
