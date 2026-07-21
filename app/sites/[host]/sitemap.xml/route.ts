import { fetchManagedSite } from "@/lib/api/managed-site";

/**
 * Per-tenant sitemap at {@code <slug>.getconddo.com/sitemap.xml}. Reads
 * the tenant's managed-site config from the BE and emits one URL entry
 * per {@code WebsitePage.path}. Multi-page tenants therefore get every
 * page indexable; single-page (legacy) tenants get just the root URL.
 *
 * <p>Any page whose {@code showInNav === false} is still included — the
 * nav flag is about visibility to humans, not to crawlers.
 */
export const revalidate = 300;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ host: string }> },
): Promise<Response> {
  const { host } = await params;
  const site = await fetchManagedSite(host);
  const base = `https://${host}`;

  // Resolve every distinct path the tenant has published. Multi-page sites
  // read the pages array; single-page or unpublished sites fall through
  // to just the root URL.
  const paths = extractPaths(site?.sections);
  const lastMod = site?.publishedAt ?? new Date().toISOString();

  const urls = paths
    .map(
      (p) =>
        `  <url>\n` +
        `    <loc>${xmlEscape(base + p)}</loc>\n` +
        `    <lastmod>${xmlEscape(lastMod)}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n` +
        `  </url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

/** Pull every {@code page.path} out of the managed-site payload. Handles
 *  v3 pages, v2 sections-array (single-page), and v1 flat-object (single-
 *  page) shapes. Deduplicates + guarantees "/" is present. */
function extractPaths(raw: Record<string, unknown> | null | undefined): string[] {
  const paths = new Set<string>();
  paths.add("/");
  if (!raw) return [...paths];
  const pages = (raw as { pages?: Array<{ path?: string }> }).pages;
  if (Array.isArray(pages)) {
    for (const p of pages) {
      if (typeof p?.path === "string" && p.path.startsWith("/")) {
        paths.add(p.path);
      }
    }
  }
  return [...paths];
}
