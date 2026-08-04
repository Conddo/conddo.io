"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { StudioNav } from "@/components/admin/StudioNav";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type AdminPaymentRow,
  type AdminPaymentsPage,
  type PlatformPaymentSummary,
} from "@/lib/api/admin";
import { useRouter } from "next/navigation";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Succeeded" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    kobo / 100,
  );

/** /admin/payments — SUPER_ADMIN platform-wide payments dashboard.
 *  Powers support triage + high-level activity monitoring. */
export default function AdminPaymentsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<PlatformPaymentSummary | null>(null);
  const [page, setPage] = useState<AdminPaymentsPage | null>(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setError(null);
    try {
      const [s, p] = await Promise.all([
        adminApi.paymentsSummary(),
        adminApi.payments({ status: filter, size: 30 }),
      ]);
      setSummary(s);
      setPage(p);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        clearAdminToken();
        router.replace("/admin");
        return;
      }
      setError(err instanceof AdminApiError ? err.message : "Couldn't load payments.");
    }
  }

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <StudioNav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">Payments</h1>
            <p className="mt-1 text-[13.5px] text-white/60">
              Platform-wide payment activity across every tenant. For support triage and high-level monitoring.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 hover:bg-white/[0.06] disabled:opacity-50"
          >
            <RefreshCcw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
            <AlertCircle size={16} className="mt-0.5" /> {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Gross succeeded"
            value={summary ? naira(summary.grossSucceededKobo) : "—"}
            tone="primary"
          />
          <StatCard
            label="Succeeded"
            value={summary ? String(summary.succeededCount) : "—"}
            tone="success"
            Icon={CheckCircle2}
          />
          <StatCard
            label="Pending"
            value={summary ? String(summary.pendingCount) : "—"}
            tone="warning"
            Icon={Clock}
          />
          <StatCard
            label="Failed"
            value={summary ? String(summary.failedCount) : "—"}
            tone="danger"
            Icon={XCircle}
          />
        </div>

        {/* Status tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={
                "shrink-0 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition " +
                (filter === t.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white/85")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {!page && !error && (
          <div className="flex items-center gap-2 py-10 text-[13px] text-white/50">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        )}

        {page && page.content.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-12 text-center">
            <p className="text-[14px] font-medium text-white">
              {filter === "all" ? "No payments yet across the platform" : `No ${filter} payments right now`}
            </p>
          </div>
        )}

        {page && page.content.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/60">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Origin</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {page.content.map((r) => (
                    <Row key={r.id} row={r} />
                  ))}
                </tbody>
              </table>
            </div>
            {page.totalPages > 1 && (
              <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[12px] text-white/50">
                Showing {page.content.length} of {page.totalElements}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ row }: { row: AdminPaymentRow }) {
  return (
    <tr className="transition-colors hover:bg-white/[0.03]">
      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12.5px] text-white/60">
        {fmtDate(row.initiatedAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-white/50">
        {row.tenantId.slice(0, 8)}…
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-[13.5px] text-white">
        {row.customerName ?? <span className="text-white/40">—</span>}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-[13.5px] text-white/70">
        <span className="inline-flex items-center rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white/60">
          {row.origin}
        </span>
        {row.originReference && (
          <span className="ml-2 text-white/50">{row.originReference}</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-[13.5px] text-white">
        {naira(row.amountKobo)}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <StatusPill status={row.status} />
        <Link
          href={`/admin/payments/${row.id}`}
          className="ml-2 text-[11.5px] text-primary-light hover:underline"
        >
          Open
        </Link>
      </td>
    </tr>
  );
}

function StatCard({
  label,
  value,
  tone,
  Icon,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "danger";
  Icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const cls =
    tone === "primary"
      ? "text-primary-light"
      : tone === "success"
        ? "text-emerald-300"
        : tone === "warning"
          ? "text-amber-300"
          : "text-rose-300";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">{label}</p>
        {Icon && <Icon size={14} className={cls} />}
      </div>
      <p className={`font-mono text-[22px] font-medium leading-none ${cls}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "succeeded"
      ? "bg-emerald-500/15 text-emerald-200"
      : status === "pending"
        ? "bg-amber-500/15 text-amber-200"
        : status === "failed" || status === "expired"
          ? "bg-rose-500/15 text-rose-200"
          : "bg-white/10 text-white/70";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${cls}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
