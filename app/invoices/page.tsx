"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileText, Loader2, Plus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import {
  fmtNaira,
  invoicesApi,
  type InvoiceRow,
  type InvoiceStatus,
} from "@/lib/api/invoices";
import { ApiError } from "@/lib/api/client";

const STATUS_TABS: Array<{ id: InvoiceStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  draft: "bg-white/8 text-white/70",
  sent: "bg-primary/15 text-primary-light",
  paid: "bg-emerald-500/15 text-emerald-300",
  overdue: "bg-amber-500/15 text-amber-200",
  void: "bg-rose-500/12 text-rose-300",
};

/**
 * /invoices — tenant-side list with status filters. Feature-gated on
 * Growth+ via BE {@code @RequiresFeature('invoicing')}. Free / Starter
 * tenants get a 403 PLAN_UPGRADE_REQUIRED that the FE surfaces as an
 * upgrade nudge card.
 */
export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[] | null>(null);
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(null);
    setUpgradeRequired(false);
    invoicesApi
      .list(filter === "all" ? undefined : filter)
      .then((r) => {
        if (alive) setRows(r.data);
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof ApiError && err.code === "PLAN_UPGRADE_REQUIRED") {
          setUpgradeRequired(true);
          setRows([]);
        } else {
          setError(err instanceof ApiError ? err.message : "Couldn't load invoices.");
        }
      });
    return () => {
      alive = false;
    };
  }, [filter]);

  return (
    <AppShell
      title="Invoices"
      subtitle="Bill customers and track what's paid. Sequential per-tenant numbering."
      actions={
        !upgradeRequired && (
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary/90"
          >
            <Plus size={14} /> New invoice
          </Link>
        )
      }
    >
      {upgradeRequired && <UpgradeNudge />}

      {!upgradeRequired && (
        <>
          <div className="mb-4 flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={
                  "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition " +
                  (filter === t.id
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white/85")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
              <AlertCircle size={16} className="mt-0.5" /> {error}
            </div>
          )}

          {!rows && !error && (
            <div className="flex items-center gap-2 py-10 text-[13px] text-white/50">
              <Loader2 size={14} className="animate-spin" /> Loading invoices…
            </div>
          )}

          {rows && rows.length === 0 && !error && <EmptyState />}

          {rows && rows.length > 0 && (
            <ul className="divide-y divide-white/8 rounded-xl border border-white/10 bg-cinema-elev">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/invoices/${r.id}`}
                    className="flex items-center gap-4 p-4 transition hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] text-white">
                          {r.invoiceNumber}
                        </span>
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                            (STATUS_STYLE[r.status] ?? "")
                          }
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-[13.5px] text-white/80">
                        {r.customerName}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-white/45">
                        Issued {r.issueDate}
                        {r.dueDate ? ` · Due ${r.dueDate}` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-[14px] font-semibold text-white">
                        {fmtNaira(r.totalKobo)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-12 text-center">
      <div className="rounded-xl bg-primary/12 p-3 text-primary-light">
        <FileText size={22} />
      </div>
      <h2 className="text-[15px] font-medium text-white">No invoices yet</h2>
      <p className="max-w-xs text-[13px] text-white/55">
        Bill a customer, share the link, and track when they pay — all from here.
      </p>
      <Link
        href="/invoices/new"
        className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary/90"
      >
        <Plus size={14} /> Create your first invoice
      </Link>
    </div>
  );
}

function UpgradeNudge() {
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-6">
      <h2 className="text-[15px] font-semibold text-amber-100">
        Invoicing is a Growth-tier feature
      </h2>
      <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-amber-100/80">
        Send branded invoices to customers, take payment online, and track what&apos;s
        paid — all from your dashboard. Upgrade to Growth to unlock invoicing.
      </p>
      <Link
        href="/settings/billing"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary/90"
      >
        See plans
      </Link>
    </div>
  );
}
