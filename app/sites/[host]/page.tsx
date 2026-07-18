import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WebsiteRenderer } from "@/components/website/WebsiteRenderer";
import { fetchManagedSite } from "@/lib/api/managed-site";
import type { TenantBrand, WebsiteConfig } from "@/conddo-templates/types";

/**
 * Managed tenant site route — {@code <slug>.getconddo.com/*} rewrites to
 * {@code /sites/[host]/*} (see {@code middleware.ts}). Fetches the
 * published site config + brand server-side and passes them to
 * {@link WebsiteRenderer}, which dispatches each section through
 * {@code SECTION_MAP} in {@code conddo-templates}.
 *
 * <p>Legacy shape support: prior to the SECTION_MAP swap the BE stored
 * sections as a flat object ({@code {hero: {...}, services: [...]}} etc);
 * the new shape is an array ({@code {sections: [{componentId, variables}]}}).
 * When the fetched payload is in the legacy shape, {@code adaptSectionsShape}
 * projects it into the array form so an existing tenant's live site keeps
 * rendering after this deploy.
 */
export const revalidate = 60;

type Props = {
  params: Promise<{ host: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { host } = await params;
  const site = await fetchManagedSite(host);
  if (!site) return { title: "Site not found" };
  return {
    title: site.businessName,
    description: `Welcome to ${site.businessName}.`,
  };
}

export default async function ManagedSitePage({ params }: Props) {
  const { host } = await params;
  const site = await fetchManagedSite(host);
  if (!site) notFound();

  const config: WebsiteConfig = { sections: adaptSectionsShape(site.sections) };
  const brand: TenantBrand = {
    logoUrl: site.logoUrl ?? null,
    primaryColor: site.theme?.primaryColor ?? "#7C5CBF",
    secondaryColor: site.theme?.secondaryColor ?? "#141414",
    fontPairing: site.theme?.fontPairing ?? "inter",
  };

  return <WebsiteRenderer config={config} brand={brand} />;
}

/**
 * Accept both the new array shape and the legacy flat-object shape.
 * Returns [] when the payload can't be interpreted — the caller renders
 * whatever else it can (the brand-only wrapper) rather than crashing.
 */
function adaptSectionsShape(
  raw: Record<string, unknown> | null | undefined,
): WebsiteConfig["sections"] {
  if (!raw) return [];

  // v2 shape — { sections: [{id, componentId, variables}] }
  if (Array.isArray((raw as { sections?: unknown }).sections)) {
    return (raw as { sections: WebsiteConfig["sections"] }).sections;
  }

  // Legacy shape — flat object with named keys. Map each known section to
  // a v2 entry using its most natural component id. Skips any key we can't
  // map so a partial payload still renders the pieces we understand.
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
    // Legacy stored services as [{name, description}]; map to
    // "name|price|description" strings the services-cards component reads.
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
  return out;
}

function readObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
