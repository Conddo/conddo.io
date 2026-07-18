/**
 * Brand + domain constants — single source of truth.
 *
 * The domain migration from `conddo.io` → `getconddo.com` (Infrastructure
 * Working Doc §10) should be a one-line config flip. Every UI that
 * references a tenant subdomain, support email, docs URL, or public API
 * goes through THIS module instead of hardcoding the string.
 *
 * Public env vars (NEXT_PUBLIC_*) are baked into the client bundle at
 * build time, so swap-and-deploy is enough — no rolling code edits across
 * 30+ surfaces when the cutover actually happens.
 *
 * When the domain flips:
 *   1. set NEXT_PUBLIC_APP_DOMAIN=getconddo.com   on every deployment
 *   2. set NEXT_PUBLIC_EMAIL_DOMAIN=getconddo.com on every deployment
 *   3. set NEXT_PUBLIC_DOCS_URL=https://docs.getconddo.com (if applicable)
 *   4. set NEXT_PUBLIC_PUBLIC_API_BASE=https://api.getconddo.com
 *   5. redeploy — everything else picks it up automatically
 *
 * Defaults below preserve today's behaviour so unconfigured local dev
 * still works.
 */

/** Marketing brand name — "Conddo" without the TLD. Used in aria-labels,
 *  "Powered by …" footers, image alts. The TLD belongs in domain
 *  constants, not in the brand name itself. */
export const BRAND_NAME = "Conddo";

/** The root domain the tenant-facing app lives at. Prod: getconddo.com. */
export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_APP_DOMAIN?.trim() || "getconddo.com";

/** The email domain we send + receive from. Usually the same as
 *  APP_DOMAIN; left as a separate var so they can diverge during the
 *  migration window (email cutover and web cutover happen at different
 *  times — see Infra Doc §10 inventory). */
export const EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_EMAIL_DOMAIN?.trim() || APP_DOMAIN;

/** External docs site. Currently a placeholder; env-driven so the docs
 *  surface can move independently of the marketing/app site. */
export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL?.trim() ||
  `https://docs.${APP_DOMAIN}`;

/** Base URL of the public read-only API the tenant's website integration
 *  hits server-side. Used in the SiteIntegrationPanel snippet helper. */
export const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE?.trim() ||
  `https://api.${APP_DOMAIN}`;

/* ----------------------------------------------------------------------
 * Helpers — prefer these over building URLs/emails inline so the format
 * is centralised. If the workspace-URL shape ever changes (e.g.
 * `slug.conddo.io` → `conddo.io/s/<slug>`), it's a one-place edit.
 * -------------------------------------------------------------------- */

/** `<slug>.conddo.io` — the tenant's workspace web address. Falls back to
 *  a placeholder when the slug isn't ready yet (e.g. live preview during
 *  signup). */
export const tenantWorkspaceUrl = (slug?: string | null) =>
  `${slug && slug.trim() ? slug.trim() : "your-business"}.${APP_DOMAIN}`;

/** `https://<slug>.conddo.io` — same as tenantWorkspaceUrl but with the
 *  protocol prefix, for places that paste a clickable link. */
export const tenantWorkspaceHttpsUrl = (slug?: string | null) =>
  `https://${tenantWorkspaceUrl(slug)}`;

/** `app.getconddo.com/book/<slug>` — public booking link on the app subdomain
 *  (Vercel-served). Wildcard tenant subdomains would route through the EC2
 *  tenant-site Caddy which has no /book route, so we keep booking on `app.`.
 *  Without protocol so it fits cleanly inside a font-mono URL-display chip.
 *
 *  Prefer using the BE-returned {@code url} from {@code /bookings/link}
 *  when available — this helper is the pre-fetch fallback. */
export const tenantBookingUrl = (slug?: string | null) => {
  const s = slug && slug.trim() ? slug.trim() : "…";
  return `app.${APP_DOMAIN}/book/${s}`;
};

/** `app.getconddo.com/pay/<slug>` — public payment link, app subdomain. */
export const tenantPayUrl = (slug?: string | null) => {
  const s = slug && slug.trim() ? slug.trim() : "…";
  return `app.${APP_DOMAIN}/pay/${s}`;
};

/** Support inbox — the catch-all for "talk to a human" CTAs. */
export const supportEmail = () => `hello@${EMAIL_DOMAIN}`;
/** Sales — Scaler upgrade conversations, partnerships. */
export const salesEmail = () => `sales@${EMAIL_DOMAIN}`;
/** Careers — Footer link, job posts. */
export const careersEmail = () => `careers@${EMAIL_DOMAIN}`;

/** `mailto:hello@…?subject=…` helper. Pre-encodes the subject. */
export const mailtoSupport = (subject?: string) =>
  `mailto:${supportEmail()}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
export const mailtoSales = (subject?: string) =>
  `mailto:${salesEmail()}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
