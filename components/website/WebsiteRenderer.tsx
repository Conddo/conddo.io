import type {
  WebsiteConfig,
  TenantBrand,
  SectionProps,
  WebsiteSection,
} from "@/conddo-templates/types";
import { HeroBoldCentered } from "@/conddo-templates/sections/hero/hero-bold-centered/component";
import { HeroSplitImage } from "@/conddo-templates/sections/hero/hero-split-image/component";
import { HeroMinimal } from "@/conddo-templates/sections/hero/hero-minimal/component";
import { HeroEditorial } from "@/conddo-templates/sections/hero/hero-editorial/component";
import { AboutSimple } from "@/conddo-templates/sections/about/about-simple/component";
import { AboutEditorial } from "@/conddo-templates/sections/about/about-editorial/component";
import { ProductGrid3Col } from "@/conddo-templates/sections/products/product-grid-3col/component";
import { ProductList } from "@/conddo-templates/sections/products/product-list/component";
import { ServicesCards } from "@/conddo-templates/sections/services/services-cards/component";
import { ServicesList } from "@/conddo-templates/sections/services/services-list/component";
import { ServicesPillars } from "@/conddo-templates/sections/services/services-pillars/component";
import { TestimonialsCards } from "@/conddo-templates/sections/testimonials/testimonials-cards/component";
import { TestimonialCentered } from "@/conddo-templates/sections/testimonials/testimonial-centered/component";
import { GalleryGrid } from "@/conddo-templates/sections/gallery/gallery-grid/component";
import { BookingSimple } from "@/conddo-templates/sections/booking/booking-simple/component";
import { ContactSimple } from "@/conddo-templates/sections/contact/contact-simple/component";
import { ProofStrip } from "@/conddo-templates/sections/trust/proof-strip/component";
import { CtaBand } from "@/conddo-templates/sections/cta/cta-band/component";
import { FooterBrand } from "@/conddo-templates/sections/footer/footer-brand/component";
import { NavHeader } from "@/conddo-templates/sections/nav/nav-header/component";
import { ValuesStrip } from "@/conddo-templates/sections/about/values-strip/component";
import { VisionMissionPair } from "@/conddo-templates/sections/about/vision-mission-pair/component";
import { TeamGrid } from "@/conddo-templates/sections/about/team-grid/component";
import { ServicesAnchorNav } from "@/conddo-templates/sections/services/services-anchor-nav/component";
import { ServiceBlocksAlternating } from "@/conddo-templates/sections/services/service-blocks-alternating/component";
import { ProcessRings } from "@/conddo-templates/sections/services/process-rings/component";
import { PortfolioFilterGrid } from "@/conddo-templates/sections/gallery/portfolio-filter-grid/component";
import { ContactTwoCol } from "@/conddo-templates/sections/contact/contact-two-col/component";
import { FaqAccordion } from "@/conddo-templates/sections/contact/faq-accordion/component";

/**
 * The one component that renders a tenant's website. Takes the tenant's
 * {@link WebsiteConfig} + {@link TenantBrand} + the current URL path and
 * dispatches each section by {@code componentId} through {@link SECTION_MAP}.
 *
 * <p>Multi-page: when {@code config.pages} exists and has more than one
 * entry, a {@link NavHeader} is rendered at the top and the current page's
 * sections are rendered below. Single-page (legacy) sites render
 * {@code config.sections} directly with no nav.
 */
export function WebsiteRenderer({
  config,
  brand,
  businessName,
  currentPath = "/",
}: {
  config: WebsiteConfig;
  brand: TenantBrand;
  /** Falls back to the first non-blank hero variable when omitted. */
  businessName?: string;
  /** Which page to render — the incoming URL path. Defaults to "/". */
  currentPath?: string;
}) {
  const pages = config.pages ?? [];
  const isMultiPage = pages.length > 1;
  const currentSections: WebsiteSection[] = isMultiPage
    ? (pages.find((p) => p.path === currentPath) ?? pages[0]).sections
    : (pages[0]?.sections ?? config.sections ?? []);

  return (
    <div style={{ fontFamily: fontStackFor(brand.fontPairing) }}>
      {isMultiPage && (
        <NavHeader
          brand={brand}
          businessName={businessName ?? deriveBusinessName(currentSections)}
          pages={pages}
          currentPath={currentPath}
        />
      )}
      {currentSections.map((section) => {
        const SectionComponent = SECTION_MAP[section.componentId];
        if (!SectionComponent) {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn(
              `WebsiteRenderer: no component registered for id "${section.componentId}"`,
            );
          }
          return null;
        }
        return (
          <SectionComponent
            key={section.id}
            variables={section.variables}
            brand={brand}
          />
        );
      })}
    </div>
  );
}

/**
 * The one-and-only registry mapping {@code componentId} → React component.
 * Adding a new section requires: create the component under
 * {@code conddo-templates/sections/…}, drop its manifest, then add ONE line
 * here. That's the whole checklist.
 *
 * <p>Note: {@code nav-header} is deliberately NOT in the map because its
 * props are structured ({@code pages: WebsitePage[]}) rather than the
 * flat {@code variables} SectionProps contract. It's rendered directly
 * by {@link WebsiteRenderer} when a multi-page config is present.
 */
export const SECTION_MAP: Record<string, React.ComponentType<SectionProps>> = {
  "hero-bold-centered": HeroBoldCentered,
  "hero-split-image": HeroSplitImage,
  "hero-minimal": HeroMinimal,
  "hero-editorial": HeroEditorial,
  "about-simple": AboutSimple,
  "about-editorial": AboutEditorial,
  "product-grid-3col": ProductGrid3Col,
  "product-list": ProductList,
  "services-cards": ServicesCards,
  "services-list": ServicesList,
  "services-pillars": ServicesPillars,
  "testimonials-cards": TestimonialsCards,
  "testimonial-centered": TestimonialCentered,
  "gallery-grid": GalleryGrid,
  "booking-simple": BookingSimple,
  "contact-simple": ContactSimple,
  "proof-strip": ProofStrip,
  "cta-band": CtaBand,
  "footer-brand": FooterBrand,
  "values-strip": ValuesStrip,
  "vision-mission-pair": VisionMissionPair,
  "team-grid": TeamGrid,
  "services-anchor-nav": ServicesAnchorNav,
  "service-blocks-alternating": ServiceBlocksAlternating,
  "process-rings": ProcessRings,
  "portfolio-filter-grid": PortfolioFilterGrid,
  "contact-two-col": ContactTwoCol,
  "faq-accordion": FaqAccordion,
};

/** Best-effort recovery of a business name from any hero-style section. */
function deriveBusinessName(sections: WebsiteSection[]): string {
  for (const s of sections) {
    const n = s.variables?.businessName;
    if (typeof n === "string" && n.trim()) return n;
  }
  return "Home";
}

/** Font-pairing id → CSS font stack. Kept centralised so components never
 *  hardcode font families — they just consume brand.fontPairing and this
 *  map picks the actual stack. Extend the same day you add a font choice
 *  to the Brand settings picker. */
function fontStackFor(pairing: TenantBrand["fontPairing"]): string {
  switch (pairing) {
    case "playfair":
      return `"Playfair Display", Georgia, "Times New Roman", serif`;
    case "poppins":
      return `Poppins, "Helvetica Neue", Helvetica, Arial, sans-serif`;
    case "lato":
      return `Lato, "Helvetica Neue", Helvetica, Arial, sans-serif`;
    case "inter":
    default:
      return `Inter, "Helvetica Neue", Helvetica, Arial, sans-serif`;
  }
}
