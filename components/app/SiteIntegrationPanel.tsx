"use client";

import { useState } from "react";
import {
  Copy, Check, RotateCw, Code2, ExternalLink, AlertTriangle,
  Globe, Power, PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { websiteApi, type TenantSite } from "@/lib/api/website";
import { meQuery, type Me } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { DOCS_URL, PUBLIC_API_BASE } from "@/lib/brand";

// Page-local docs URL for the integration guide. Joins the env-driven
// DOCS_URL base with the path. Lives outside conddo-app; if the marketing
// site is down, the link still doesn't break the page.
const INTEGRATION_DOCS_URL = `${DOCS_URL}/website-integration`;

function ApiKeyRow({ site, onRegenerated }: { site: TenantSite; onRegenerated: (next: TenantSite) => void }) {
  const toast = useToast();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rotating, setRotating] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.apiKey);
      setCopied(true);
      toast.success("API key copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy", "Select and copy manually.");
    }
  }

  async function rotate() {
    setRotating(true);
    try {
      const { data } = await websiteApi.regenerateSiteKey();
      toast.success("API key rotated", "Old key is now invalid — update your site code.");
      onRegenerated(data);
      setConfirmOpen(false);
    } catch (err) {
      toast.error("Couldn't rotate key", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setRotating(false);
    }
  }

  return (
    <>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[12px] uppercase tracking-[0.05em] text-white/45">
            X-Conddo-Site-Key
          </span>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="text-[11px] font-medium text-white/65 hover:text-white"
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-cinema-elev px-2.5 py-1.5 font-mono text-[12px] text-white">
            {revealed ? site.apiKey : site.apiKeyMasked}
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy API key"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] bg-cinema-elev text-white/65 transition-colors hover:text-white"
          >
            {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
          </button>
        </div>
        <p className="mt-2 text-[12px] text-white/45">
          Public-safe — scoped to your tenant, exposes only read-only and form-submit endpoints.
          Embed it in your site frontend.
        </p>
      </div>
      <Button variant="secondary" size="md" onClick={() => setConfirmOpen(true)}>
        <RotateCw size={15} /> Regenerate key
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => !rotating && setConfirmOpen(false)}
        title="Regenerate API key?"
        description="The current key will stop working immediately. Any site or integration using it will break until you update the new key."
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setConfirmOpen(false)} disabled={rotating}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={rotate} disabled={rotating}>
              {rotating ? "Rotating…" : "Yes, regenerate"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-amber-500/15 px-4 py-3 text-[13px] text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            You'll need to redeploy your tenant site (or whoever maintains it) with the new key
            before customer-facing pages will work again.
          </p>
        </div>
      </Modal>
    </>
  );
}

function QuickStart({ slug, apiKey }: { slug: string; apiKey: string }) {
  // Example uses the masked key visually but is a real working snippet —
  // the developer needs to substitute their key. Two endpoints (read +
  // write) cover the common cases.
  const snippet = `// Fetch store info
const res = await fetch(
  "${PUBLIC_API_BASE}/api/v1/public/${slug}/store-info",
  { headers: { "X-Conddo-Site-Key": "${apiKey}" } }
);
const store = await res.json();

// Submit an order
await fetch(
  "${PUBLIC_API_BASE}/api/v1/public/${slug}/pharmacy/orders",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Conddo-Site-Key": "${apiKey}",
    },
    body: JSON.stringify({
      items: [{ product_id: "abc123", quantity: 2 }],
      customer: { name: "John Doe", phone: "08012345678" },
      delivery_address: "14 Balogun Street, Lagos",
    }),
  }
);`;
  return (
    <pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-cinema-base p-4 font-mono text-[11px] leading-relaxed text-white/65">
      <code>{snippet}</code>
    </pre>
  );
}

/** Developer integration surface for the tenant's public website — API key
 *  + QA status + a copy-paste quick-start snippet. Only renders if the
 *  backend has a `tenant_sites` row for this tenant; otherwise we show a
 *  setup-in-progress hint instead. */
export function SiteIntegrationPanel({ slug }: { slug: string }) {
  const [siteOverride, setSiteOverride] = useState<TenantSite | null>(null);
  const { data, loading, error, refetch } = useApiQuery(websiteApi.site);
  const site = siteOverride ?? data;

  // Soft-error / not-yet-provisioned state. Studio hasn't registered this
  // tenant's site yet → render a friendly "we're setting it up" panel.
  if (loading) return null;
  if (error || !site) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
        <div className="mb-2 flex items-center gap-2">
          <Code2 size={18} className="text-white/65" />
          <h2 className="text-[15px] font-medium text-white">Developer integration</h2>
        </div>
        <p className="text-[14px] text-white/65">
          Your site's developer toolkit (API key, endpoint docs, integration snippets) appears here once
          our Studio team registers your website.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-white/65" />
          <h2 className="text-[15px] font-medium text-white">Developer integration</h2>
        </div>
        <div className="flex items-center gap-2">
          {site.siteType && (
            <Chip tone="neutral">{site.siteType === "custom_built" ? "Custom build" : "Template"}</Chip>
          )}
          <Chip tone={site.qaApproved ? "success" : "warning"}>
            {site.qaApproved ? "QA approved" : "Under review"}
          </Chip>
        </div>
      </div>

      <ApiKeyRow site={site} onRegenerated={(next) => { setSiteOverride(next); refetch(); }} />

      {/* Quick start */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-medium uppercase tracking-[0.05em] text-white/65">
            Quick start
          </h3>
          <a
            href={INTEGRATION_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
          >
            Full docs <ExternalLink size={12} />
          </a>
        </div>
        <QuickStart slug={slug} apiKey={site.apiKeyMasked} />
      </div>

      {/* Submitted URL */}
      {site.submittedUrl && (
        <div>
          <p className="mb-1 text-[12px] uppercase tracking-[0.05em] text-white/45">Submitted for QA</p>
          <a
            href={site.submittedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-primary hover:underline"
          >
            {site.submittedUrl} <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}
