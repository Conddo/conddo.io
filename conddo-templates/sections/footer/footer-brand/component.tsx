import type { SectionProps } from "../../../types";

/**
 * Full-width brand footer on the secondary colour. Wordmark on the left,
 * a compact contact block and social row on the right, legal + copyright
 * on a low-key baseline.
 */
export function FooterBrand({ variables, brand }: SectionProps) {
  const tagline = variables.tagline ? String(variables.tagline) : null;
  const supportingLine = variables.supportingLine ? String(variables.supportingLine) : null;
  const phone = variables.phone ? String(variables.phone) : null;
  const email = variables.email ? String(variables.email) : null;
  const socialLinks = parsePairs(variables.socialLinks);
  const legalLinks = parsePairs(variables.legalLinks);

  const businessName = variables.businessName ? String(variables.businessName) : "";
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: brand.secondaryColor,
        color: "rgba(255,255,255,0.8)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 28px",
          display: "grid",
          gap: 40,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
        className="footer-grid"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logoUrl}
                alt={businessName}
                style={{ height: 34, width: "auto", objectFit: "contain" }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: brand.primaryColor,
                  color: brand.secondaryColor,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {(businessName || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
              }}
            >
              {businessName}
            </span>
          </div>
          {tagline && (
            <p
              style={{
                margin: 0,
                marginTop: 20,
                fontSize: 15,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.75)",
                maxWidth: 460,
              }}
            >
              {tagline}
            </p>
          )}
          {supportingLine && (
            <p
              style={{
                margin: 0,
                marginTop: 8,
                fontSize: 14,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.55)",
                maxWidth: 460,
              }}
            >
              {supportingLine}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 12,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              Get in touch
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  style={{ color: "#FFFFFF", textDecoration: "none", fontSize: 14.5 }}
                >
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  style={{ color: "#FFFFFF", textDecoration: "none", fontSize: 14.5 }}
                >
                  {email}
                </a>
              )}
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div>
              <p
                style={{
                  margin: 0,
                  marginBottom: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: brand.primaryColor,
                }}
              >
                Follow
              </p>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                {socialLinks.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.value}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        textDecoration: "none",
                        fontSize: 14,
                        borderBottom: "1px solid transparent",
                      }}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            fontSize: 12.5,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span>
            © {year} {businessName}. All rights reserved.
          </span>
          {legalLinks.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                gap: 16,
              }}
            >
              {legalLinks.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.value}
                    style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

function parsePairs(raw: unknown): Array<{ label: string; value: string }> {
  const list = Array.isArray(raw) ? (raw as string[]) : typeof raw === "string" ? [raw] : [];
  return list
    .map((s) => {
      const [label, value] = s.split("|").map((p) => p.trim());
      return { label, value };
    })
    .filter((p) => p.label && p.value);
}
