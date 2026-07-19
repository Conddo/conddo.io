import type { SectionProps } from "../../../types";

/** Two-column contact block: form left, brand-secondary details card right.
 *  Falls to single column on mobile. */
export function ContactTwoCol({ variables, brand }: SectionProps) {
  const businessName = variables.businessName ? String(variables.businessName) : "";
  const phone = variables.phone ? String(variables.phone) : null;
  const email = variables.email ? String(variables.email) : null;
  const responseTime = variables.responseTime
    ? String(variables.responseTime)
    : "We respond to all inquiries within one to two business days.";
  const socialLinks = parsePairs(variables.socialLinks);
  const formActionUrl = variables.formActionUrl ? String(variables.formActionUrl) : "";
  const helpOptionsRaw = Array.isArray(variables.helpOptions)
    ? (variables.helpOptions as string[])
    : typeof variables.helpOptions === "string"
      ? [variables.helpOptions]
      : [];
  const helpOptions = helpOptionsRaw.filter(Boolean);

  const formAction = formActionUrl || (email ? `mailto:${email}` : undefined);
  const formMethod = formActionUrl ? "post" : undefined;

  return (
    <section
      style={{ background: "#FAF9F6", padding: "clamp(72px, 10vw, 112px) 24px" }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 32,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "start",
        }}
      >
        {/* Form */}
        <form
          action={formAction}
          method={formMethod}
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: "36px 32px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
            display: "grid",
            gap: 16,
          }}
        >
          <FormField label="Name" name="name" required />
          <FormField label="Business" name="business" />
          <FormField label="Email" name="email" type="email" required />
          <FormField label="Phone" name="phone" type="tel" />
          <label style={{ display: "grid", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6D6E71",
              }}
            >
              What do you need help with?
            </span>
            <select
              name="topic"
              defaultValue=""
              style={fieldStyle}
            >
              <option value="" disabled>
                Pick one
              </option>
              {(helpOptions.length > 0
                ? helpOptions
                : ["Media Relations", "Brand Building", "Crisis Management", "Something else"]
              ).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6D6E71",
              }}
            >
              Tell us a bit
            </span>
            <textarea
              name="message"
              rows={4}
              style={{ ...fieldStyle, resize: "vertical", minHeight: 96 }}
              placeholder="A few sentences on your business + what you're hoping to do."
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "14px 24px",
              borderRadius: 999,
              background: brand.primaryColor,
              color: brand.secondaryColor,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.01em",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(217,164,41,0.25)",
              justifySelf: "start",
            }}
          >
            Request a Quote
          </button>
        </form>

        {/* Details card */}
        <div
          style={{
            background: brand.secondaryColor,
            color: "#FFFFFF",
            borderRadius: 20,
            padding: "36px 32px",
            display: "grid",
            gap: 24,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              Direct
            </p>
            {phone && (
              <div>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  style={{ color: "#FFFFFF", textDecoration: "none", fontSize: 16 }}
                >
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div style={{ marginTop: 4 }}>
                <a
                  href={`mailto:${email}`}
                  style={{ color: "#FFFFFF", textDecoration: "none", fontSize: 16 }}
                >
                  {email}
                </a>
              </div>
            )}
          </div>

          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              Response time
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,0.75)" }}>
              {responseTime}
            </p>
          </div>

          {socialLinks.length > 0 && (
            <div>
              <p
                style={{
                  margin: 0,
                  marginBottom: 8,
                  fontSize: 11,
                  fontWeight: 700,
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
                  gap: 12,
                }}
              >
                {socialLinks.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.value}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p
            style={{
              margin: 0,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              fontSize: 12.5,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {businessName}
          </p>
        </div>
      </div>
    </section>
  );
}

const fieldStyle: React.CSSProperties = {
  height: 46,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.1)",
  background: "#FAF9F6",
  fontSize: 15,
  color: "#3F3F42",
  fontFamily: "inherit",
};

function FormField({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#6D6E71",
        }}
      >
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        style={fieldStyle}
      />
    </label>
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
