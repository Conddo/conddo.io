import type { SectionProps } from "../../../types";

/** Team photo grid. Each member is 'name|role|photoUrl'. */
export function TeamGrid({ variables, brand }: SectionProps) {
  const eyebrow = variables.eyebrow ? String(variables.eyebrow) : null;
  const heading = variables.heading ? String(variables.heading) : "The team";
  const subheading = variables.subheading ? String(variables.subheading) : null;
  const rawMembers = Array.isArray(variables.members)
    ? (variables.members as string[])
    : typeof variables.members === "string"
      ? [variables.members]
      : [];
  const members = rawMembers
    .map((s) => {
      const [name, role, photoUrl] = s.split("|").map((p) => p.trim());
      return { name, role, photoUrl };
    })
    .filter((m) => m.name);

  return (
    <section
      style={{ background: "#FFFFFF", padding: "clamp(72px, 10vw, 112px) 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
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
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: brand.secondaryColor,
              lineHeight: 1.15,
            }}
          >
            {heading}
          </h2>
          {subheading && (
            <p
              style={{
                margin: 0,
                marginTop: 12,
                fontSize: 16,
                lineHeight: 1.6,
                color: "#4B4B50",
              }}
            >
              {subheading}
            </p>
          )}
        </div>

        {members.length > 0 ? (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            {members.map((m, i) => (
              <li
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 5",
                    background: m.photoUrl ? undefined : "#EFEDE7",
                    borderRadius: 14,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: brand.primaryColor,
                    fontSize: 42,
                    fontWeight: 700,
                  }}
                >
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span aria-hidden>{m.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: brand.secondaryColor,
                    }}
                  >
                    {m.name}
                  </div>
                  {m.role && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#6D6E71",
                      }}
                    >
                      {m.role}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div
            style={{
              padding: "32px 24px",
              border: "1px dashed rgba(0,0,0,0.12)",
              borderRadius: 16,
              color: "#6D6E71",
              fontSize: 14,
            }}
          >
            Team members coming soon.
          </div>
        )}
      </div>
    </section>
  );
}
