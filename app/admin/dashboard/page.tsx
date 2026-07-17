"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  Users,
  Globe,
  ClipboardCheck,
  Sparkles,
  ExternalLink,
  PowerOff,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import { StudioNav } from "@/components/admin/StudioNav";
import {
  adminApi,
  clearAdminToken,
  getAdminToken,
  loginAdmin,
  type PlatformOverview,
  type AdminSiteRow,
  type SiteFilter,
  type AttentionRow,
  AdminApiError,
} from "@/lib/api/admin";

/** Single-page admin dashboard served at studio.getconddo.com. Gates behind
 *  a SUPER_ADMIN sign-in; on success shows the platform overview + QA queue. */
export default function AdminDashboardPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(Boolean(getAdminToken()));
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={22} className="animate-spin text-white/50" />
      </div>
    );
  }
  if (!authed) return <SignInCard onSignedIn={() => setAuthed(true)} />;
  return <PlatformDashboard onSignOut={() => { clearAdminToken(); setAuthed(false); }} />;
}

/* ------------------------------------------------------------------ */
/* Sign-in                                                             */
/* ------------------------------------------------------------------ */

function SignInCard({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await loginAdmin({ email: email.trim().toLowerCase(), password });
      onSignedIn();
    } catch (err) {
      setError(
        err instanceof AdminApiError ? err.message : "Sign in failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#111114] p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
            <ShieldCheck size={20} strokeWidth={1.85} />
          </span>
          <div>
            <h1 className="text-[16px] font-semibold text-white">Conddo Studio</h1>
            <p className="text-[12px] text-white/50">Platform admin sign-in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-white/70">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-primary/50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-white/70">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-primary/50"
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] p-3 text-[13px] text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function PlatformDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [sites, setSites] = useState<AdminSiteRow[] | null>(null);
  const [attention, setAttention] = useState<AttentionRow[] | null>(null);
  const [siteFilter, setSiteFilter] = useState<SiteFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOverview() {
    try {
      const ov = await adminApi.overview();
      setOverview(ov);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load overview");
    }
  }

  async function loadSites(filter: SiteFilter) {
    try {
      const rows = await adminApi.sites(filter);
      setSites(rows);
    } catch {
      setSites([]);
    }
  }

  async function loadAttention() {
    try {
      setAttention(await adminApi.tenantsNeedingAttention());
    } catch {
      // Silent — the panel just doesn't render. Nothing worse than a
      // "your dashboard is broken" banner when the panel itself is
      // supplementary info.
      setAttention([]);
    }
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    await Promise.all([loadOverview(), loadSites(siteFilter), loadAttention()]);
    setLoading(false);
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  // Refetch when the filter changes without re-triggering the overview call.
  useEffect(() => { loadSites(siteFilter); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [siteFilter]);

  return (
    <div>
      <StudioNav onRefresh={loadAll} onSignOut={onSignOut} />
      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading && !overview && (
          <div className="mt-16 flex items-center justify-center text-white/50">
            <Loader2 size={18} className="mr-2 animate-spin" /> Loading platform snapshot…
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-4 text-rose-200">
            <AlertCircle size={16} className="mt-0.5" />
            <div>
              <p className="font-medium">Couldn&apos;t load dashboard</p>
              <p className="mt-0.5 text-[13px] text-rose-200/80">{error}</p>
            </div>
          </div>
        )}
        {overview && (
          <>
            <MetricsRow overview={overview} />
            <BreakdownRow overview={overview} />
          </>
        )}
        {attention && attention.length > 0 && (
          <AttentionPanel rows={attention} />
        )}
        <SitesPanel
          sites={sites ?? []}
          filter={siteFilter}
          onFilterChange={setSiteFilter}
          onMutated={() => loadSites(siteFilter)}
        />
      </div>
    </div>
  );
}


function MetricsRow({ overview }: { overview: PlatformOverview }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Metric icon={Users} label="Total tenants" value={overview.totalTenants} />
      <Metric icon={Sparkles} label="New (30 days)" value={overview.newTenantsLast30Days} />
      <Metric icon={ClipboardCheck} label="Awaiting QA" value={overview.pendingQaCount} />
      <Metric icon={Globe} label="Active sites" value={overview.activeSitesCount} />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-4">
      <div className="flex items-center gap-2 text-white/60">
        <Icon size={14} />
        <span className="text-[11.5px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-[26px] font-semibold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function BreakdownRow({ overview }: { overview: PlatformOverview }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      <BreakdownCard title="Tenants by vertical" values={overview.tenantsByVertical} />
      <BreakdownCard title="Tenants by tier" values={overview.tenantsByTier} />
    </div>
  );
}

function BreakdownCard({ title, values }: { title: string; values: Record<string, number> }) {
  const rows = Object.entries(values);
  const total = rows.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-4">
      <p className="text-[12px] font-medium uppercase tracking-wide text-white/60">{title}</p>
      {rows.length === 0 && (
        <p className="mt-3 text-[13px] text-white/45">No data yet.</p>
      )}
      <ul className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-[13px] text-white/80">{k}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${(v / total) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[12px] text-white/70">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Full tenant-sites CRUD panel. Filter tabs across the top; each row
 *  headlines the business name (from the tenant record) with the
 *  subdomain / URL as a secondary chip, and exposes approve + deactivate
 *  actions gated on the row's current state. */
function SitesPanel({
  sites,
  filter,
  onFilterChange,
  onMutated,
}: {
  sites: AdminSiteRow[];
  filter: SiteFilter;
  onFilterChange: (f: SiteFilter) => void;
  onMutated: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function approve(id: string) {
    if (busyId) return;
    setBusyId(id);
    setErrorMsg(null);
    try {
      await adminApi.approveSite(id);
      onMutated();
    } catch (err) {
      setErrorMsg(err instanceof AdminApiError ? err.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deactivate(id: string) {
    if (busyId) return;
    if (!window.confirm("Take this site offline? Tenants and visitors will lose access.")) {
      return;
    }
    setBusyId(id);
    setErrorMsg(null);
    try {
      await adminApi.deactivateSite(id);
      onMutated();
    } catch (err) {
      setErrorMsg(err instanceof AdminApiError ? err.message : "Deactivate failed");
    } finally {
      setBusyId(null);
    }
  }

  const filterCopy: Record<SiteFilter, string> = {
    pending: "Pending",
    approved: "Approved",
    active: "Live",
    all: "All",
  };

  return (
    <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#111114] overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
        <h2 className="text-[14px] font-medium text-white">Tenant sites</h2>
        <div
          role="tablist"
          aria-label="Site filter"
          className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1"
        >
          {(["pending", "approved", "active", "all"] as const).map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(f)}
                className={`rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-white/60 hover:text-white/85"
                }`}
              >
                {filterCopy[f]}
              </button>
            );
          })}
        </div>
      </header>

      {errorMsg && (
        <div className="border-b border-rose-400/20 bg-rose-500/[0.06] px-5 py-2.5 text-[12.5px] text-rose-200">
          {errorMsg}
        </div>
      )}

      {sites.length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px] text-white/45">
          No sites in this bucket yet.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {sites.map((s) => (
            <SiteRow
              key={s.id}
              site={s}
              busy={busyId === s.id}
              onApprove={() => approve(s.id)}
              onDeactivate={() => deactivate(s.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function SiteRow({
  site,
  busy,
  onApprove,
  onDeactivate,
}: {
  site: AdminSiteRow;
  busy: boolean;
  onApprove: () => void;
  onDeactivate: () => void;
}) {
  const externalUrl = site.customDomain
    ? `https://${site.customDomain}`
    : site.submittedUrl
      ? site.submittedUrl
      : site.subdomain
        ? `https://${site.subdomain}.getconddo.com`
        : null;

  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="truncate text-[14px] font-medium text-white">
            {site.tenantName}
          </p>
          {site.tenantSlug && (
            <span className="font-mono text-[11px] text-white/45">
              @{site.tenantSlug}
            </span>
          )}
          <StatusChip site={site} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-white/50">
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary-light hover:text-primary"
            >
              {externalUrl.replace(/^https?:\/\//, "")}
              <ExternalLink size={11} />
            </a>
          ) : (
            <span className="italic text-white/40">no URL submitted</span>
          )}
          {site.verticalId && <span>{prettyVertical(site.verticalId)}</span>}
          {site.planId && <span className="uppercase tracking-wide">{site.planId}</span>}
          <span>{new Date(site.createdAt).toLocaleDateString()}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {!site.qaApproved && (
          <button
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/90 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-primary disabled:opacity-60"
          >
            {busy && <Loader2 size={12} className="animate-spin" />}
            Approve
          </button>
        )}
        {site.isActive && (
          <button
            onClick={onDeactivate}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] font-medium text-white/85 hover:bg-rose-500/10 hover:border-rose-400/40 hover:text-rose-200 disabled:opacity-60"
          >
            {busy && <Loader2 size={12} className="animate-spin" />}
            <PowerOff size={12} />
            Deactivate
          </button>
        )}
      </div>
    </li>
  );
}

function StatusChip({ site }: { site: AdminSiteRow }) {
  const label = site.isActive
    ? "Live"
    : site.qaApproved
      ? "Approved"
      : "Pending";
  const tone = site.isActive
    ? "bg-emerald-500/15 text-emerald-300"
    : site.qaApproved
      ? "bg-primary/15 text-primary-light"
      : "bg-amber-500/15 text-amber-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${tone}`}>
      {label}
    </span>
  );
}

/** Pretty-print a vertical id — "food-and-beverage" → "Food & Beverage". */
function prettyVertical(id: string): string {
  return id
    .split(/[-_]+/)
    .map((s) => (s === "and" ? "&" : s.charAt(0).toUpperCase() + s.slice(1)))
    .join(" ");
}

/* ------------------------------------------------------------------ */
/* Needs-attention panel                                                */
/* ------------------------------------------------------------------ */

const REASON_LABEL: Record<string, string> = {
  NO_SITE: "No site provisioned",
  NO_CREDITS: "No credit account",
  OWNER_UNVERIFIED: "Owner email not verified",
};

function AttentionPanel({ rows }: { rows: AttentionRow[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/[0.04] overflow-hidden">
      <header className="flex items-center justify-between border-b border-amber-400/20 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <TriangleAlert size={15} className="text-amber-300" />
          <h2 className="text-[14px] font-medium text-white">
            Needs attention
            <span className="ml-2 font-mono text-[11.5px] font-normal text-amber-200/85">
              {rows.length}
            </span>
          </h2>
        </div>
        <p className="text-[11.5px] text-amber-200/70">
          Tenants that ended up in a bad state during signup
        </p>
      </header>
      <ul className="divide-y divide-amber-400/10">
        {rows.map((row) => (
          <AttentionRowLi key={row.id} row={row} />
        ))}
      </ul>
    </section>
  );
}

function AttentionRowLi({ row }: { row: AttentionRow }) {
  return (
    <li>
      <Link
        href={`/admin/tenants/${row.id}`}
        className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-amber-500/[0.05]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate text-[14px] font-medium text-white">
              {row.name}
            </p>
            <span className="font-mono text-[11px] text-white/45">@{row.slug}</span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-white/50">
            {row.ownerEmail ? (
              <span>{row.ownerEmail}</span>
            ) : (
              <span className="italic text-white/40">no owner</span>
            )}
            {row.verticalId && <span>{prettyVertical(row.verticalId)}</span>}
            {row.planId && (
              <span className="uppercase tracking-wide">{row.planId}</span>
            )}
            <span>{new Date(row.createdAt).toLocaleDateString()}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.reasons.map((r) => (
              <span
                key={r}
                className="inline-flex items-center rounded-full bg-amber-500/[0.15] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-amber-200"
              >
                {REASON_LABEL[r] ?? r}
              </span>
            ))}
          </div>
        </div>
        <ArrowRight size={13} className="text-amber-200/60" />
      </Link>
    </li>
  );
}
