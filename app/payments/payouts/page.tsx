"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Building2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PaymentsStatusBanner } from "@/components/app/PaymentsStatusBanner";
import { ApiError } from "@/lib/api/client";
import { payoutsApi, type PayoutRow, type PayoutStatus } from "@/lib/api/payouts";
import { fmtNaira } from "@/lib/api/intents";

/**
 * /payments/payouts — tenant settlement history.
 *
 * Populated by provider payout webhooks — currently empty for real
 * tenants because Importapay hasn't documented their payout webhook
 * publicly. Ships as a shell so the UX is discoverable and no FE
 * change is needed once payouts start flowing.
 */
export default function PayoutsPage() {
  const [rows, setRows] = useState<PayoutRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    payoutsApi
      .list()
      .then((r) => setRows(r.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load payouts."));
  }, []);

  return (
    <AppShell
      title="Payouts"
      subtitle="Settlements to your bank account. Populated automatically when your payment provider sends money to your bank."
    >
      <Link
        href="/payments"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
      >
        <ArrowLeft size={13} /> Payments
      </Link>

      <PaymentsStatusBanner />

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}

      {!rows && !error && (
        <div className="flex items-center gap-2 py-10 text-[13px] text-white/50">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      {rows && rows.length === 0 && !error && <EmptyState />}

      {rows && rows.length > 0 && <PayoutsTable rows={rows} />}
    </AppShell>
  );
}

function PayoutsTable({ rows }: { rows: PayoutRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/60">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Bank</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12.5px] text-white/65">
                  {fmtDate(r.completedAt ?? r.initiatedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[13.5px] text-white">
                  {r.bankName ?? "—"}
                  {r.accountNumberLast4 && (
                    <span className="ml-2 font-mono text-[11.5px] text-white/50">
                      ···{r.accountNumberLast4}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-[13.5px] text-white">
                  {fmtNaira(r.amountKobo)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <StatusPill status={r.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11.5px] text-white/50">
                  {r.providerReference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: PayoutStatus }) {
  const cls =
    status === "succeeded"
      ? "bg-emerald-500/15 text-emerald-200"
      : status === "processing" || status === "pending"
        ? "bg-amber-500/15 text-amber-200"
        : "bg-rose-500/15 text-rose-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-12 text-center">
      <div className="rounded-xl bg-primary/12 p-3 text-primary-light">
        <Building2 size={22} />
      </div>
      <h2 className="text-[15px] font-medium text-white">No payouts yet</h2>
      <p className="max-w-md text-[13px] leading-relaxed text-white/55">
        Once your payment provider settles money to your registered bank account, each transfer
        will land here with its bank details, amount, and reference for reconciliation.
      </p>
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
