// Admin surface API client — used by /admin/* pages that render at
// studio.getconddo.com. Distinct from the tenant-facing api client because
// the admin session is a SUPER_ADMIN staff session (staff_users table,
// /auth/staff/login), not a tenant user session.
//
// Token cache: kept in localStorage under ADMIN_TOKEN_KEY so the admin
// session doesn't collide with a tenant-side sign-in on the same domain.

import type { ApiResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const ADMIN_TOKEN_KEY = "CONDDO_ADMIN_TOKEN";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export class AdminApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 0) {
    super(message);
    this.name = "AdminApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE) {
    throw new AdminApiError(
      "api_not_configured",
      "NEXT_PUBLIC_API_URL is unset — the admin dashboard needs the main API URL.",
    );
  }
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAdminToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers, cache: "no-store" });
  const status = res.status;
  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    /* non-JSON body — surface generic */
  }
  if (!res.ok || (payload && payload.success === false)) {
    const err = payload?.error;
    const code = (typeof err === "object" && err?.code) || `http_${status}`;
    const message =
      (typeof err === "object" && err?.message) || `Request to ${path} failed (${status})`;
    if (status === 401) clearAdminToken();
    throw new AdminApiError(code, message, status);
  }
  return payload?.data as T;
}

/** POST /auth/staff/login — SUPER_ADMIN sign-in. No tenant slug required. */
export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; role: string; userId: string }> {
  if (!BASE) {
    throw new AdminApiError("api_not_configured", "NEXT_PUBLIC_API_URL is unset.");
  }
  const res = await fetch(`${BASE}/auth/staff/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  const payload = (await res.json()) as ApiResponse<{
    accessToken: string;
    role: string;
    userId: string;
  }>;
  if (!res.ok || payload.success === false) {
    const err = payload.error;
    throw new AdminApiError(
      (typeof err === "object" && err?.code) || `http_${res.status}`,
      (typeof err === "object" && err?.message) || "Login failed",
      res.status,
    );
  }
  setAdminToken(payload.data.accessToken);
  return payload.data;
}

// ----- Domain types -------------------------------------------------------

export type PlatformOverview = {
  totalTenants: number;
  newTenantsLast30Days: number;
  pendingQaCount: number;
  activeSitesCount: number;
  totalCreditsUsedPlatformWide: number;
  tenantsByVertical: Record<string, number>;
  tenantsByTier: Record<string, number>;
};

export type SiteFilter = "pending" | "approved" | "active" | "all";

export type AdminSiteRow = {
  id: string;
  tenantId: string;
  /** Business name — the headline label in the QA queue. */
  tenantName: string;
  tenantSlug: string | null;
  verticalId: string | null;
  planId: string | null;
  subdomain: string | null;
  customDomain: string | null;
  submittedUrl: string | null;
  siteType: string | null;
  hostingProvider: string | null;
  isActive: boolean;
  qaApproved: boolean;
  qaApprovedAt: string | null;
  createdAt: string;
};

export type TenantRow = {
  id: string;
  slug: string;
  name: string;
  verticalId: string | null;
  planId: string | null;
  status: string;
  createdAt: string;
  ownerEmail: string | null;
  ownerFullName: string | null;
  usersCount: number;
};

export type TenantDetail = {
  summary: TenantRow;
  owner: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLoginAt: string | null;
  } | null;
  usersCount: number;
  ordersCount: number;
  sites: Array<{
    id: string;
    subdomain: string | null;
    customDomain: string | null;
    qaApproved: boolean;
    active: boolean;
    createdAt: string;
  }>;
  credits: {
    tier: string;
    monthlyQuota: number;
    creditsUsed: number;
    topupCredits: number;
    reservedCredits: number;
    available: number;
  } | null;
};

export type CreateTenantInput = {
  businessName: string;
  verticalId: string;
  planId: string;
  ownerEmail: string;
  ownerFullName: string;
};

export type CreatedTenant = {
  tenantId: string;
  slug: string;
  name: string;
  verticalId: string | null;
  planId: string | null;
  inviteUrl: string;
};

export const adminApi = {
  overview: () => request<PlatformOverview>("/admin/platform/overview"),
  sites: (filter: SiteFilter = "pending") =>
    request<AdminSiteRow[]>(`/admin/sites?filter=${filter}`),
  approveSite: (id: string) =>
    request<AdminSiteRow>(`/admin/sites/${id}/approve`, { method: "POST" }),
  deactivateSite: (id: string) =>
    request<AdminSiteRow>(`/admin/sites/${id}/deactivate`, { method: "POST" }),

  // ----- tenants -----
  tenants: () => request<TenantRow[]>("/admin/tenants"),
  tenant: (id: string) => request<TenantDetail>(`/admin/tenants/${id}`),
  createTenant: (body: CreateTenantInput) =>
    request<CreatedTenant>("/admin/tenants", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  resetTenantPassword: (id: string) =>
    request<{ sent: boolean }>(`/admin/tenants/${id}/reset-password`, { method: "POST" }),
  deactivateTenant: (id: string) =>
    request<TenantRow>(`/admin/tenants/${id}/deactivate`, { method: "POST" }),
};
