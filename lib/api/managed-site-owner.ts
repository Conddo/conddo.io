// Owner-side managed website API — used by the dashboard's website page to
// read draft + live state and to publish. Distinct from
// `lib/api/managed-site.ts` (server-only, public read).

import { api } from "./client";

export type ManagedSiteOwner = {
  subdomain: string;
  customDomain: string | null;
  publishedAt: string | null;
  draftSections: Record<string, unknown> | null;
  draftTheme: Record<string, unknown> | null;
  sections: Record<string, unknown> | null;
  theme: Record<string, unknown> | null;
};

/** GET /api/v1/website/managed — returns null when the tenant has no
 *  managed row yet (legacy pre-V60 tenants). */
export async function getManagedSite(): Promise<ManagedSiteOwner | null> {
  const { data } = await api.get<ManagedSiteOwner | null>("/website/managed");
  return data ?? null;
}

/** POST /api/v1/website/publish — promotes draft to live, stamps publishedAt. */
export async function publishManagedSite(): Promise<ManagedSiteOwner> {
  const { data } = await api.post<ManagedSiteOwner>("/website/publish");
  return data;
}

/** As a Result for useApiQuery. */
export const managedSiteQuery = () => api.get<ManagedSiteOwner | null>("/website/managed");

/** Builds the live URL for the site. Prefers customDomain when set. */
export function liveUrlFor(site: ManagedSiteOwner): string {
  if (site.customDomain) return `https://${site.customDomain}`;
  return `https://${site.subdomain}.getconddo.com`;
}
