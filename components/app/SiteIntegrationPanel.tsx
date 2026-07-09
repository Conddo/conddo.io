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

/** One code sample — one titled block. Multiple blocks compose the vertical-
 *  specific quick-start. `readEndpoint` is `POST` false; write is true. */
type Snippet = { title: string; code: string };

/** Snippet catalog — the ONE place to add or refine per-vertical examples.
 *  Everything is a runnable fetch() targeting the tenant's own site key. */
function snippetsFor(verticalId: string | undefined, slug: string, apiKey: string): Snippet[] {
  const base = PUBLIC_API_BASE;
  const key = `"X-Conddo-Site-Key": "${apiKey}"`;

  // Enquiry snippet is universal — every vertical benefits from a contact form.
  const enquiry: Snippet = {
    title: "Contact form (contact us)",
    code: `// Submit an enquiry from your site's contact form.
// Creates a Lead in your Conddo deals pipeline.
await fetch(
  "${base}/api/v1/public/${slug}/enquiries",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ${key},
    },
    body: JSON.stringify({
      name: "Amaka Okafor",
      phone: "+2348012345678",
      email: "amaka@example.com",
      message: "I'm interested in the Lekki 3-bedroom listing.",
      // propertyId: "..." (optional — set when submitted from a listing page)
    }),
  }
);`,
  };

  if (verticalId === "real-estate") {
    const listProperties: Snippet = {
      title: "Fetch available properties",
      code: `// Show all available listings on your site.
const res = await fetch(
  "${base}/api/v1/public/${slug}/real-estate/properties",
  { headers: { ${key} } }
);
const { properties, count } = await res.json();

// Filter by listing type (sale/rent/short-let) + property type (duplex/apartment/…):
const filtered = await fetch(
  "${base}/api/v1/public/${slug}/real-estate/properties?listingType=sale&propertyType=duplex",
  { headers: { ${key} } }
);`,
    };
    const propertyDetail: Snippet = {
      title: "Fetch one property (detail page)",
      code: `// Render an individual listing — pass its slug.
const res = await fetch(
  "${base}/api/v1/public/${slug}/real-estate/properties/lekki-3bed-serviced",
  { headers: { ${key} } }
);
const { property } = await res.json();

// property.images is an array (first = hero)
// property.documents.cOfO / deedOfAssignment / governorConsent are flags
// property.description, price, bedrooms, features, etc.`,
    };
    return [listProperties, propertyDetail, enquiry];
  }

  if (verticalId === "pharmacy") {
    const storeInfo: Snippet = {
      title: "Fetch store info (business hours, etc.)",
      code: `const res = await fetch(
  "${base}/api/v1/public/${slug}/store-info",
  { headers: { ${key} } }
);
const store = await res.json();`,
    };
    const listProducts: Snippet = {
      title: "List available medicines",
      code: `const res = await fetch(
  "${base}/api/v1/public/${slug}/pharmacy/products",
  { headers: { ${key} } }
);
const { products, pagination } = await res.json();`,
    };
    const submitOrder: Snippet = {
      title: "Submit an order (customer-authenticated)",
      code: `// After the customer signs in via /auth/register or /auth/login,
// use the returned JWT alongside the site key:
await fetch(
  "${base}/api/v1/public/${slug}/pharmacy/orders",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <customer-jwt>",
      ${key},
    },
    body: JSON.stringify({
      items: [{ product_id: "abc123", quantity: 2 }],
      delivery_address: "14 Balogun Street, Lagos",
    }),
  }
);`,
    };
    return [storeInfo, listProducts, submitOrder, enquiry];
  }

  // Generic (fashion, retail, services, general, …) — store info + enquiry.
  return [
    {
      title: "Fetch business info",
      code: `const res = await fetch(
  "${base}/api/v1/public/${slug}/store-info",
  { headers: { ${key} } }
);
const store = await res.json();`,
    },
    enquiry,
  ];
}

function QuickStart({
  slug,
  apiKey,
  verticalId,
}: {
  slug: string;
  apiKey: string;
  verticalId: string | undefined;
}) {
  const snippets = snippetsFor(verticalId, slug, apiKey);
  return (
    <div className="space-y-4">
      {snippets.map((s) => (
        <div key={s.title}>
          <p className="mb-1.5 text-[12.5px] font-medium text-white/70">{s.title}</p>
          <pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-cinema-base p-4 font-mono text-[11px] leading-relaxed text-white/65">
            <code>{s.code}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}

/** Self-service activation panel — tenant confirms their site is live at
 *  {@code submittedUrl} and flips the site key active in one call. */
function LiveUrlPanel({
  site,
  onChanged,
}: {
  site: TenantSite;
  onChanged: (next: TenantSite) => void;
}) {
  const toast = useToast();
  const [url, setUrl] = useState(site.submittedUrl ?? "");
  const [saving, setSaving] = useState(false);

  const active = site.isActive === true;

  async function activate() {
    setSaving(true);
    try {
      const { data } = await websiteApi.activateSite(url.trim());
      onChanged(data);
      toast.success("Site live", "Your site key now accepts traffic from your published URL.");
    } catch (err) {
      toast.error("Couldn't activate", err instanceof ApiError ? err.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    setSaving(true);
    try {
      const { data } = await websiteApi.deactivateSite();
      onChanged(data);
      toast.success("Site offline", "Your site key won't accept traffic until you activate again.");
    } catch (err) {
      toast.error("Couldn't deactivate", err instanceof ApiError ? err.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-white/65" />
          <span className="text-[13px] font-medium text-white/85">Your live site</span>
        </div>
        <Chip tone={active ? "success" : "neutral"}>{active ? "Live" : "Not live"}</Chip>
      </div>
      <Field label="Site URL" htmlFor="site-live-url">
        <TextInput
          id="site-live-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://amakastore.com"
          disabled={saving}
        />
      </Field>
      <div className="mt-3 flex flex-wrap gap-2">
        {!active && (
          <Button
            variant="primary"
            size="md"
            onClick={activate}
            disabled={saving || !url.trim()}
          >
            <Power size={15} /> {saving ? "Activating…" : "Activate my site"}
          </Button>
        )}
        {active && (
          <>
            <Button variant="secondary" size="md" onClick={activate} disabled={saving}>
              Update URL
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={deactivate}
              disabled={saving}
            >
              <PowerOff size={15} /> Take offline
            </Button>
          </>
        )}
      </div>
      <p className="mt-2 text-[12px] text-white/45">
        Confirming your URL activates your site key. Your API key is bcrypt-hashed on our
        side — a wrong URL doesn't leak anything.
      </p>
    </div>
  );
}

/** Developer integration surface for the tenant's public website — API key
 *  + QA status + a copy-paste quick-start snippet. Only renders if the
 *  backend has a `tenant_sites` row for this tenant; otherwise we show a
 *  setup-in-progress hint instead. */
export function SiteIntegrationPanel({ slug }: { slug: string }) {
  const [siteOverride, setSiteOverride] = useState<TenantSite | null>(null);
  const { data, loading, error, refetch } = useApiQuery(websiteApi.site);
  const meQ = useApiQuery<Me>(meQuery);
  const verticalId = meQ.data?.tenant.verticalId;
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

      <LiveUrlPanel site={site} onChanged={(next) => { setSiteOverride(next); refetch(); }} />

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
        <QuickStart slug={slug} apiKey={site.apiKeyMasked} verticalId={verticalId} />
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
