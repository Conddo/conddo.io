"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Loader2,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  AlertCircle,
  Users,
  Globe,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import {
  adminApi,
  clearAdminToken,
  getAdminToken,
  loginAdmin,
  type PlatformOverview,
  type PendingSiteRow,
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
  const [sites, setSites] = useState<PendingSiteRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ov, ps] = await Promise.all([
        adminApi.overview(),
        adminApi.pendingSites().catch(() => [] as PendingSiteRow[]),
      ]);
      setOverview(ov);
      setSites(ps);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <TopBar onRefresh={load} onSignOut={onSignOut} />
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
      <QaQueue sites={sites ?? []} />
    </div>
  );
}

function TopBar({ onRefresh, onSignOut }: { onRefresh: () => void; onSignOut: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
          <ShieldCheck size={17} />
        </span>
        <div>
          <h1 className="text-[15px] font-semibold text-white">Conddo Studio</h1>
          <p className="text-[11px] text-white/45">Platform administration</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/80 hover:bg-white/[0.06]"
          aria-label="Refresh"
        >
          <RefreshCcw size={13} /> Refresh
        </button>
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/80 hover:bg-white/[0.06]"
        >
          <LogOut size={13} /> Sign out
        </button>
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

function QaQueue({ sites }: { sites: PendingSiteRow[] }) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [local, setLocal] = useState<PendingSiteRow[]>(sites);
  useEffect(() => setLocal(sites), [sites]);

  async function approve(id: string) {
    if (approvingId) return;
    setApprovingId(id);
    try {
      await adminApi.approveSite(id);
      setLocal((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // stay quiet — a toast provider isn't mounted on the admin subdomain
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#111114]">
      <header className="border-b border-white/[0.06] px-5 py-3.5">
        <h2 className="text-[14px] font-medium text-white">Sites awaiting QA</h2>
      </header>
      {local.length === 0 ? (
        <p className="px-5 py-6 text-[13px] text-white/45">Queue is empty.</p>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {local.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-white">
                  {s.customDomain ?? s.submittedUrl ?? s.subdomain ?? s.id}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-white/45">
                  {s.siteType ?? "unspecified"} · {s.hostingProvider ?? "unknown host"} ·{" "}
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => approve(s.id)}
                disabled={approvingId === s.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/85 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-primary disabled:opacity-60"
              >
                {approvingId === s.id && <Loader2 size={12} className="animate-spin" />}
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
