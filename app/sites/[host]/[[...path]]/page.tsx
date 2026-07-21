import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { WebsiteRenderer } from "@/components/website/WebsiteRenderer";
import { fetchManagedSite } from "@/lib/api/managed-site";
import type {
  TenantBrand,
  WebsiteConfig,
  WebsitePage,
} from "@/conddo-templates/types";

/**
 * Catch-all managed site route — {@code <slug>.getconddo.com/*} rewrites
 * to {@code /sites/[host]/[[...path]]/page.tsx} via middleware.
 *
 * <p>The optional catch-all matches root ({@code path === undefined}) and
 * every deeper path so multi-page sites all live on the same route file.
 *
 * <p>Two payload shapes are supported:
 * <ul>
 *   <li><b>v2 legacy single-page</b> — {@code {sections: [...]}} at the
 *       root. Rendered on every path (the tenant only has one page).</li>
 *   <li><b>v3 multi-page</b> — {@code {pages: [{path, sections, …}]}}.
 *       The renderer picks the page whose {@code path} matches the URL
 *       and renders that page's sections.</li>
 * </ul>
 * A {@code page.path} that doesn't match yields a 404.
 */
export const revalidate = 60;

type Props = {
  params: Promise<{ host: string; path?: string[] }>;
};

function normalisePath(segments: string[] | undefined): string {
  if (!segments || segments.length === 0) return "/";
  return "/" + segments.map((s) => decodeURIComponent(s)).join("/");
}

