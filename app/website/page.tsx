"use client";

import { useState } from "react";
import { Globe, MessageSquarePlus, Eye, MailQuestion, LayoutTemplate, Loader2, AtSign, Clock, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { ManagedSitePanel } from "@/components/app/ManagedSitePanel";
import { RequestChangesModal } from "@/components/app/RequestChangesModal";
import { SiteIntegrationPanel } from "@/components/app/SiteIntegrationPanel";
import { api, ApiError } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { websiteApi } from "@/lib/api/website";
import type { Result } from "@/lib/api/types";
import { BRAND_NAME, tenantWorkspaceUrl } from "@/lib/brand";

// FE-side normalized status — keep this stable; backend casing/values get
// mapped to these.
type WebsiteStatus = "live" | "in_progress" | "draft";

// Wire shapes — match WebsiteService.java records.
type WireSite = {
  subdomain: string;
  customDomain: string | null;
  status: string;              // "NOT_STARTED" | "IN_PROGRESS" | "LIVE" (backend casing)
  publishedAt: string | null;
};
type WireStatus = { state: string; domain: string; visitsToday: number; enquiries: number };
type WireSection = { type: string; label: string; configured: boolean };

type WebsiteSection = { id: string; name: string; configured: boolean };
type Website = {
  subdomain: string;
  customDomain: string | null;
  status: WebsiteStatus;
  publishedAt: string | null;
  visitsToday: number;
  enquiries: number;
  sections: WebsiteSection[];
};

const statusChip: Record<WebsiteStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  live: { tone: "success", label: "● Live" },
  in_progress: { tone: "warning", label: "In progress" },
  draft: { tone: "neutral", label: "Draft" },
};

function normalizeStatus(s: string | null | undefined): WebsiteStatus {
  const v = (s ?? "").toUpperCase();
  if (v === "LIVE") return "live";
  if (v === "IN_PROGRESS") return "in_progress";
  return "draft"; // covers NOT_STARTED + anything unexpected
}

// Combine /website + /website/status + /website/sections into one screen-shaped
// payload. Tolerant: if /status or /sections fail (e.g. a 500 during early
// build-out), we still render the page with sensible defaults instead of
// crashing the whole tab.
async function fetchWebsite(): Promise<Result<Website>> {
  const siteRes = await api.get<WireSite>("/website");
  const [statusRes, sectionsRes] = await Promise.all([
    api.get<WireStatus>("/website/status").catch(() => null),
    api.get<WireSection[]>("/website/sections").catch(() => null),
  ]);
  const sections: WebsiteSection[] = (sectionsRes?.data ?? []).map((s) => ({
    id: s.type,
    name: s.label,
    configured: s.configured,
  }));
  return {
    data: {
      subdomain: siteRes.data.subdomain,
      customDomain: siteRes.data.customDomain,
      status: normalizeStatus(siteRes.data.status),
      publishedAt: siteRes.data.publishedAt,
      visitsToday: statusRes?.data.visitsToday ?? 0,
      enquiries: statusRes?.data.enquiries ?? 0,
      sections,
    },
    meta: siteRes.meta,
  };
}

