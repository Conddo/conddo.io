import type { CSSProperties } from "react";
import type { ManagedSite } from "@/lib/api/managed-site";

/**
 * Server-rendered managed tenant site. Takes the JSON from the BE public
 * endpoint and lays it out into semantic HTML sections themed via CSS
 * variables set on the root wrapper. No client hydration required — this is
 * static content that revalidates every 5 minutes.
 *
 * <p>Intentionally chrome-free: the tenant's site is the tenant's site.
 * No Conddo header, no "made with" footer beyond a minimal attribution.
 * Fonts fall back to system if the theme doesn't override.
 */
export function SiteRenderer({ site }: { site: ManagedSite }) {
  const t = site.theme ?? {};
  const rootStyle: CSSProperties = {
    // Set every color as a CSS variable so section components pick them up
    // uniformly, and swap theme in a single place if it changes.
    ["--site-primary" as string]: t.primaryColor ?? "#5B4EE8",
    ["--site-accent" as string]: t.accentColor ?? "#9F8CFF",
    ["--site-bg" as string]: t.backgroundColor ?? "#ffffff",
    ["--site-text" as string]: t.textColor ?? "#0f0f10",
    fontFamily: t.fontFamily ?? "Inter, system-ui, sans-serif",
    background: "var(--site-bg)",
    color: "var(--site-text)",
    minHeight: "100vh",
  };

  const sections = (site.sections ?? {}) as Record<string, unknown>;
  const hero = readObject(sections.hero);
  const about = readObject(sections.about);
  const services = readArray(sections.services);
  const contact = readObject(sections.contact);

  return (
    <main style={rootStyle}>
      <Hero
        headline={readString(hero, "headline") || site.businessName}
        subheadline={readString(hero, "subheadline")}
        ctaLabel={readString(hero, "ctaLabel")}
      />
      {about && (
        <About
          title={readString(about, "title") ?? "About us"}
          body={readString(about, "body") ?? ""}
        />
      )}
      {services.length > 0 && <Services items={services} />}
      {contact && (
        <Contact
          title={readString(contact, "title") ?? "Get in touch"}
          note={readString(contact, "note") ?? ""}
        />
      )}
      <Footer businessName={site.businessName} />
    </main>
  );
}

// ---------- sections --------------------------------------------------------

function Hero({
  headline,
  subheadline,
  ctaLabel,
}: {
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
}) {
  return (
    <section
      style={{
        padding: "clamp(64px, 12vw, 140px) 24px",
        textAlign: "center",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--site-primary) 10%, transparent), transparent 70%)",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(36px, 7vw, 68px)",
          lineHeight: 1.1,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        {headline}
      </h1>
      {subheadline && (
        <p
          style={{
            marginTop: 20,
            fontSize: "clamp(16px, 2.5vw, 20px)",
            opacity: 0.75,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {subheadline}
        </p>
      )}
      {ctaLabel && (
        <a
          href="#contact"
          style={{
            display: "inline-block",
            marginTop: 32,
            padding: "14px 28px",
            borderRadius: 999,
            background: "var(--site-primary)",
            color: "#fff",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {ctaLabel}
        </a>
      )}
    </section>
  );
}

function About({ title, body }: { title: string; body: string }) {
  return (
    <section style={{ padding: "clamp(48px, 8vw, 96px) 24px", maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", marginBottom: 16, fontWeight: 600 }}>
        {title}
      </h2>
      <p style={{ fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.65, opacity: 0.85 }}>{body}</p>
    </section>
  );
}

function Services({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <section style={{ padding: "clamp(48px, 8vw, 96px) 24px", background: "color-mix(in srgb, var(--site-text) 3%, var(--site-bg))" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 34px)",
            marginBottom: 32,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          What we do
        </h2>
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {items.map((item, i) => (
            <article
              key={i}
              style={{
                padding: 24,
                borderRadius: 16,
                background: "var(--site-bg)",
                border: "1px solid color-mix(in srgb, var(--site-text) 8%, transparent)",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
                {readString(item, "name") ?? "Untitled"}
              </h3>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.8, lineHeight: 1.55 }}>
                {readString(item, "description") ?? ""}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ title, note }: { title: string; note: string }) {
  return (
    <section
      id="contact"
      style={{
        padding: "clamp(48px, 8vw, 96px) 24px",
        textAlign: "center",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", marginBottom: 16, fontWeight: 600 }}>
        {title}
      </h2>
      <p style={{ fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.65, opacity: 0.85 }}>{note}</p>
    </section>
  );
}

function Footer({ businessName }: { businessName: string }) {
  return (
    <footer
      style={{
        padding: "32px 24px",
        textAlign: "center",
        fontSize: 13,
        opacity: 0.55,
        borderTop: "1px solid color-mix(in srgb, var(--site-text) 8%, transparent)",
      }}
    >
      © {new Date().getFullYear()} {businessName}. Built on Conddo.
    </footer>
  );
}

// ---------- utilities -------------------------------------------------------

function readObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function readArray(v: unknown): Array<Record<string, unknown>> {
  return Array.isArray(v) ? (v as Array<Record<string, unknown>>) : [];
}

function readString(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}
