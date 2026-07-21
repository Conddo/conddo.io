import type { MetadataRoute } from "next";
import { APP_DOMAIN } from "@/lib/brand";

/**
 * Main-app sitemap at {@code app.getconddo.com/sitemap.xml}. Lists every
 * indexable marketing route so Google finds them without crawling the
 * auth-gated dashboard.
 *
 * <p>Tenant public sites have their own per-host sitemap emitted from
 * {@code app/sites/[host]/sitemap.xml/route.ts} — that one is dynamic
 * because a tenant's page list is stored in the DB and can change per
 * publish.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://app.${APP_DOMAIN}`;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/product`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/businesses`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
