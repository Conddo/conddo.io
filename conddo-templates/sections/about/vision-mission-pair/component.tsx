import type { SectionProps } from "../../../types";
import { RingBullet } from "../../../primitives/RingMotif";

/** Side-by-side Vision + Mission panels. Falls to stacked on mobile. */
export function VisionMissionPair({ variables, brand }: SectionProps) {
  const visionLabel = variables.visionLabel ? String(variables.visionLabel) : "Our Vision";
  const visionBody = variables.visionBody ? String(variables.visionBody) : "";
  const missionLabel = variables.missionLabel ? String(variables.missionLabel) : "Our Mission";
  const missionBody = variables.missionBody ? String(variables.missionBody) : "";

  return (
    <section
      style={{ background: "#FAF9F6", padding: "clamp(64px, 10vw, 112px) 24px" }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: 20,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {[
          { label: visionLabel, body: visionBody },
          { label: missionLabel, body: missionBody },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              padding: "36px 32px",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ color: brand.primaryColor, display: "inline-flex" }}>
              <RingBullet size={22} />
            </span>
            <p
              style={{
                margin: 0,
                marginTop: 16,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              {p.label}
            </p>
            {p.body && (
              <p
                style={{
                  margin: 0,
                  marginTop: 10,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: brand.secondaryColor,
                }}
              >
                {p.body}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
