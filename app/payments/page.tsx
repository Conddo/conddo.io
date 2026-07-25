"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  RefreshCcw,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PaymentsStatusBanner } from "@/components/app/PaymentsStatusBanner";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import {
  fmtNaira,
  intentsApi,
  type IntentRow,
  type IntentStatus,
  type TenantBalance,
} from "@/lib/api/intents";

const STATUS_TABS: Array<{ id: IntentStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Succeeded" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

/**
 * /payments — tenant transaction ledger. Reads live PaymentIntent data
 * from the new payments infrastructure (Phase 2b onward).
 *
 * Layout:
 *   - KYC status banner (if payments aren't yet enabled)
 *   - Balance + status counts (4 stat cards)
 *   - Status filter tabs
 *   - Transactions table with per-row link to /payments/{id}
 */
export default function PaymentsPage() {
  const [balance, setBalance] = useState<TenantBalance | null>(null);
  const [rows, setRows] = useState<IntentRow[] | null>(null);
  const [filter, setFilter] = useState<IntentStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadAll() {
    setError(null);
    try {
      const [b, l] = await Promise.all([
        intentsApi.balance(),
        intentsApi.list({ status: filter, size: 25 }),
      ]);
      setBalance(b.data);
      setRows(l.data.content);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load payments.");
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function refresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  return (
    <AppShell
      title="Payments"
      subtitle="Every payment your customers make through Conddo — orders, invoices, bookings, and links."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={refresh} disabled={refreshing}>
            <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="primary" size="md" href="/invoices/new">
            <Plus size={16} />
            <span className="hidden sm:inline">Create Invoice</span>
          </Button>
        </div>
      }
    >
      <PaymentsStatusBanner />

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Available balance"
          value={balance ? fmtNaira(balance.availableKobo) : "—"}
          tone="primary"
          hint="Sum of successful payments (before payouts)"
        />
        <StatCard
          label="Successful"
          value={balance ? String(balance.succeededCount) : "—"}
          tone="success"
          Icon={CheckCircle2}
        />
        <StatCard
          label="Pending"
          value={balance ? String(balance.pendingCount) : "—"}
          tone="warning"
          Icon={Clock}
        />
        <StatCard
          label="Failed"
          value={balance ? String(balance.failedCount) : "—"}
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
              (filter === t.id
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white/85")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table / states */}
      {!rows && !error && (
        <div className="flex items-center gap-2 py-10 text-[13px] text-white/50">
          <Loader2 size={14} className="animate-spin" /> Loading transactions…
        </div>
      )}

      {rows && rows.length === 0 && !error && <EmptyState filter={filter} />}

      {rows && rows.length > 0 && <TransactionsTable rows={rows} />}
    </AppShell>
  );
}

// ------------- pieces ---------------------------------------------------

function StatCard({
  label,
  value,
  hint,
  tone,
  Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "success" | "warning" | "danger";
  Icon?: LucideIcon;
}) {
  const toneCls =
    tone === "primary"
      ? "text-primary-light"
      : tone === "success"
        ? "text-emerald-300"
        : tone === "warning"
          ? "text-amber-300"
          : "text-rose-300";
  return (
    <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">
          {label}
        </p>
        {Icon && <Icon size={14} className={toneCls} />}
      </div>
      <p className={`font-mono text-[22px] font-medium leading-none ${toneCls}`}>{value}</p>
      {hint && <p className="mt-2 text-[11px] leading-snug text-white/45">{hint}</p>}
    </div>
  );
}

function TransactionsTable({ rows }: { rows: IntentRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/60">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Origin</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => (window.location.href = `/payments/${r.id}`)}
                className="cursor-pointer transition-colors hover:bg-white/[0.02]"
              >
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12.5px] text-white/65">
                  {fmtDate(r.initiatedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[13.5px] text-white">
                  {r.customerName ?? <span className="text-white/40">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[13.5px] text-white/70">
                  <OriginBadge origin={r.origin} />
                  {r.originReference && (
                    <span className="ml-2 text-white/50">{r.originReference}</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-[13.5px] text-white">
                  {fmtNaira(r.amountKobo)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <StatusPill status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: IntentStatus }) {
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

function OriginBadge({ origin }: { origin: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white/60">
      {origin}
    </span>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-12 text-center">
      <div className="rounded-xl bg-primary/12 p-3 text-primary-light">
        <FileText size={22} />
      </div>
      <h2 className="text-[15px] font-medium text-white">
        {filter === "all" ? "No payments yet" : `No ${filter} payments`}
      </h2>
      <p className="max-w-xs text-[13px] text-white/55">
        {filter === "all"
          ? "Send an invoice or share a payment link, and payments will land here as customers pay."
          : "Change the filter or wait for new activity."}
      </p>
      {filter === "all" && (
        <Link
          href="/invoices/new"
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary/90"
        >
          <Plus size={14} /> Create your first invoice
        </Link>
      )}
    </div>
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
