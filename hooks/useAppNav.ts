"use client";

import { Home, Settings, Activity, Sparkles, Package, Scissors, FileText } from "lucide-react";
import { useManifests } from "./useManifests";
import { useApiQuery } from "./useApiQuery";
import { iconFor } from "@/lib/manifest/icons";
import { meQuery } from "@/lib/api/account";
import { verticalOf, type VerticalId } from "@/lib/verticalCopy";
import type { NavLink } from "@/lib/manifest/types";

// App-level entries the tool catalogue doesn't own — always present, bracketing
// the manifest-driven tool sections.
const HOME: NavLink = { label: "Home", href: "/dashboard", icon: Home };
const SETTINGS: NavLink = { label: "Settings", href: "/settings", icon: Settings };

/** Splice entry — pairs a NavLink with an anchor href to position it next to
 *  conceptually-related items. If the anchor isn't present in the current
 *  manifest sections, the item lands at the end (before Settings). */
type SpliceEntry = { item: NavLink; insertAfter: string };

/** Vertical-specific tools whose BE manifest entry hasn't shipped yet but
 *  whose FE page is live. Each extra page self-gates (e.g. EMR wraps in
 *  BetaFeatureGate(emr_basic)) so showing the nav item for an ungranted
 *  tenant just lands them on the gate. When BE adds the matching manifest
 *  entry, retire the row from here. */
const VERTICAL_EXTRAS: Partial<Record<VerticalId, SpliceEntry[]>> = {
  pharmacy: [
    {
      // Patient-centric clinical record. Sits next to Consultations + Prescriptions.
      item: { label: "Medical Records", href: "/pharmacy/emr", icon: Activity },
      insertAfter: "/consultations",
    },
  ],
  fashion: [
    {
      // Shoe product catalog with size/color tracking. Sits next to Inventory.
      item: { label: "Shoes", href: "/shoes", icon: Package },
      insertAfter: "/inventory",
    },
    {
      // Fashion-specific order management. Sits next to Orders.
      item: { label: "Fashion Orders", href: "/orders/fashion", icon: Scissors },
      insertAfter: "/orders",
    },
  ],
};

/** Cross-vertical extras every tenant should see — pages that aren't tied to
 *  a tool catalogue entry. `/features` (the roadmap + Beta request page) was
 *  shipped without a sidebar entry, so tenants had no way to discover the
 *  "Request Beta access" CTA — which is why ops sees an empty review queue.
 *  Sit it right before Settings so it reads as a what's-coming entry, not a
 *  primary daily-driver link. */
const PLATFORM_EXTRAS: SpliceEntry[] = [
  // Invoicing is a Growth-tier feature (BE @RequiresFeature('invoicing')).
  // We show the link for every tenant so upgrade discovery works — free /
  // starter tenants land on the /invoices upgrade nudge instead of a 404.
  // Anchor to /payments so it sits with the other money surfaces.
  {
    item: { label: "Invoices", href: "/invoices", icon: FileText },
    insertAfter: "/payments",
  },
  {
    item: { label: "What's new", href: "/features", icon: Sparkles },
    // Anchor not in manifest → falls through to "append at end", which lands
    // it right before Settings. Exactly the slot we want.
    insertAfter: "__platform_tail__",
  },
];

/**
 * The sidebar's nav (Architecture v1.0 §16). The backend serves a list of
 * UIManifests for the tenant's active tools (JWT `activeModules` →
 * GET /registry/manifests); we sort by `navItem.order` and bracket the result
 * with Home and Settings.
 *
 * Extras splice: when a page is FE-shipped but BE hasn't added its manifest
 * entry yet, insert it into the sections positioned after a known neighbour
 * so the sidebar feels organised rather than a random tack-on. Empty arrays
 * for verticals with no vertical-specific extras are the common case;
 * PLATFORM_EXTRAS applies regardless of vertical.
 *
 * The static APP_NAV is used only when the manifest endpoint returns empty /
 * the JWT pre-dates the `activeModules` claim — i.e. the cold-cache or
 * legacy-token fallback.
 */
export function useAppNav(): NavLink[] {
  const { manifests } = useManifests();
  const { data: me } = useApiQuery(meQuery);

  const sections = (manifests ?? [])
    .map((m) => m.navItem)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .sort((a, b) => a.order - b.order)
    .map((n) => ({ label: n.label, href: n.path, icon: iconFor(n.icon) }));

  if (manifests && sections.length > 0) {
    const vertical = verticalOf(me);
    const verticalExtras = (vertical && VERTICAL_EXTRAS[vertical]) ?? [];
    // Vertical extras go first, platform extras last — same forward-splice
    // pass handles both, with platform ones falling through to end-of-list.
    const extras = [...verticalExtras, ...PLATFORM_EXTRAS];

    let merged = [...sections];
    for (const extra of extras) {
      const idx = merged.findIndex((n) => n.href === extra.insertAfter);
      if (idx >= 0) {
        merged = [...merged.slice(0, idx + 1), extra.item, ...merged.slice(idx + 1)];
      } else {
        merged = [...merged, extra.item];
      }
    }

    return [HOME, ...merged, SETTINGS];
  }
  // Live source of truth was unreachable AND JWT held no activeModules — render
  // the minimal skeleton. A universal APP_NAV fallback used to live here, but it
  // silently leaks tools that don't belong (e.g. Tables in a fashion sidebar) —
  // better to under-render than to mis-render. Settings > Modules is reachable
  // so the owner can always fix it.
  return [HOME, SETTINGS];
}
