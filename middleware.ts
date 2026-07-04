import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain rewrite for managed tenant websites (Day 3 of the website moat).
 *
 * <p>Requests to {@code <slug>.getconddo.com} or a verified custom domain
 * are rewritten to {@code /sites/[host]} internally, where a server
 * component fetches {@code /api/v1/public/managed-site?host=X} from the BE
 * and renders the AI-generated site.
 *
 * <p>The apex ({@code getconddo.com} + {@code www.getconddo.com}) and every
 * environment-specific host (Vercel previews, localhost) pass through
 * unchanged — the main app (dashboard, onboarding, marketing) still owns
 * those routes.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Skip Next internals + API proxying. `/sites/*` is our own rewrite target
  // and must pass through to render even when hit directly (useful for dev
  // previews of a tenant site without the DNS setup).
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon") ||
    path.startsWith("/sites") ||
    path.startsWith("/manifest") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico") ||
    path.endsWith(".webp") ||
    path.endsWith(".txt")
  ) {
    return NextResponse.next();
  }

  const rawHost = (request.headers.get("host") ?? "").toLowerCase();
  const host = rawHost.split(":")[0];

  // Apex + www pass through — the app owns these.
  if (host === "getconddo.com" || host === "www.getconddo.com") {
    return NextResponse.next();
  }

  // Env-specific hosts pass through — dev, preview, local.
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".vercel.app") ||
    host.endsWith(".ngrok.io") ||
    host.endsWith(".ngrok-free.app")
  ) {
    return NextResponse.next();
  }

  // Anything else is a tenant site. Rewrite to the renderer route; the
  // pathname suffix is preserved so future multi-page sites (about, contact)
  // work without additional middleware logic.
  const rewritten = url.clone();
  rewritten.pathname = `/sites/${host}${path === "/" ? "" : path}`;
  return NextResponse.rewrite(rewritten);
}

// Run on every request except the ones we obviously don't care about. The
// function-level filter above is the authoritative gate.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
