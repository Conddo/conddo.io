"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Search,
  Plus,
  ExternalLink,
} from "lucide-react";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type TenantRow,
} from "@/lib/api/admin";
import { StudioNav } from "@/components/admin/StudioNav";

/** studio.getconddo.com/tenants — list every tenant with a search box + a
 *  "Create tenant" CTA. Rows link to /admin/tenants/[id] for the detail
 *  view + CRUD actions. Filter uses simple substring matching client-side
 *  because the total tenant count is small; swap to a debounced server
 *  query when we cross ~500 rows. */
export default function AdminTenantsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/dashboard");
      return;
    }
    setAuthed(true);
  }, [router]);

  if (authed !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={22} className="animate-spin text-white/50" />
      </div>
    );
  }
  return <TenantsPanel onSignOut={() => { clearAdminToken(); router.replace("/admin/dashboard"); }} />;
}

function TenantsPanel({ onSignOut }: { onSignOut: () => void }) {
  const [tenants, setTenants] = useState<TenantRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const rows = await adminApi.tenants();
      setTenants(rows);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load tenants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!tenants) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return tenants;
    return tenants.filter((t) => {
      return (
        t.name.toLowerCase().includes(needle) ||
        t.slug.toLowerCase().includes(needle) ||
        (t.ownerEmail?.toLowerCase().includes(needle) ?? false) ||
        (t.ownerFullName?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [tenants, q]);

  return (
    <div>
      <StudioNav onRefresh={load} onSignOut={onSignOut} />
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="search"
                placeholder="Search by business, slug, or owner email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-[13.5px] text-white placeholder:text-white/35 outline-none focus:border-primary/40"
              />
            </div>
          </div>
          <Link
            href="/admin/tenants/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/90 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-primary"
          >
            <Plus size={13} />
            Create tenant
          </Link>
        </div>

        {loading && !tenants && (
          <div className="mt-16 flex items-center justify-center text-white/50">
            <Loader2 size={18} className="mr-2 animate-spin" /> Loading tenants…
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-4 text-rose-200">
            <AlertCircle size={16} className="mt-0.5" />
            <div>
              <p className="font-medium">Couldn&apos;t load tenants</p>
              <p className="mt-0.5 text-[13px] text-rose-200/80">{error}</p>
            </div>
          </div>
        )}

        {tenants && (
          <section className="mt-4 rounded-2xl border border-white/[0.06] bg-[#111114] overflow-hidden">
            <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <h2 className="text-[14px] font-medium text-white">
                {q ? `Matching (${filtered.length})` : `All tenants (${tenants.length})`}
              </h2>
            </header>
            {filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-white/45">
                {q ? "No tenants match this search." : "No tenants yet."}
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {filtered.map((t) => (
                  <TenantRowLi key={t.id} row={t} />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function TenantRowLi({ row }: { row: TenantRow }) {
  const created = new Date(row.createdAt).toLocaleDateString();
  return (
    <li>
      <Link
        href={`/admin/tenants/${row.id}`}
        className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate text-[14px] font-medium text-white">{row.name}</p>
            <span className="font-mono text-[11px] text-white/45">@{row.slug}</span>
            {row.status !== "ACTIVE" && (
              <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-rose-200">
                {row.status.toLowerCase()}
              </span>
            )}
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
            <span>{created}</span>
          </p>
        </div>
        <ExternalLink size={13} className="text-white/40" />
      </Link>
    </li>
  );
}

function prettyVertical(id: string): string {
  return id
    .split(/[-_]+/)
    .map((s) => (s === "and" ? "&" : s.charAt(0).toUpperCase() + s.slice(1)))
    .join(" ");
}
