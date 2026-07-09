// Website module — typed API surface. Endpoint: ACTION_LIST §11.2.
// Public site key + integration metadata spec: backend/WEBSITE_INTEGRATION_SPEC.md.
import { api } from "./client";

export type WebsiteStatus = {
  subdomain?: string;
  status?: string;
  visitsToday?: number;
  enquiries?: number;
};

export type WebsiteChangeRequestInput = { area?: string; details: string };
export type WebsiteChangeRequest = {
  id: string;
  area: string | null;
  details: string;
  status: string;
  createdAt: string;
};

/** Section the BE knows how to render on the tenant's website (e.g. "hero",
 *  "products", "contact"). `configured: false` means BE has the slot but the
 *  tenant hasn't filled it in yet — useful for the website page's TODO list. */
export type WebsiteSection = {
  type: string;
  label: string;
  configured: boolean;
};

export type WebsiteTopPage = { path: string; views: number };

/** Site-wide analytics envelope BE returns from /website/analytics. `range`
 *  echoes the query param (default "30d"). `topPages` is reserved for the
 *  future — empty array today. */
export type WebsiteAnalytics = {
  range: string;
  visits: number;
  enquiries: number;
  topPages: WebsiteTopPage[];
};

// Public site registration — one row per tenant in `tenant_sites`. The
// apiKey is the public-safe X-Conddo-Site-Key the dev embeds in the
// tenant's site frontend. `siteType` tells us if it's a custom build or a
// template; `qaApproved` gates whether the site can serve traffic.
export type TenantSite = {
  id: string;
  tenantId: string;
  subdomain: string | null;
  customDomain: string | null;
  hostingProvider: "conddo" | "vercel" | "9stacks" | null;
  siteType: "custom_built" | "template" | null;
  apiKey: string;                  // full key, only returned to TENANT_ADMIN
  apiKeyMasked: string;            // e.g. "sk_live_••••••••a3f2" — always present
  isActive: boolean;
  qaApproved: boolean;
  qaApprovedAt: string | null;
  submittedUrl: string | null;     // URL the developer submitted for QA
  createdAt: string;
};

export const websiteApi = {
  status: () => api.get<WebsiteStatus>("/website"),
  requestChange: (body: WebsiteChangeRequestInput) =>
    api.post<WebsiteChangeRequest>("/website/change-requests", body),

  // GET /website/site — the tenant_sites row for the current tenant. Returns
  // the full apiKey (TENANT_ADMIN only); STAFF gets a 403. 404 if the tenant
  // has no site row yet (haven't been registered by Studio).
  site: () => api.get<TenantSite>("/website/site"),

  // POST /website/site/regenerate-key — rotate the API key. Invalidates the
  // old one immediately, returns the new one. TENANT_ADMIN only.
  regenerateSiteKey: () => api.post<TenantSite>("/website/site/regenerate-key"),

  /** Self-service submit + activate. Tenant confirms their site is live
   *  at {@code submittedUrl}; row flips to is_active=true immediately. */
  activateSite: (submittedUrl: string) =>
    api.post<TenantSite>("/website/site/activate", { submittedUrl }),

  /** Take the site offline without deleting the record. */
  deactivateSite: () => api.post<TenantSite>("/website/site/deactivate"),

  /** Submit the URL for Studio's featured-sites review — separate from
   *  activation, purely for the platform "Sites we love" badge. */
  submitForReview: (submittedUrl: string) =>
    api.post<TenantSite>("/website/site/submit", { submittedUrl }),

  /** Attach (or change) the tenant's custom domain — bare hostname only, no
   *  scheme or path. BE validates + returns the updated site row. */
  connectDomain: (domain: string) =>
    api.post<TenantSite>("/website/domain", { domain }),

  /** Section catalogue for the current tenant — which sections BE knows
   *  how to render, and which ones the tenant has actually filled in. */
  sections: () => api.get<WebsiteSection[]>("/website/sections"),

  /** Tenant's own pending/closed change requests (the POST sibling already
   *  exists as `requestChange`). */
  changeRequests: () => api.get<WebsiteChangeRequest[]>("/website/change-requests"),

  /** Site analytics aggregated over `range` (default "30d"). Placeholder
   *  numbers today — BE will fill in real traffic when ingestion lands. */
  analytics: (range?: string) =>
    api.get<WebsiteAnalytics>(`/website/analytics${range ? `?range=${encodeURIComponent(range)}` : ""}`),
};
