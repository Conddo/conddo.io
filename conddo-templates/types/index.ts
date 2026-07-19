/**
 * Shared types for the Conddo website template catalogue.
 *
 * These types are the ONLY contract between:
 *   - the template components in `sections/`
 *   - the `WebsiteRenderer` that assembles them
 *   - the AI Provisioning Service that picks sections from manifests
 *
 * Change carefully — a new required field on `SectionProps` invalidates
 * every existing manifest until it's added.
 */

export type FontPairing = "inter" | "playfair" | "poppins" | "lato";

/** Brand identity for a tenant — the four fields every section reads. */
export interface TenantBrand {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontPairing: FontPairing;
}

/** Every section component receives EXACTLY these two props. */
export interface SectionProps {
  /** Free-form content for the section. Keys are declared in the section's
   *  `manifest.json > variables`. Values can be strings OR string arrays
   *  (e.g. a product list is `string[]`; a headline is `string`). */
  variables: Record<string, string | string[]>;
  brand: TenantBrand;
}

/** Manifest schema — one per section folder. Loaded by the AI Provisioning
 *  Service so it can pick sections that fit the tenant's vertical + style. */
export interface SectionManifest {
  /** Directory name — kebab-case, unique across the whole catalogue. */
  id: string;
  category:
    | "hero"
    | "products"
    | "services"
    | "booking"
    | "gallery"
    | "testimonials"
    | "contact";
  /** Verticals this section fits well (see presets/*.json for the taxonomy). */
  vertical_fit: string[];
  /** Style tags — used for similarity search when the AI matches a style
   *  brief against the catalogue. */
  style_tags: string[];
  /** Variable keys the component expects to receive. Every key here should
   *  be referenced in the component's JSX. */
  variables: string[];
  /** Human-readable description used by the AI for semantic search
   *  (embedded via Jina AI in the provisioning pipeline). */
  description: string;
  /** Origin + licensing when the section was adapted from a third-party
   *  source (Magic-generated, ported from a reference repo, …). Optional
   *  for hand-authored components with `type: "hand-authored"`. */
  source?: SectionSource;
}

export interface SectionSource {
  type: "hand-authored" | "21st-magic" | "adapted";
  /** Upstream URL when {@code type !== "hand-authored"}. */
  url: string | null;
  /** SPDX identifier (MIT / Apache-2.0 / …) when {@code type !== "hand-authored"}. */
  license: string;
}

/** Per-vertical default configuration — the AI Provisioning Service picks
 *  a preset first, then swaps in tenant-specific variable values. */
export interface VerticalPreset {
  vertical: string;
  /** Section ids to render in order. */
  default_sections: string[];
  /** Themes that pair well; the AI picks one when the tenant hasn't
   *  chosen colours yet. */
  recommended_themes: string[];
  /** Sections a tenant cannot remove. */
  required_sections: string[];
}

/** Website configuration — the payload that drives the WebsiteRenderer.
 *  Persisted per-tenant in `tenant_sites.sections` (JSONB).
 *
 *  Two shapes are supported for backward compat:
 *   - Legacy single-page: {@code sections} at the root. Renders every
 *     section on the tenant's root URL, no nav bar.
 *   - Multi-page (v3+): {@code pages} + optional {@code nav}. Each page
 *     has its own {@code path} + section list. The renderer picks the
 *     page whose path matches the incoming URL and draws a nav bar at
 *     the top when there is more than one page.
 *
 *  When both are present, {@code pages} wins — {@code sections} is
 *  treated as a fallback for readers that don't understand pages. */
export interface WebsiteConfig {
  sections?: WebsiteSection[];
  pages?: WebsitePage[];
  /** Nav bar controls — how the header renders. Optional; defaults to
   *  {@code showLogo=true, style="light"}. */
  nav?: {
    showLogo?: boolean;
    style?: "light" | "dark";
  };
}

export interface WebsiteSection {
  /** Stable id for the row — used as React key + for reorder ops. */
  id: string;
  /** Foreign key into the SECTION_MAP in WebsiteRenderer. */
  componentId: string;
  variables: Record<string, string | string[]>;
}

/** One page in a multi-page site. {@code path} is URL-relative
 *  ({@code "/"}, {@code "/services"}, {@code "/about"} …). {@code label}
 *  is what appears in the nav bar. */
export interface WebsitePage {
  /** Stable id for reorder + React key. */
  id: string;
  /** URL path relative to the tenant subdomain root. Must start with
   *  {@code "/"}. The home page is {@code "/"}. */
  path: string;
  /** Nav-bar label. */
  label: string;
  /** Whether the page appears in the nav bar. {@code false} = orphan
   *  page reachable only via direct link (e.g. thank-you pages). */
  showInNav?: boolean;
  sections: WebsiteSection[];
}