function pickPage(
  config: WebsiteConfig,
  path: string,
): WebsitePage | { sections: WebsiteConfig["sections"] } | null {
  if (config.pages && config.pages.length > 0) {
    return config.pages.find((p) => p.path === path) ?? null;
  }
  // Legacy single-page: any path resolves to the root sections. This
  // preserves compat with tenants who published under the v2 shape.
  return { sections: config.sections };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { host, path } = await params;
  const site = await fetchManagedSite(host);
  if (!site) return { title: "Site not found" };

  // Override every Conddo-identity meta so a tenant's site never leaks the
  // platform brand into the mobile browser chrome / home-screen shortcut.
  // The parent app/layout.tsx sets title/applicationName/appleWebApp.title
  // to "Conddo" — those values propagate to every route unless we replace
  // them here.
  const businessName = site.businessName;
  const currentPath = normalisePath(path);
  const description = deriveDescription(site.sections, businessName);
  const canonical = `https://${host}${currentPath}`;

  return {
    title: businessName,
    description,
    applicationName: businessName,
    appleWebApp: {
      capable: true,
      title: businessName,
      statusBarStyle: "default",
    },
    icons: site.logoUrl
      ? {
          icon: site.logoUrl,
          apple: site.logoUrl,
        }
      : undefined,
    // Alternate/canonical tells Google which URL is the primary one when
    // the same content is reachable via multiple paths / hosts.
    alternates: { canonical },
    openGraph: {
      title: businessName,
      siteName: businessName,
      description,
      url: canonical,
      type: "website",
      images: site.logoUrl ? [{ url: site.logoUrl, alt: businessName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: businessName,
      description,
      images: site.logoUrl ? [site.logoUrl] : undefined,
    },
  };
}

/** Best-effort SEO description from the tenant's hero copy. Falls back to
 *  a neutral one-liner when there's nothing hero-shaped to read. */
function deriveDescription(
  raw: Record<string, unknown> | null | undefined,
  businessName: string,
): string {
  const fallback = `${businessName} — book online, learn about our work, and get in touch.`;
  if (!raw) return fallback;
  // v3 pages shape — pull from the first section on the first page.
  const pages = (raw as { pages?: Array<{ sections?: Array<{ variables?: Record<string, unknown> }> }> }).pages;
  if (Array.isArray(pages) && pages.length > 0) {
    const firstSection = pages[0]?.sections?.[0];
    const vars = firstSection?.variables;
    const subtext = pickString(vars, "subtext") ?? pickString(vars, "subheadline") ?? pickString(vars, "tagline");
    if (subtext) return truncate(subtext, 200);
  }
  return fallback;
}

function pickString(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

/** Per-tenant theme-color so the mobile browser address bar tints with the
 *  tenant's brand primary, not the platform default violet. Also drives the
 *  installed-PWA titlebar color on Android. */
export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { host } = await params;
  const site = await fetchManagedSite(host);
  return {
    themeColor: site?.theme?.primaryColor ?? "#FFFFFF",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

export default async function ManagedSitePage({ params }: Props) {
  const { host, path } = await params;
  const site = await fetchManagedSite(host);
  if (!site) notFound();

  const config: WebsiteConfig = adaptConfig(site.sections);
  const currentPath = normalisePath(path);
  const currentPage = pickPage(config, currentPath);
  if (!currentPage) notFound();

  const brand: TenantBrand = {
    logoUrl: site.logoUrl ?? null,
    primaryColor: site.theme?.primaryColor ?? "#7C5CBF",
    secondaryColor: site.theme?.secondaryColor ?? "#141414",
    fontPairing: site.theme?.fontPairing ?? "inter",
  };

  // LocalBusiness JSON-LD — the schema Google reads to enrich search
  // results with the tenant's name, logo, phone, and social profiles.
  // Rendered inline via a <script type="application/ld+json"> which is
  // the schema.org-recommended embedding pattern.
  const contactBlock = findContactSection(site.sections);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.businessName,
    url: `https://${host}/`,
    ...(site.logoUrl ? { logo: site.logoUrl, image: site.logoUrl } : {}),
    ...(contactBlock?.email ? { email: contactBlock.email } : {}),
    ...(contactBlock?.phone ? { telephone: contactBlock.phone } : {}),
    ...(contactBlock?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: contactBlock.address,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD payload is safe to inline as long as it's serialised —
        // it is not HTML and never runs. Next escapes </script> for us.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WebsiteRenderer
        config={config}
        brand={brand}
        businessName={site.businessName}
        currentPath={currentPath}
      />
    </>
  );
}

/** Pull an email / phone / address out of a contact-style section so
 *  the LocalBusiness JSON-LD can carry the tenant's real details. */
function findContactSection(
  raw: Record<string, unknown> | null | undefined,
): { email?: string; phone?: string; address?: string } | null {
  if (!raw) return null;
  const pages = (raw as { pages?: Array<{ sections?: Array<{ componentId?: string; variables?: Record<string, unknown> }> }> }).pages;
  if (Array.isArray(pages)) {
    for (const p of pages) {
      for (const s of p.sections ?? []) {
        if (typeof s.componentId === "string" && s.componentId.startsWith("contact")) {
          const v = s.variables ?? {};
          return {
            email: pickString(v, "email"),
            phone: pickString(v, "phone"),
            address: pickString(v, "address"),
          };
        }
      }
    }
  }
  return null;
}

/**
 * Accept every historical payload shape. Returns a WebsiteConfig that
 * always has a defined {@code sections} or {@code pages} property.
 *
 * Shapes seen in the wild:
 *  A. v3 multi-page: {@code {pages: [{path, sections, label}]}}
 *  B. v2 single-page array: {@code {sections: [{componentId, variables}]}}
 *  C. v1 flat named-key object: {@code {hero: {...}, services: [...], …}}
 *
 * Only A + B ship from our current admin panel; C is preserved so
 * pre-swap tenants keep rendering.
 */
function adaptConfig(
  raw: Record<string, unknown> | null | undefined,
): WebsiteConfig {
  if (!raw) return { sections: [] };

  if (Array.isArray((raw as { pages?: unknown }).pages)) {
    return {
      pages: (raw as { pages: WebsitePage[] }).pages,
      nav: (raw as { nav?: WebsiteConfig["nav"] }).nav,
    };
  }
  if (Array.isArray((raw as { sections?: unknown }).sections)) {
    return { sections: (raw as { sections: WebsiteConfig["sections"] }).sections };
  }

  // v1 flat — map named keys to a single-page section array.
  const out: WebsiteConfig["sections"] = [];
  const hero = readObject(raw.hero);
  if (hero) {
    out.push({
      id: "hero",
      componentId: "hero-bold-centered",
      variables: {
        businessName: str(hero.businessName) ?? "",
        tagline: str(hero.headline) ?? str(hero.tagline) ?? "",
        subtext: str(hero.subheadline) ?? str(hero.subtext) ?? "",
        ctaText: str(hero.ctaLabel) ?? str(hero.ctaText) ?? "Contact us",
        ctaLink: str(hero.ctaLink) ?? "#contact",
      },
    });
  }
  const about = readObject(raw.about);
  if (about) {
    out.push({
      id: "about",
      componentId: "about-simple",
      variables: {
        eyebrow: str(about.eyebrow) ?? "",
        heading: str(about.title) ?? str(about.heading) ?? "About us",
        body: str(about.body) ?? "",
      },
    });
  }
  const services = raw.services;
  if (Array.isArray(services) && services.length > 0) {
    const list = services
      .map((s) => {
        const so = readObject(s) ?? {};
        const name = str(so.name) ?? str(so.title) ?? "";
        const price = str(so.price) ?? "On request";
        const desc = str(so.description) ?? "";
        return name ? `${name}|${price}|${desc}` : null;
      })
      .filter((s): s is string => s !== null);
    if (list.length > 0) {
      out.push({
        id: "services",
        componentId: "services-cards",
        variables: { heading: "What we do", services: list },
      });
    }
  }
  const contact = readObject(raw.contact);
  if (contact) {
    out.push({
      id: "contact",
      componentId: "contact-simple",
      variables: {
        businessName: str(contact.businessName) ?? "",
        phone: str(contact.phone) ?? "",
        email: str(contact.email) ?? "",
        address: str(contact.address) ?? "",
      },
    });
  }
  return { sections: out };
}

function readObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