function WebsiteContent({ site, onChanged }: { site: Website; onChanged: () => void }) {
  const toast = useToast();
  const [requestOpen, setRequestOpen] = useState(false);
  const [domainInput, setDomainInput] = useState(site.customDomain ?? "");
  const [connectingDomain, setConnectingDomain] = useState(false);
  const changeRequestsQ = useApiQuery(websiteApi.changeRequests);
  const analyticsQ = useApiQuery(() => websiteApi.analytics("30d"));
  const domain = site.customDomain ?? tenantWorkspaceUrl(site.subdomain);
  const chip = statusChip[site.status] ?? statusChip.draft;

  async function connectDomain(e: React.FormEvent) {
    e.preventDefault();
    const value = domainInput.trim();
    if (!value) {
      toast.error("Enter a domain", "Use the bare hostname only — no https:// or trailing slash.");
      return;
    }
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) {
      toast.error("That doesn't look like a domain", "Expected format: yourbusiness.com");
      return;
    }
    setConnectingDomain(true);
    try {
      await websiteApi.connectDomain(value);
      toast.success("Domain connected", `${value} is being set up — DNS may take a few minutes.`);
      onChanged();
    } catch (err) {
      toast.error(
        "Couldn't connect domain",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setConnectingDomain(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status hero */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-cinema-elev p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Chip tone={chip.tone}>{chip.label}</Chip>
            {site.publishedAt && <span className="text-[12px] text-white/45">Published {site.publishedAt}</span>}
          </div>
          <p className="font-mono text-[18px] text-white">{domain}</p>
        </div>
        <div className="flex gap-2">
          <Button href={`https://${domain}`} variant="secondary" size="md">
            <Eye size={16} /> View site
          </Button>
          <Button variant="primary" size="md" onClick={() => setRequestOpen(true)}>
            <MessageSquarePlus size={16} /> Request changes
          </Button>
        </div>
      </div>
      <RequestChangesModal open={requestOpen} onClose={() => setRequestOpen(false)} />

      {/* Traffic — today (from /website/status) + 30-day rollup (from /website/analytics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-white/65">Visits today</p>
            <Eye size={18} className="text-white/45" />
          </div>
          <p className="font-mono text-[24px] font-medium leading-none text-white">{site.visitsToday}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-white/65">New enquiries</p>
            <MailQuestion size={18} className="text-white/45" />
          </div>
          <p className="font-mono text-[24px] font-medium leading-none text-white">{site.enquiries}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-white/65">Visits (30d)</p>
            <BarChart3 size={18} className="text-white/45" />
          </div>
          <p className="font-mono text-[24px] font-medium leading-none text-white">
            {analyticsQ.data?.visits ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] text-white/65">Enquiries (30d)</p>
            <MailQuestion size={18} className="text-white/45" />
          </div>
          <p className="font-mono text-[24px] font-medium leading-none text-white">
            {analyticsQ.data?.enquiries ?? "—"}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-[15px] font-medium text-white">Pages &amp; sections</h2>
        </div>
        {site.sections.length > 0 ? (
          <ul className="divide-y divide-white/[0.06]">
            {site.sections.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-6 py-3.5">
                <span className="flex items-center gap-3 text-[14px] text-white">
                  <LayoutTemplate size={16} className="text-white/45" />
                  {s.name}
                </span>
                <Chip tone={s.configured ? "success" : "neutral"}>{s.configured ? "Configured" : "Default"}</Chip>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-[14px] text-white/65">No sections configured yet.</p>
        )}
      </div>

      {/* Recent change requests — from /website/change-requests */}
      {changeRequestsQ.data && changeRequestsQ.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 className="text-[15px] font-medium text-white">Recent change requests</h2>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {changeRequestsQ.data.slice(0, 8).map((cr) => (
              <li key={cr.id} className="flex items-start gap-3 px-6 py-3.5">
                <Clock size={14} className="mt-1 shrink-0 text-white/45" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {cr.area && <Chip tone="neutral">{cr.area}</Chip>}
                    <Chip
                      tone={
                        cr.status?.toLowerCase().includes("done") || cr.status?.toLowerCase().includes("closed")
                          ? "success"
                          : cr.status?.toLowerCase().includes("progress")
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {cr.status}
                    </Chip>
                  </div>
                  <p className="mt-1 text-[13px] text-white/65">{cr.details}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-white/45">
                  {new Date(cr.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Developer integration — API key + QA status + quick start. Renders
          a "your site isn't registered yet" hint when the BE has no
          tenant_sites row for this tenant. */}
      <SiteIntegrationPanel slug={site.subdomain} />

      {/* Custom domain — wired to POST /website/domain. BE 403s if the
          tenant's plan doesn't include custom-domain support (FE catches
          and surfaces the BE message). */}
      <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[15px] font-medium text-white">Custom domain</h2>
          {site.customDomain ? (
            <Chip tone="success">{site.customDomain}</Chip>
          ) : (
            <span className="rounded bg-primary/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-primary">SCALER</span>
          )}
        </div>
        <p className="mb-4 text-[14px] text-white/65">
          Point your own domain (e.g. yourbusiness.com) at your {BRAND_NAME} website. Growth tenants get a free .com.ng via 9stacks; Scaler unlocks any custom domain.
        </p>
        <form onSubmit={connectDomain} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <AtSign size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="yourbusiness.com"
              disabled={connectingDomain}
              className="h-10 w-full rounded-md border border-white/10 bg-cinema-base pl-9 pr-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
            />
          </div>
          <Button variant="primary" size="md" type="submit" disabled={connectingDomain || !domainInput.trim()}>
            {connectingDomain ? (
              <><Loader2 size={14} className="animate-spin" /> Connecting…</>
            ) : (
              site.customDomain ? "Update domain" : "Connect domain"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function WebsitePage() {
  const { data, loading, error, refetch } = useApiQuery<Website>(fetchWebsite);

  return (
    <AppShell title="Website" subtitle="Your online storefront">
      {/* Managed website (Path A) — sits above the legacy Studio-hosted UI.
          Auto-hides for tenants that don't have a managed row (returns null),
          so pre-V60 accounts see the old page unchanged. */}
      <div className="mb-6">
        <ManagedSitePanel />
      </div>

      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={!data}
        onRetry={refetch}
        loadingLabel="Loading your website…"
        empty={
          <EmptyState
            icon={Globe}
            title="Your website isn't live yet"
            description="Our team is building your site from your business brief. Its status, traffic, and pages will appear here once it's ready."
            action={<Button variant="primary" size="md">Request a status update</Button>}
          />
        }
      >
        {data && <WebsiteContent site={data} onChanged={refetch} />}
      </QueryBoundary>
    </AppShell>
  );
}
