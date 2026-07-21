"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import {
  fmtNaira,
  invoicesApi,
  type InvoiceDetail,
  type InvoiceStatus,
} from "@/lib/api/invoices";
import { ApiError } from "@/lib/api/client";
import { APP_DOMAIN } from "@/lib/brand";

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  draft: "bg-white/8 text-white/70",
  sent: "bg-primary/15 text-primary-light",
  paid: "bg-emerald-500/15 text-emerald-300",
  overdue: "bg-amber-500/15 text-amber-200",
  void: "bg-rose-500/12 text-rose-300",
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<null | "send" | "paid" | "void">(null);
  const [copied, setCopied] = useState(false);

  const publicUrl = invoice ? `https://app.${APP_DOMAIN}/i/${invoice.publicToken}` : "";

  async function load() {
    setError(null);
    try {
      const res = await invoicesApi.get(id);
      setInvoice(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load invoice.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function markSent() {
    setAction("send");
    try {
      await invoicesApi.markSent(id);
      await load();
    } finally {
      setAction(null);
    }
  }
  async function markPaid() {
    if (!window.confirm("Mark this invoice as paid in full?")) return;
    setAction("paid");
    try {
      await invoicesApi.markPaid(id, "cash");
      await load();
    } finally {
      setAction(null);
    }
  }
  async function voidInvoice() {
    if (!window.confirm("Void this invoice? It stays in the audit trail but can no longer be paid.")) return;
    setAction("void");
    try {
      await invoicesApi.voidInvoice(id);
      router.push("/invoices");
    } finally {
      setAction(null);
    }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the URL is still selectable on-screen */
    }
  }

  return (
    <AppShell
      title={invoice ? invoice.invoiceNumber : "Invoice"}
      subtitle={invoice ? invoice.customerName : ""}
    >
      <Link
        href="/invoices"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
      >
        <ArrowLeft size={13} /> Invoices
      </Link>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}

      {!invoice && !error && (
        <div className="flex items-center gap-2 py-10 text-[13px] text-white/50">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      {invoice && (
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-mono text-[13px] text-white/70">{invoice.invoiceNumber}</div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                    (STATUS_STYLE[invoice.status] ?? "")
                  }
                >
                  {invoice.status}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-white/45">Bill to</p>
                  <div className="text-[14px] font-medium text-white">{invoice.customerName}</div>
                  {invoice.customerEmail && (
                    <div className="text-[12.5px] text-white/60">{invoice.customerEmail}</div>
                  )}
                  {invoice.customerPhone && (
                    <div className="text-[12.5px] text-white/60">{invoice.customerPhone}</div>
                  )}
                  {invoice.customerAddress && (
                    <div className="text-[12.5px] text-white/60">{invoice.customerAddress}</div>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-white/45">Dates</p>
                  <div className="text-[13px] text-white/80">Issued {invoice.issueDate}</div>
                  {invoice.dueDate && (
                    <div className="text-[13px] text-white/80">Due {invoice.dueDate}</div>
                  )}
                  {invoice.paidAt && (
                    <div className="text-[13px] text-emerald-300">
                      Paid {new Date(invoice.paidAt).toLocaleString("en-NG")}
                      {invoice.paidMethod ? ` · ${invoice.paidMethod}` : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                Items
              </p>
              <div className="grid grid-cols-[1fr_60px_120px_120px] gap-2 border-b border-white/10 pb-2 text-[11px] uppercase tracking-wide text-white/45">
                <div>Description</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Unit</div>
                <div className="text-right">Total</div>
              </div>
              {invoice.lines.map((l) => (
                <div
                  key={l.id}
                  className="grid grid-cols-[1fr_60px_120px_120px] gap-2 border-b border-white/6 py-2.5 text-[13.5px] text-white/85"
                >
                  <div>{l.description}</div>
                  <div className="text-right font-mono">{l.quantity}</div>
                  <div className="text-right font-mono">{fmtNaira(l.unitPriceKobo)}</div>
                  <div className="text-right font-mono">{fmtNaira(l.lineTotalKobo)}</div>
                </div>
              ))}
              <div className="mt-4 grid justify-items-end gap-1 text-[13.5px]">
                <Row label="Subtotal" kobo={invoice.subtotalKobo} />
                {invoice.taxKobo > 0 && <Row label="Tax" kobo={invoice.taxKobo} />}
                {invoice.discountKobo > 0 && (
                  <Row label="Discount" kobo={-invoice.discountKobo} />
                )}
                <div className="mt-2 flex gap-6 pt-1 text-[16px] font-semibold text-white">
                  <span>Total</span>
                  <span className="font-mono">{fmtNaira(invoice.totalKobo)}</span>
                </div>
              </div>
            </div>

            {(invoice.notes || invoice.terms) && (
              <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
                {invoice.notes && (
                  <div className="mb-3">
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-white/45">Notes</p>
                    <p className="whitespace-pre-line text-[13.5px] text-white/80">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-white/45">Terms</p>
                    <p className="whitespace-pre-line text-[13.5px] text-white/80">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="grid gap-4">
            <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                Share
              </p>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
                <input
                  readOnly
                  value={publicUrl}
                  className="flex-1 bg-transparent font-mono text-[11.5px] text-white/85 outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-white/85 hover:bg-white/[0.10]"
                >
                  {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[11.5px] text-white/50">
                Send this URL by email, SMS, or WhatsApp. The customer sees the invoice
                in your brand, no login required.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
                Actions
              </p>
              <div className="grid gap-2">
                {invoice.status === "draft" && (
                  <Button
                    onClick={markSent}
                    variant="primary"
                    disabled={action !== null}
                    className="w-full justify-center"
                  >
                    {action === "send" ? <Loader2 size={13} className="animate-spin" /> : null}
                    Mark as sent
                  </Button>
                )}
                {invoice.status !== "paid" && invoice.status !== "void" && (
                  <Button
                    onClick={markPaid}
                    variant="secondary"
                    disabled={action !== null}
                    className="w-full justify-center"
                  >
                    {action === "paid" ? <Loader2 size={13} className="animate-spin" /> : null}
                    Mark as paid (cash / transfer)
                  </Button>
                )}
                {invoice.status !== "void" && (
                  <button
                    onClick={voidInvoice}
                    disabled={action !== null}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-rose-400/20 bg-rose-500/[0.05] px-3 py-2 text-[13px] text-rose-200 hover:bg-rose-500/[0.10]"
                  >
                    <Trash2 size={13} /> Void invoice
                  </button>
                )}
              </div>
              <p className="mt-3 text-[11.5px] text-white/50">
                Paystack-style pay-now button on the public link comes with Routepay /
                Importapay in the next pass. For now, mark cash / transfer payments here.
              </p>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function Row({ label, kobo }: { label: string; kobo: number }) {
  return (
    <div className="flex gap-6 text-white/60">
      <span>{label}</span>
      <span className={"font-mono " + (kobo < 0 ? "text-white/70" : "text-white")}>
        {kobo < 0 ? "−" : ""}
        {fmtNaira(Math.abs(kobo))}
      </span>
    </div>
  );
}
