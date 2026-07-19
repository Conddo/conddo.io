import type { SectionProps } from "../../../types";
import { RingMotif } from "../../../primitives/RingMotif";

/** Process steps visualised as growing concentric rings — step 1 has one
 *  ring, step 2 has two, etc. Reads as amplification: exactly the metaphor
 *  the Flagscale wordmark already carries. */
export function ProcessRings({ variables, brand }: SectionProps) {
  const heading = variables.heading ? String(variables.heading) : "How we work";
  const raw = Array.isArray(variables.steps)
    ? (variables.steps as string[])
    : typeof variables.steps === "string"
      ? [variables.steps]
      : [];
  const steps = raw
    .map((s) => {
      const [title, description] = s.split("|").map((p) => p.trim());
      return { title, description };
    })
    .filter((s) => s.title);

  return (
    <section
      style={{ background: "#FFFFFF", padding: "clamp(72px, 10vw, 112px) 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2
          style={{
            margin: 0,
            marginBottom: 48,
            textAlign: "center",
            fontSize: "clamp(26px, 3.4vw, 36px)",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: brand.secondaryColor,
          }}
        >
          {heading}
        </h2>

        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 32,
            gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
            alignItems: "start",
          }}
        >
          {steps.map((s, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  color: brand.primaryColor,
                  marginBottom: 20,
                }}
              >
                <RingMotif size={96} count={Math.min(i + 2, 5)} strokeWidth={1.4} opacity={1} />
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    fontSize: 14,
                    fontWeight: 800,
                    color: brand.secondaryColor,
                    background: "#FFFFFF",
                    borderRadius: 999,
                    padding: "4px 10px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: brand.secondaryColor,
                  letterSpacing: "-0.005em",
                }}
              >
                {s.title}
              </h3>
              {s.description && (
                <p
                  style={{
                    margin: 0,
                    marginTop: 8,
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: "#4B4B50",
                  }}
                >
                  {s.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
