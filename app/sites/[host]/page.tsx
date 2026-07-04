import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { fetchManagedSite, type ManagedSite } from "@/lib/api/managed-site";

// Managed tenant sites revalidate every 5 minutes. Publishing from the
// dashboard doesn't need to wait — we can add on-demand revalidation later
// if a tenant tweaks copy and wants to see it live immediately.
export const revalidate = 300;

type Props = {
  params: Promise<{ host: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { host } = await params;
  const site = await fetchManagedSite(host);
  if (!site) return { title: "Site not found" };
  const heroHeadline = readString(site.sections?.hero, "headline");
  return {
    title: site.businessName,
    description: heroHeadline || `Welcome to ${site.businessName}.`,
  };
}

export default async function ManagedSitePage({ params }: Props) {
  const { host } = await params;
  const site = await fetchManagedSite(host);
  if (!site) notFound();
  return <SiteRenderer site={site} />;
}

function readString(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === "object" && key in obj) {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}
