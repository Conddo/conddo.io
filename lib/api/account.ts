// Account/auth API — signup, login, logout, and the current session (/me).
// Auth endpoints live at the root (/auth/*); signup is /api/v1/tenants.

import { api, authApi } from "./client";
import { setAccessToken, clearAccessToken } from "./auth";
import { resetManifests } from "@/hooks/useManifests";

export type SignupInput = {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  verticalId?: string;
};
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  verticalId: string | null;
  planId: string | null;
  status: string;
  createdAt: string;
};

export type LoginInput = { email: string; password: string; tenantSlug: string };
export type LoginResult = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  role: string;
};

/** Granular staff sub-role for STAFF-role users — determines which work
 *  surface (`/work/*`) they land on after login and which modules they
 *  see in the sidebar. Null when the user is TENANT_ADMIN (the owner sees
 *  everything regardless) or when no role has been assigned yet. */
export type StaffSubRole =
  | "MANAGER"
  | "CASHIER"
  | "STOCK_MANAGER"
  | "PHARMACIST"
  | "BOOKKEEPER";

export type Me = {
  user: {
    id: string;
    fullName: string | null;
    email: string;
    /** True once the user has clicked the post-onboarding verification link.
     *  Gates publish / payments / automations on the FE. */
    emailVerified: boolean;
    /** "TENANT_ADMIN" | "STAFF" | "SUPER_ADMIN". STAFF users also carry a
     *  `staffRole` below — see StaffSubRole. */
    role: string;
    /** Present only on STAFF users; null on TENANT_ADMIN / SUPER_ADMIN. */
    staffRole?: StaffSubRole | null;
    initials: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    customDomain: string | null;
    verticalId: string;
    planId: string | null;
    status: string;
  };
};

/** Create a tenant + its first admin. Does NOT log in (no token returned). */
export async function signup(input: SignupInput): Promise<Tenant> {
  const { data } = await api.post<Tenant>("/tenants", input);
  return data;
}

/** Authenticate; stores the access token for subsequent requests. */
export async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await authApi.post<LoginResult>("/auth/login", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await authApi.post("/auth/logout");
  } catch {
    /* best-effort */
  }
  clearAccessToken();
  resetManifests();
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>("/me");
  return data;
}

// ----- Onboarding v2 signup wizard (/auth/register/*) ------------------------
// start → classify → complete (creates tenant + logs in). No OTP: email
// verification is deferred to a post-onboarding link the FE surfaces as a
// dashboard banner. The old /verify + /resend endpoints still exist on the
// BE for backward compat but are unused by the new flow.

export type RegisterStartResult = { registrationId: string; resendCooldownSeconds: number };

export async function registerStart(input: {
  fullName: string; phone: string; email: string; password: string;
}): Promise<RegisterStartResult> {
  const { data } = await authApi.post<RegisterStartResult>("/auth/register/start", input);
  return data;
}

/** AI-classify a business description mid-signup. Returns:
 *    - vertical / verticalConfidence: the BE-chosen vertical from a closed list
 *      (never invented). Unknown / low-confidence signups get "general" — the
 *      catch-all bundle. This is the ONLY authoritative source of the tenant's
 *      vertical; the FE must never guess it from module id prefixes.
 *    - scores: every module ranked
 *    - recommended: the subset with confidence ≥ 0.6, preselected on review
 */
export type ClassifiedModule = { id: string; confidence: number; reason: string };
export type ClassifyResult = {
  vertical: string;
  verticalConfidence: number;
  scores: ClassifiedModule[];
  recommended: ClassifiedModule[];
};

export async function classifyBusiness(input: {
  registrationId: string;
  description: string;
  verticalHint?: string | null;
}): Promise<ClassifyResult> {
  const { data } = await authApi.post<ClassifyResult>("/auth/register/classify", input);
  return data;
}

/** Final step — creates the tenant + admin and logs in (stores the access token).
 *  With CONDDO_REQUIRE_OTP_VERIFY=false on the BE, no prior /verify call is needed. */
export async function registerComplete(input: {
  registrationId: string; businessName: string; businessType?: string | null; planId?: string | null;
}): Promise<LoginResult> {
  const { data } = await authApi.post<LoginResult>("/auth/register/complete", input);
  setAccessToken(data.accessToken);
  return data;
}

/** Start a password reset. Always succeeds server-side (doesn't reveal if the email exists). */
export async function forgotPassword(input: { tenantSlug: string; email: string }): Promise<void> {
  await authApi.post("/auth/forgot-password", input);
}

/** Redeem an email verification token — the /verify-email page auto-calls this on mount. */
export async function verifyEmail(token: string): Promise<void> {
  await authApi.post("/auth/verify-email", { token });
}

/** Reissue a fresh verification link for the signed-in user. Called from the dashboard banner. */
export async function resendVerificationEmail(): Promise<void> {
  await api.post("/me/verify-email/resend");
}

/** Complete a password reset with the emailed token. */
export async function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  await authApi.post("/auth/reset-password", input);
}

// ----- Staff invitation acceptance ------------------------------------------

/** Preview shape returned by /auth/invite/preview?token=. Lets the FE show
 *  "you've been invited to <tenant> as a <role>" before asking for password.
 *  Resolves to null when the token is invalid / expired / already used so
 *  the FE shows a single graceful "this invite is no longer active" state. */
export type InvitePreview = {
  tenantName: string;
  /** Role label only — keeps copy human ("Cashier", not "CASHIER"). */
  roleLabel: string;
  /** Sub-role enum value for routing the staffer post-accept. */
  staffRole: StaffSubRole;
  /** Email the invite was sent to — surfaced read-only so the staffer
   *  knows the account they're claiming. */
  email: string;
  invitedBy?: string | null;
};

export async function previewInvite(token: string): Promise<InvitePreview | null> {
  try {
    const { data } = await authApi.get<InvitePreview>(
      `/auth/invite/preview?token=${encodeURIComponent(token)}`,
    );
    return data;
  } catch {
    return null;
  }
}

/** Final step of the invite flow — sets the staffer's password and logs
 *  them in. Returns the same LoginResult shape as a normal sign-in so the
 *  caller can route via the access token immediately. */
export async function acceptInvite(input: {
  token: string;
  password: string;
  fullName?: string;
}): Promise<LoginResult> {
  const { data } = await authApi.post<LoginResult>("/auth/accept-invite", input);
  setAccessToken(data.accessToken);
  return data;
}

/** `/me` as a Result, for use with `useApiQuery`. */
export const meQuery = () => api.get<Me>("/me");

/** Turn a business name into a URL-safe subdomain slug. */
export const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
