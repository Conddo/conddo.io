"use client";

import { useManifests } from "./useManifests";

// App-level routes always available regardless of plan/vertical. These are
// FE-only meta surfaces (settings, search, notifications) and FE-only
// vertical pages whose BE manifest entry hasn't shipped yet — the latter
// MUST be listed here too, otherwise the AppShell plan-guard in
// AppShell.tsx bounces them to /dashboard the instant the manifest loads
// (which is exactly what happened to /features + /pharmacy/emr until they
// were added here). Keep this in sync with the splices in useAppNav.ts.
const ALWAYS_ALLOWED = [
  "/dashboard",
  "/settings",
  "/search",
  "/notifications",
  // Roadmap + "Request Beta access" — every tenant, every vertical.
  "/features",
  // Invoicing spliced in via PLATFORM_EXTRAS with no BE manifest entry.
  // The /invoices page renders a PLAN_UPGRADE_REQUIRED nudge for tenants
  // below Growth — but only if it can mount. Without this entry the
  // AppShell plan-guard bounces every non-Growth tenant back to
  // /dashboard the moment they click Invoices in the sidebar (which is
  // exactly the pharmacy-tenant bug we saw in July 2026).
  "/invoices",
  // EMR index + per-customer record pages. Pharmacy-only at the page level
  // (the page itself renders an empty state for non-pharmacy verticals), so
  // allowing the path for all is harmless — the page does the gating.
  "/pharmacy/emr",
];

/**
 * The active module nav-paths for the current tenant (from the manifest), or
 * `null` when the session is unguarded — i.e. there are no manifests, so nav
 * falls back to the static APP_NAV and every route stays reachable (older login
 * tokens without `activeModules`). When non-null, routes outside this set + the
 * always-allowed app routes should be blocked (Architecture §10 module access).
 */
export function useActiveModulePaths(): string[] | null {
  const { manifests } = useManifests();
  if (!manifests || manifests.length === 0) return null;
  return manifests.map((m) => m.navItem?.path).filter((p): p is string => Boolean(p));
}

/** Whether `pathname` is within the allowed module paths (+ always-allowed routes). */
export function isPathAllowed(pathname: string, modulePaths: string[]): boolean {
  return [...ALWAYS_ALLOWED, ...modulePaths].some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
