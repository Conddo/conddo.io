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
      // --------- HOME ---------
      {
        id: "home",
        path: "/",
        label: "Home",
        sections: [
          {
            id: "home-hero",
            componentId: "hero-editorial",
            variables: {
              eyebrow: "Pan-African Public Relations",
              headline:
                "Your Brand Has a Story. We Make Sure the Right People Hear It.",
              accentPhrase: "the Right People Hear It.",
              subtext:
                "Flagscale PR helps African SMEs turn visibility into revenue, real media coverage, and lasting corporate partnerships.",
              primaryCtaText: "Book a Strategy Call",
              primaryCtaLink: "/contact",
              secondaryCtaText: "See Our Work",
              secondaryCtaLink: "/portfolio",
            },
          },
          {
            id: "home-proof",
            componentId: "proof-strip",
            variables: {
              label:
                "Trusted by growing businesses across Anglophone and Francophone Africa",
              stats: [
                "40+|Campaigns run",
                "12+|Industries served",
                "20+|Combined years",
                "2|Regions covered",
              ],
            },
          },
          {
            id: "home-pillars",
            componentId: "services-pillars",
            variables: {
              eyebrow: "What we do",
              heading: "PR solutions built for African businesses.",
              subheading:
                "Four pillars we lean into. Everything else lives under them.",
              pillars: [
                "Media Relations|Getting your business covered by the outlets that matter.",
                "Brand Building|Positioning that makes you stand out and stay memorable.",
                "Content & Social|Stories and content that sound like you and reach your audience.",
                "Crisis & Reputation|Steady, fast response when your reputation is on the line.",
              ],
              linkText: "Explore all services",
              linkHref: "/services",
            },
          },
          {
            id: "home-testimonial",
            componentId: "testimonial-centered",
            variables: {
              quote:
                "Flagscale reframed how we tell our story and the coverage followed. They understood the business before they wrote a single word.",
              attribution: "Amaka Obi",
              role: "Founder, Lagos-based SME",
            },
          },
          {
            id: "home-cta",
            componentId: "cta-band",
            variables: {
              headline:
                "Ready to get your business the visibility it deserves?",
              subtext: "Book a call and let us see if we are a fit.",
              ctaText: "Book a Strategy Call",
              ctaLink: "/contact",
            },
          },
          {
            id: "home-footer",
            componentId: "footer-brand",
            variables: {
              businessName: "Flagscale PR",
              tagline:
                "Building lasting relationships — people, passion, professionalism.",
              supportingLine:
                "Empowering African brands with expert PR to shine and thrive.",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              socialLinks: [
                "LinkedIn|https://linkedin.com/company/flagscale-pr",
                "Instagram|https://instagram.com/flagscalepr",
                "Twitter/X|https://twitter.com/flagscalepr",
                "Facebook|https://facebook.com/flagscalepr",
              ],
              legalLinks: ["Privacy|/privacy", "Terms|/terms"],
            },
          },
        ],
      },
      // --------- ABOUT ---------
      {
        id: "about",
        path: "/about",
        label: "About",
        sections: [
          {
            id: "about-body",
            componentId: "about-editorial",
            variables: {
              eyebrow: "Who we are",
              heading: "People. Passion. Professionalism.",
              body:
                "Flagscale PR was built on a simple belief: every African business has a story worth telling well.\n\nWe work with small and medium sized businesses across Africa to craft messaging that actually lands with the people it is meant for. That means media relations that get real coverage, content that builds trust, and communication strategies that hold up under pressure — not just polished words that look good in a deck.",
              pullQuote:
                "We take the time to understand your business before we ever write a word.",
              // Warmer, more on-brand context image than the previous generic
              // corporate shot. Placeholder until Flagscale delivers real
              // photography of their team / clients.
              imageUrl:
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1000&auto=format&fit=crop",
            },
          },
          {
            id: "about-vision-mission",
            componentId: "vision-mission-pair",
            variables: {
              visionLabel: "Our Vision",
              visionBody:
                "Data-driven, tailored communication for African SMEs building toward a stronger, more connected African economy.",
              missionLabel: "Our Mission",
              missionBody:
                "We help SMEs across Africa communicate clearly with the people who matter most and reach their business goals, using both traditional and new media.",
            },
          },
          {
            id: "about-values",
            componentId: "values-strip",
            variables: {
              heading: "What we hold ourselves to.",
              values: [
                "Clarity|We say what we mean, and help you do the same.",
                "Craft|Every strategy starts with real research, not templates.",
                "Trust|We build relationships that last past one campaign.",
                "Reach|We work across language and market lines, not just one country.",
              ],
            },
          },
          // Team section intentionally omitted until we have real people to
          // introduce — the previous 'Coming soon' placeholders read as an
          // unfinished site, worse than no team block at all.
          {
            id: "about-cta",
            componentId: "cta-band",
            variables: {
              headline: "Want to work with a team that gets your market?",
              ctaText: "Get in Touch",
              ctaLink: "/contact",
            },
          },
          {
            id: "about-footer",
            componentId: "footer-brand",
            variables: {
              businessName: "Flagscale PR",
              tagline:
                "Building lasting relationships — people, passion, professionalism.",
              supportingLine:
                "Empowering African brands with expert PR to shine and thrive.",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              socialLinks: [
                "LinkedIn|https://linkedin.com/company/flagscale-pr",
                "Instagram|https://instagram.com/flagscalepr",
                "Twitter/X|https://twitter.com/flagscalepr",
                "Facebook|https://facebook.com/flagscalepr",
              ],
              legalLinks: ["Privacy|/privacy", "Terms|/terms"],
            },
          },
        ],
      },
      // --------- SERVICES ---------
      {
        id: "services",
        path: "/services",
        label: "Services",
        sections: [
          {
            id: "services-hero",
            componentId: "hero-editorial",
            variables: {
              eyebrow: "What we do",
              headline: "PR Solutions Built for African Businesses",
              subtext:
                "Every service starts with the same question: who are you actually trying to reach, and what do they need to hear from you?",
            },
          },
          {
            id: "services-nav",
            componentId: "services-anchor-nav",
            variables: {
              items: [
                "Media Relations|#media-relations",
                "Content|#content-creation",
                "Social|#social-media",
                "Crisis|#crisis-management",
                "Events|#event-management",
                "Influencer|#influencer-marketing",
                "Brand|#brand-building",
                "Corporate|#corporate-comms",
              ],
            },
          },
          {
            id: "services-blocks",
            componentId: "service-blocks-alternating",
            variables: {
              blocks: [
                "media-relations|Media Relations|We build real relationships with journalists and media outlets so your business gets covered, not overlooked.|Press outreach;Media kits;Interview placements",
                "content-creation|Content Creation|Stories, articles, and brand content that sound like you and resonate with your audience.|Brand articles;Thought leadership;Press releases",
                "social-media|Social Media Management|Consistent, on-brand presence across the platforms your customers actually use.|Content calendars;Community management;Platform strategy",
                "crisis-management|Crisis Management|When things go wrong, we help you respond fast, protect your reputation, and stay in control of the narrative.|Response plans;Holding statements;Stakeholder comms",
                "event-management|Event Management|From planning to execution, we handle the details so your event runs the way it should.|Launch events;Press conferences;Media days",
                "influencer-marketing|Influencer Marketing|Connecting your brand with voices your audience already trusts.|Influencer sourcing;Campaign briefs;Performance tracking",
                "brand-building|Brand Building|Positioning that helps you stand out in a crowded market and stay memorable.|Messaging frameworks;Brand voice guides;Positioning statements",
                "corporate-comms|Corporate Communications|Clear, consistent messaging for stakeholders, partners, and investors.|Investor updates;Internal comms;Partnership announcements",
              ],
            },
          },
          {
            id: "services-process",
            componentId: "process-rings",
            variables: {
              heading: "How we work",
              steps: [
                "Discovery|We learn your business, your audience, and your goals.",
                "Strategy|We build a plan tailored to your market and objectives.",
                "Execution|We put the plan into motion across the right channels.",
                "Measurement|We track results and refine as we go.",
              ],
            },
          },
          {
            id: "services-cta",
            componentId: "cta-band",
            variables: {
              headline: "Not sure which service you need?",
              ctaText: "Talk to Us About Your PR Needs",
              ctaLink: "/contact",
            },
          },
          {
            id: "services-footer",
            componentId: "footer-brand",
            variables: {
              businessName: "Flagscale PR",
              tagline:
                "Building lasting relationships — people, passion, professionalism.",
              supportingLine:
                "Empowering African brands with expert PR to shine and thrive.",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              socialLinks: [
                "LinkedIn|https://linkedin.com/company/flagscale-pr",
                "Instagram|https://instagram.com/flagscalepr",
                "Twitter/X|https://twitter.com/flagscalepr",
                "Facebook|https://facebook.com/flagscalepr",
              ],
              legalLinks: ["Privacy|/privacy", "Terms|/terms"],
            },
          },
        ],
      },
      // --------- PORTFOLIO ---------
      {
        id: "portfolio",
        path: "/portfolio",
        label: "Portfolio",
        sections: [
          {
            id: "portfolio-hero",
            componentId: "hero-editorial",
            variables: {
              eyebrow: "Our work",
              headline: "Businesses We Have Helped Grow",
              subtext:
                "A selection of campaigns and stories we have shaped. Case studies coming soon.",
            },
          },
          // Live case studies are the highest-leverage gap. Placeholder cards
          // ('Client A / Client B') actively hurt trust — a PR agency's
          // portfolio page with no real proof reads as a red flag. Replace
          // with an honest 'coming soon' about-editorial block until we
          // have real case-study content + client permission to publish.
          {
            id: "portfolio-holding",
            componentId: "about-editorial",
            variables: {
              eyebrow: "Case studies coming soon",
              heading: "We're finishing our first public case studies.",
              body:
                "Our work spans media relations, brand building, event execution, and crisis response across Anglophone and Francophone Africa. We're building out the case studies for the campaigns we're proudest of — with client permission and real numbers, not stock photos.\n\nWant to hear about the work in the meantime? Reach out and we'll walk you through relevant examples on a call.",
              pullQuote:
                "Real numbers, real permission, no stock photos.",
            },
          },
          {
            id: "portfolio-cta",
            componentId: "cta-band",
            variables: {
              headline: "Want results like these for your business?",
              ctaText: "Start Your Project",
              ctaLink: "/contact",
            },
          },
          {
            id: "portfolio-footer",
            componentId: "footer-brand",
            variables: {
              businessName: "Flagscale PR",
              tagline:
                "Building lasting relationships — people, passion, professionalism.",
              supportingLine:
                "Empowering African brands with expert PR to shine and thrive.",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              socialLinks: [
                "LinkedIn|https://linkedin.com/company/flagscale-pr",
                "Instagram|https://instagram.com/flagscalepr",
                "Twitter/X|https://twitter.com/flagscalepr",
                "Facebook|https://facebook.com/flagscalepr",
              ],
              legalLinks: ["Privacy|/privacy", "Terms|/terms"],
            },
          },
        ],
      },
      // --------- CONTACT ---------
      {
        id: "contact",
        path: "/contact",
        label: "Contact",
        sections: [
          {
            id: "contact-hero",
            componentId: "hero-editorial",
            variables: {
              eyebrow: "Let us talk",
              headline: "Let's Build Your Brand's Story",
              subtext:
                "Ready to get your business the visibility it deserves? Reach out and let us talk.",
            },
          },
          {
            id: "contact-booking",
            componentId: "booking-form",
            variables: {
              heading: "Book a Strategy Call",
              subtext:
                "Pick a slot and share your details — every booking here lands in our team's dashboard, and you get a confirmation email.",
              slug: "flagscale-pr",
              successHeadline: "You're on the calendar",
              successBody:
                "We'll get back to you within one business day to confirm.",
            },
          },
          {
            id: "contact-form",
            componentId: "contact-two-col",
            variables: {
              businessName: "Flagscale PR",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              responseTime:
                "We respond to all inquiries within one to two business days.",
              socialLinks: [
                "LinkedIn|https://linkedin.com/company/flagscale-pr",
                "Instagram|https://instagram.com/flagscalepr",
                "Twitter/X|https://twitter.com/flagscalepr",
              ],
              helpOptions: [
                "Media Relations",
                "Brand Building",
                "Crisis Management",
                "Events",
                "Something else",
              ],
            },
          },
          {
            id: "contact-faq",
            componentId: "faq-accordion",
            variables: {
              heading: "Before you reach out",
              items: [
                "How quickly will I hear back?|We respond to all inquiries within one to two business days.",
                "Do you work with businesses outside Nigeria?|Yes. We work across Anglophone and Francophone Africa.",
                "Do you offer one-off projects or only ongoing retainers?|Both. We will recommend the right fit once we understand your goals.",
              ],
            },
          },
          {
            id: "contact-footer",
            componentId: "footer-brand",
            variables: {
              businessName: "Flagscale PR",
              tagline:
                "Building lasting relationships — people, passion, professionalism.",
              supportingLine:
                "Empowering African brands with expert PR to shine and thrive.",
              phone: "+234 905 794 4830",
              email: "contact@flagscalepr.com",
              socialLinks: [
                "LinkedIn|https://linkedin.com/company/flagscale-pr",
                "Instagram|https://instagram.com/flagscalepr",
                "Twitter/X|https://twitter.com/flagscalepr",
                "Facebook|https://facebook.com/flagscalepr",
              ],
              legalLinks: ["Privacy|/privacy", "Terms|/terms"],
            },
          },
        ],
      },
    ],
  },
  null,
  2,
);
