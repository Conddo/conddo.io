import type { Metadata, Viewport } from "next";

/**
 * Layout for the admin dashboard served at {@code studio.getconddo.com}
 * (middleware rewrites the subdomain to /admin/*). Deliberately dark +
 * chromeless — no marketing nav, no tenant sidebar, no PWA install prompts.
 * The parent RootLayout provides <html>, fonts, and toast provider; this
 * layout just sets metadata + a base surface.
 */
export const metadata: Metadata = {
  title: "Conddo Studio",
  description: "Platform admin — QA queue and tenant overview.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0c] text-white">{children}</div>;
}
