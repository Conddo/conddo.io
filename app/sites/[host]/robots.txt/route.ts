/**
 * Per-tenant robots.txt served at {@code <slug>.getconddo.com/robots.txt}.
 * Middleware rewrites the tenant subdomain to {@code /sites/[host]/...},
 * so a request for {@code robots.txt} lands here.
 *
 * <p>Simple: allow everything, point to the tenant's dynamic sitemap.
 * Every tenant page (Home / About / Services / Portfolio / Contact) is
 * publicly indexable — that's the whole point.
 */
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ host: string }> },
): Promise<Response> {
  const { host } = await params;
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: https://${host}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
