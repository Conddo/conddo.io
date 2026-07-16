import type { WebsiteConfig, TenantBrand, SectionProps } from "@/conddo-templates/types";
import { HeroBoldCentered } from "@/conddo-templates/sections/hero/hero-bold-centered/component";
import { HeroSplitImage } from "@/conddo-templates/sections/hero/hero-split-image/component";
import { HeroMinimal } from "@/conddo-templates/sections/hero/hero-minimal/component";
import { ProductGrid3Col } from "@/conddo-templates/sections/products/product-grid-3col/component";
import { ContactSimple } from "@/conddo-templates/sections/contact/contact-simple/component";

/**
 * The one component that renders a tenant's website. Takes the tenant's
 * {@link WebsiteConfig} + {@link TenantBrand} and dispatches each section
 * by {@code componentId} through {@link SECTION_MAP}.
 *
 * <p>Used in two places:
 * <ul>
 *   <li><b>Live preview</b> in Settings → Brand — same component so the
 *       tenant sees the exact page a visitor would.</li>
 *   <li><b>Published site</b> at {@code app/sites/[host]/page.tsx}, which
 *       fetches the config + brand server-side and passes them in.</li>
 * </ul>
 *
 * <p>Unknown {@code componentId} values render nothing (log-and-skip). This
 * matters because presets in {@code conddo-templates/presets/} may reference
 * sections that aren't in the SECTION_MAP yet (the library grows over time);
 * skipping them means a partially-shipped preset still renders the sections
 * we DO have, rather than crashing the whole page.
 */
export function WebsiteRenderer({
  config,
  brand,
}: {
  config: WebsiteConfig;
  brand: TenantBrand;
}) {
  return (
    <div style={{ fontFamily: fontStackFor(brand.fontPairing) }}>
      {config.sections.map((section) => {
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
 */
export const SECTION_MAP: Record<string, React.ComponentType<SectionProps>> = {
  "hero-bold-centered": HeroBoldCentered,
  "hero-split-image": HeroSplitImage,
  "hero-minimal": HeroMinimal,
  "product-grid-3col": ProductGrid3Col,
  "contact-simple": ContactSimple,
  // TODO: services-cards, testimonials-cards, gallery-grid, booking-simple,
  // services-list, product-list — land these as component + manifest in
  // conddo-templates/sections/ then add the SECTION_MAP row here.
};

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
