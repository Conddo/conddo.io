// Tenant brand API client. Feeds the Settings → Brand screen and the
// public site renderer (/sites/[host]). One row per tenant on the BE
// (tenants.primary_color / secondary_color / logo_url / font_pairing);
// this client is a thin GET/PATCH wrapper.

import { api } from "./client";
import type { TenantBrand } from "@/conddo-templates/types";

export type BrandPatch = Partial<{
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontPairing: TenantBrand["fontPairing"];
}>;

export const brandApi = {
  /** Read the current brand. Cached-friendly — the renderer calls this on
   *  every published-site request but the payload is tiny. */
  get: () => api.get<TenantBrand>("/brand"),

  /** Partial update. Any subset of the four fields; the BE validates hex
   *  colours and whitelists font pairings. */
  patch: (patch: BrandPatch) => api.patch<TenantBrand>("/brand", patch),
};
