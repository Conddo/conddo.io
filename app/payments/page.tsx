"use client";

import { useState } from "react";
import { Plus, CalendarDays, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { PaymentsStatusBanner } from "@/components/app/PaymentsStatusBanner";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { paymentsApi, type TxnStatus } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";

const statusMeta: Record<TxnStatus, { tone: "success" | "danger" | "warning"; label: string }> = {
  received: { tone: "success", label: "Paid" },
  overdue: { tone: "danger", label: "Overdue" },
  outstanding: { tone: "warning", label: "Outstanding" },
};
const FILTERS = ["All", "Received", "Outstanding", "Overdue"];
const FILTER_PARAM: Record<string, string> = { All: "", Received: "received", Outstanding: "outstanding", Overdue: "overdue" };
const fmtDate = (t: string) => {
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

export default function PaymentsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [reminding, setReminding] = useState<string | null>(null);

  const summary = useApiQuery(() => paymentsApi.summary());
  const txns = useApiQuery(() => paymentsApi.transactions({ filter: FILTER_PARAM[filter] }), [filter]);
  const outstanding = useApiQuery(paymentsApi.outstanding);

  const s = summary.data;
  const rows = txns.data ?? [];
  const owing = outstanding.data ?? [];

  const stats = [
    { label: "This month", value: naira(s?.thisMonth ?? 0), tone: "text-primary" },
    { label: "Outstanding", value: naira(s?.outstanding ?? 0), tone: "text-amber-300" },
    { label: "Paid invoices", value: String(s?.paidInvoices ?? 0), tone: "text-white" },
    { label: "Overdue", value: naira(s?.overdue ?? 0), tone: "text-rose-200" },
  ];

  async function remind(customerId: string, name: string) {
    setReminding(customerId);
    try {
      await paymentsApi.remind(customerId);
      toast.success("Reminder sent", name);
    } catch (err) {
      toast.error("Couldn't send reminder", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setReminding(null);
    }
  }

  return (
    <AppShell
      title="Payments"
      actions={
        <Button variant="primary" size="md" href="/invoices/new">
          <Plus size={17} />
          <span className="hidden sm:inline">Create Invoice</span>
        </Button>
      }
    >
      <PaymentsStatusBanner />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Left: stats + table */}
        <div className="min-w-0 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((st) => (
              <div key={st.label} className="rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-white/65">{st.label}</p>
                <p className={`font-mono text-[26px] font-medium leading-none ${st.tone}`}>{summary.loading ? "—" : st.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "border-primary/20 bg-primary/[0.08] font-medium text-primary"
                      : "border-white/[0.06] bg-cinema-elev text-white/65 hover:bg-white/[0.02]"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Transactions table */}
          <QueryBoundary
            loading={txns.loading}
            error={txns.error}
            isEmpty={rows.length === 0}
            onRetry={txns.refetch}
            loadingLabel="Loading transactions…"
            empty={
              <EmptyState
                icon={CalendarDays}
                title={filter === "All" ? "No transactions yet" : `No ${filter.toLowerCase()} transactions`}
                description="Payments recorded against your orders show up here."
              />
            }
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/65">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {rows.map((t, i) => {
                      const meta = statusMeta[t.status] ?? statusMeta.outstanding;
                      return (
                        <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                          <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[13px] text-white/65">{fmtDate(t.date)}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-white">{t.customer}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-white/65">{t.description}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-[13px] text-white">{naira(t.amount)}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-white/65">{t.method ?? <span className="text-white/45">—</span>}</td>
                          <td className="px-4 py-3.5"><Chip tone={meta.tone}>{meta.label}</Chip></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </QueryBoundary>
        </div>

        {/* Right: outstanding */}
        <aside className="rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="border-b border-white/[0.06] p-6">
            <h3 className="mb-4 text-[16px] font-medium text-white">Outstanding</h3>
            {owing.length > 0 ? (
              <div className="flex gap-3 rounded-lg border border-warning/15 bg-amber-500/15 p-4">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
                <div>
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-[0.05em] text-amber-300">Action Required</p>
                  <p className="text-[13px] text-white/65">{owing.length} customer{owing.length > 1 ? "s have" : " has"} an open balance.</p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-white/65">{outstanding.loading ? "Loading…" : "No outstanding balances — you're all caught up."}</p>
            )}
          </div>
          {owing.length > 0 && (
            <div className="p-6">
              <p className="mb-4 text-[11px] uppercase tracking-[0.05em] text-white/65">By Customer</p>
              <div className="space-y-5">
                {owing.map((c) => (
                  <div key={c.customerId}>
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-white">{c.name}</p>
                        <p className="text-[11px] text-white/45">{c.note}</p>
                      </div>
                      <span className="font-mono text-[14px] text-white">{naira(c.amount)}</span>
                    </div>
                    <button
                      onClick={() => remind(c.customerId, c.name)}
                      disabled={reminding === c.customerId}
                      className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] py-2 text-[13px] font-medium text-white transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      {reminding === c.customerId ? "Sending…" : "Send reminder"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
