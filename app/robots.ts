import type { MetadataRoute } from "next";
import { APP_DOMAIN } from "@/lib/brand";

/**
 * Main-app robots.txt at {@code app.getconddo.com/robots.txt}.
 *
 * <p>Allows the marketing surface (landing, pricing, product, businesses,
 * about) and every public customer-facing route (booking, invoices via
 * unguessable token). Disallows everything under the tenant dashboard
 * so Google doesn't get its hands on {@code /orders} / {@code /settings}
 * / etc. — those are auth-gated anyway but the robots hint is the belt
 * and braces.
 *
 * <p>Tenant public sites at {@code <slug>.getconddo.com} get their own
 * per-host robots.txt via {@code app/sites/[host]/robots.txt/route.ts}.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/product",
          "/businesses",
          "/about",
          "/privacy",
          "/terms",
          "/book/",
        ],
        disallow: [
          "/dashboard",
          "/settings",
          "/onboarding",
          "/login",
          "/reset-password",
          "/verify-email",
          "/orders",
          "/customers",
          "/bookings",
          "/inventory",
          "/payments",
          "/marketing",
          "/analytics",
          "/staff",
          "/website",
          "/invoices",
          "/features",
          "/admin",
          "/work",
          "/pos",
          "/pharmacy",
          "/fabric",
          "/tables",
          "/sessions",
          "/shoes",
          // Public but customer-specific — the token IS the credential,
          // so we don't want search engines fanning it out. Individual
          // token pages also carry noindex via generateMetadata.
          "/i/",
          // Customer-facing pay pages carry receiving-account info
          // scoped to a single transaction — never appropriate to index.
          "/pay/",
        ],
      },
    ],
    sitemap: `https://app.${APP_DOMAIN}/sitemap.xml`,
  };
}
