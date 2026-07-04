// Public read of a Conddo-managed website. Server-only — called from the
// /sites/[host] route's server component to render the AI-generated site.

export type ManagedSiteTheme = {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
};

export type ManagedSite = {
  businessName: string;
  verticalId: string | null;
  slug: string;
  customDomain: string | null;
  sections: Record<string, unknown> | null;
  theme: ManagedSiteTheme | null;
  publishedAt: string | null;
};

type Envelope = {
  success: boolean;
  data?: ManagedSite;
  error?: { code?: string; message?: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Server-side fetch of a managed site by host. Returns null (not throws) on
 * any failure so the caller can 404 gracefully — the middleware already
 * matched this as "not-apex, not-preview", so 404 renders our own not-found
 * page rather than a stack trace.
 */
export async function fetchManagedSite(host: string): Promise<ManagedSite | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/managed-site?host=${encodeURIComponent(host)}`,
      {
        // Managed sites revalidate on the route level; no need to force
        // no-store here. `next.revalidate` on the route wins.
        headers: { Accept: "application/json" },
        cache: "force-cache",
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const envelope = (await res.json()) as Envelope;
    return envelope.data ?? null;
  } catch {
    return null;
  }
}
