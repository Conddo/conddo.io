"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { adminApi, AdminApiError } from "@/lib/api/admin";

/**
 * Admin-side "publish a website for a tenant" panel. Supports both single-
 * page and multi-page (v3) configs — the payload shape is passed straight
 * through to {@code PUT /admin/tenants/{id}/managed-site}, so the tenant
 * gets whatever we push.
 *
 * <p>Presets:
 * <ul>
 *   <li><b>Single-page starter</b> — {@code sections} at the root, no nav.
 *       Cheapest way to ship a working site.</li>
 *   <li><b>Multi-page starter</b> — Home / About / Services / Contact
 *       skeleton. Renderer draws a nav bar automatically.</li>
 *   <li><b>Flagscale</b> — multi-page fully populated with their real
 *       copy across Home / About / Services / Contact + a Portfolio
 *       gallery placeholder.</li>
 * </ul>
 */
export function WebsiteBuilderPanel({
  tenantId,
  tenantName,
}: {
  tenantId: string;
  tenantName: string;
}) {
  const isFlagscale = tenantName.toLowerCase().includes("flagscale");
  const initialJson = isFlagscale
    ? FLAGSCALE_MULTIPAGE_JSON
    : MULTIPAGE_STARTER_JSON;

  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(isFlagscale ? "#D9A429" : "#7C5CBF");
  const [secondaryColor, setSecondaryColor] = useState(isFlagscale ? "#6D6E71" : "#141414");
  const [sectionsJson, setSectionsJson] = useState(initialJson);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const looksLikeDrive =
    logoUrl.includes("drive.google.com") || logoUrl.includes("docs.google.com");

  async function publish() {
    setBusy(true);
    setMsg(null);
    setErr(null);

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(sectionsJson) as Record<string, unknown>;
      const hasPages = Array.isArray((parsed as { pages?: unknown }).pages);
      const hasSections = Array.isArray((parsed as { sections?: unknown }).sections);
      if (!hasPages && !hasSections) {
        throw new Error("JSON must have either a `pages` array (multi-page) or a `sections` array (single-page).");
      }
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : "JSON is invalid.");
      return;
    }

    const theme = {
      primaryColor,
      secondaryColor,
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter, system-ui, sans-serif",
    };

    try {
      await adminApi.setTenantBrand(tenantId, {
        logoUrl: logoUrl.trim() || null,
        primaryColor,
        secondaryColor,
      });
      await adminApi.setTenantManagedSite(tenantId, {
        sections: parsed,
        theme,
      });
      const published = await adminApi.publishTenantManagedSite(tenantId);
      setMsg(
        `Published${published.subdomain ? " — visit " + published.subdomain + ".getconddo.com" : ""}.`,
      );
    } catch (e) {
      setErr(e instanceof AdminApiError ? e.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-white">Publish a website</div>
          <p className="mt-1 text-[12px] text-white/50">
            Ghostwrites the AI: pushes brand + draft sections + publishes.
            Overwrites any existing managed site.
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSectionsJson(SINGLE_PAGE_STARTER_JSON)}
            className="rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-white/70 hover:text-white"
          >
            Single-page
          </button>
          <button
            onClick={() => setSectionsJson(MULTIPAGE_STARTER_JSON)}
            className="rounded-md border border-white/10 px-2 py-1 text-[10.5px] text-white/70 hover:text-white"
          >
            Multi-page
          </button>
          {isFlagscale && (
            <button
              onClick={() => setSectionsJson(FLAGSCALE_MULTIPAGE_JSON)}
              className="rounded-md border border-amber-400/30 bg-amber-500/[0.08] px-2 py-1 text-[10.5px] text-amber-100"
            >
              Flagscale
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_140px]">
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/50">
            Logo URL
          </label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/…/logo.png"
            className="h-9 w-full rounded-md border border-white/10 bg-black/30 px-2.5 font-mono text-[12px] text-white placeholder:text-white/30 focus:border-primary-light focus:outline-none"
          />
        </div>
        <ColorInput label="Primary" value={primaryColor} onChange={setPrimaryColor} />
        <ColorInput label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
      </div>

      {looksLikeDrive && (
        <div className="mt-2 rounded-md border border-amber-400/25 bg-amber-500/[0.06] px-3 py-2 text-[11.5px] text-amber-100">
          Google Drive URLs don&apos;t hotlink reliably. Re-host on Cloudinary or
          imgur and paste the direct image URL here.
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/50">
          Site config JSON
        </label>
        <textarea
          value={sectionsJson}
          onChange={(e) => setSectionsJson(e.target.value)}
          rows={22}
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-white placeholder:text-white/30 focus:border-primary-light focus:outline-none"
          spellCheck={false}
        />
        <p className="mt-1 text-[11px] text-white/40">
          <code className="text-white/60">pages</code> = multi-page site with nav bar; each page has a
          {" "}<code className="text-white/60">path</code>, <code className="text-white/60">label</code>, and its own
          {" "}<code className="text-white/60">sections</code> array.
          Legacy shape ({<code className="text-white/60">sections</code>} at root) still renders as a single-page site.
        </p>
      </div>

      {msg && <div className="mt-3 text-[12px] text-emerald-300">{msg}</div>}
      {err && <div className="mt-3 text-[12px] text-rose-300">{err}</div>}

      <div className="mt-4 flex justify-end">
        <button
          onClick={publish}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/85 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : null}
          {busy ? "Publishing…" : "Publish website"}
        </button>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded border border-white/12 bg-transparent"
          aria-label={label + " color"}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-white/10 bg-black/30 px-2 font-mono text-[11.5px] text-white focus:border-primary-light focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

const SINGLE_PAGE_STARTER_JSON = JSON.stringify(
  {
    sections: [
      {
        id: "hero",
        componentId: "hero-bold-centered",
        variables: {
          businessName: "Your Business",
          tagline: "A one-line headline that says who you are.",
          subtext: "One or two sentences on what you do and who you do it for.",
          ctaText: "Get in touch",
          ctaLink: "#contact",
        },
      },
      {
        id: "about",
        componentId: "about-simple",
        variables: {
          eyebrow: "Who we are",
          heading: "A one-line story headline.",
          body: "One or two short paragraphs on your business — your values, who you serve, and why customers come back.",
        },
      },
      {
        id: "services",
        componentId: "services-cards",
        variables: {
          heading: "What we do",
          services: [
            "Service One|On request|One sentence on what this delivers.",
            "Service Two|On request|One sentence on what this delivers.",
            "Service Three|On request|One sentence on what this delivers.",
          ],
        },
      },
      {
        id: "contact",
        componentId: "contact-simple",
        variables: {
          businessName: "Your Business",
          phone: "+234 000 000 0000",
          email: "hello@your-business.com",
          address: "",
        },
      },
    ],
  },
  null,
  2,
);

const MULTIPAGE_STARTER_JSON = JSON.stringify(
  {
    pages: [
      {
        id: "home",
        path: "/",
        label: "Home",
        sections: [
          {
            id: "home-hero",
            componentId: "hero-bold-centered",
            variables: {
              businessName: "Your Business",
              tagline: "A one-line headline that says who you are.",
              subtext: "One or two sentences on what you do and who you do it for.",
              ctaText: "Get in touch",
              ctaLink: "/contact",
            },
          },
          {
            id: "home-services",
            componentId: "services-cards",
            variables: {
              heading: "What we do",
              services: [
                "Service One|On request|One sentence on what this delivers.",
                "Service Two|On request|One sentence on what this delivers.",
                "Service Three|On request|One sentence on what this delivers.",
              ],
            },
          },
        ],
      },
      {
        id: "about",
        path: "/about",
        label: "About",
        sections: [
          {
            id: "about-body",
            componentId: "about-simple",
            variables: {
              eyebrow: "Who we are",
              heading: "A one-line story headline.",
              body: "Longer form story about your business — values, history, team. Multiple paragraphs supported.",
            },
          },
        ],
      },
      {
        id: "services",
        path: "/services",
        label: "Services",
        sections: [
          {
            id: "services-full",
            componentId: "services-cards",
            variables: {
              heading: "Services",
              services: [
                "Service One|On request|Full paragraph describing what this delivers, for whom, and the outcome.",
                "Service Two|On request|Full paragraph describing what this delivers, for whom, and the outcome.",
                "Service Three|On request|Full paragraph describing what this delivers, for whom, and the outcome.",
              ],
            },
          },
        ],
      },
      {
        id: "contact",
        path: "/contact",
        label: "Contact",
        sections: [
          {
            id: "contact-body",
            componentId: "contact-simple",
            variables: {
              businessName: "Your Business",
              phone: "+234 000 000 0000",
              email: "hello@your-business.com",
              address: "",
            },
          },
        ],
      },
    ],
  },
  null,
  2,
);

const FLAGSCALE_MULTIPAGE_JSON = JSON.stringify(
  {
    pages: [
      {
        id: "home",
        path: "/",
        label: "Home",
        sections: [
          {
            id: "home-hero",
            componentId: "hero-bold-centered",
            variables: {
              businessName: "Flagscale PR",
              tagline: "Your Brand Has a Story. We Make Sure the Right People Hear It.",
              subtext:
                "Flagscale PR helps African SMEs turn visibility into revenue, real media coverage, and lasting corporate partnerships.",
              ctaText: "Book a Strategy Call",
              ctaLink: "/contact",
            },
          },
          {
            id: "home-services-teaser",
            componentId: "services-cards",
            variables: {
              heading: "PR Solutions Built for African Businesses",
              services: [
                "Media Relations|On request|Real relationships with journalists and outlets, so your business gets covered — not overlooked.",
                "Content Creation|On request|Stories, articles, and brand content that sound like you and resonate with your audience.",
                "Brand Building|On request|Positioning that helps you stand out in a crowded market and stay memorable.",
              ],
            },
          },
          {
            id: "home-testimonials",
            componentId: "testimonials-cards",
            variables: {
              heading: "What Our Clients Say",
              testimonials: [
                "Flagscale reframed how we tell our story — and the coverage followed.|A partner, growing Nigerian SME",
                "They actually understood our business before they wrote a single word.|Founder, Lagos-based agency",
              ],
            },
          },
        ],
      },
      {
        id: "about",
        path: "/about",
        label: "About",
        sections: [
          {
            id: "about-body",
            componentId: "about-simple",
            variables: {
              eyebrow: "People. Passion. Professionalism.",
              heading: "Every African business has a story worth telling well.",
              body: "We work with small and medium sized businesses across Africa to craft messaging that actually lands with the people it's meant for. That means media relations that get real coverage, content that builds trust, and communication strategies that hold up under pressure — not just polished words that look good in a deck.\n\nWe take the time to understand your business before we ever write a word: your values, your goals, your audience. A PR strategy that doesn't start there is just noise.\n\nOur mission: help SMEs across Africa communicate clearly with the people who matter most and reach their business goals, using both traditional and new media.",
            },
          },
        ],
      },
      {
        id: "services",
        path: "/services",
        label: "Services",
        sections: [
          {
            id: "services-all",
            componentId: "services-cards",
            variables: {
              heading: "PR Solutions Built for African Businesses",
              services: [
                "Media Relations|On request|Real relationships with journalists and outlets, so your business gets covered — not overlooked.",
                "Content Creation|On request|Stories, articles, and brand content that sound like you and resonate with your audience.",
                "Social Media Management|On request|Consistent, on-brand presence across the platforms your customers actually use.",
                "Crisis Management|On request|When things go wrong, we help you respond fast, protect your reputation, and stay in control.",
                "Event Management|On request|From planning to execution, we handle the details so your event runs the way it should.",
                "Influencer Marketing|On request|Connecting your brand with voices your audience already trusts.",
                "Brand Building|On request|Positioning that helps you stand out in a crowded market and stay memorable.",
                "Corporate Communications|On request|Clear, consistent messaging for stakeholders, partners, and investors.",
              ],
            },
          },
        ],
      },
      {
        id: "portfolio",
        path: "/portfolio",
        label: "Portfolio",
        sections: [
          {
            id: "portfolio-gallery",
            componentId: "gallery-grid",
            variables: {
              heading: "Businesses We've Helped Grow",
              images: [
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800|Client campaign highlight",
                "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800|Behind the scenes",
                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800|Team workshop",
              ],
            },
          },
        ],
      },
      {
        id: "contact",
        path: "/contact",
        label: "Contact",
        sections: [
          {
            id: "contact-body",
            componentId: "contact-simple",
            variables: {
              businessName: "Flagscale PR",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              address: "",
            },
          },
        ],
      },
    ],
  },
  null,
  2,
);
