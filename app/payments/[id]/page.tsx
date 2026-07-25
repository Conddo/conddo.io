"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Landmark,
  Loader2,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ApiError } from "@/lib/api/client";
import { fmtNaira, intentsApi, type IntentDetail } from "@/lib/api/intents";

/**
 * /payments/[id] — full intent detail: receiving-account snapshot,
 * sender info, matched transaction reference, failure reason if any,
 * plus a link back to the originating order/invoice/booking.
 */
export default function PaymentIntentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [intent, setIntent] = useState<IntentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    intentsApi
      .get(id)
      .then((r) => setIntent(r.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load payment."));
  }, [id]);

  return (
    <AppShell title="Payment">
      <Link
        href="/payments"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
      >
        <ArrowLeft size={13} /> Payments
      </Link>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}

      {!intent && !error && (
        <div className="flex items-center gap-2 text-white/50">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      {intent && <IntentBody intent={intent} />}
    </AppShell>
  );
}

function IntentBody({ intent }: { intent: IntentDetail }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header — status + amount */}
      <div className="rounded-2xl border border-white/8 bg-cinema-elev p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Payment</p>
            <p className="mt-2 font-mono text-[13px] text-white/85">{intent.id}</p>
          </div>
          <StatusPill status={intent.status} />
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="font-mono text-[32px] font-semibold text-white">{fmtNaira(intent.amountKobo)}</p>
          {intent.feeKobo > 0 && (
            <p className="text-[12px] text-white/50">
              net {fmtNaira(intent.netKobo)} (fee {fmtNaira(intent.feeKobo)})
            </p>
          )}
        </div>
      </div>

      {/* Customer */}
      <Card title="Customer">
        <Row label="Name">{intent.customerName ?? "—"}</Row>
        <Row label="Email">{intent.customerEmail ?? "—"}</Row>
        <Row label="Phone">{intent.customerPhone ?? "—"}</Row>
      </Card>

      {/* Origin */}
      <Card title="Origin">
        <Row label="Type">
          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11.5px] uppercase text-white/70">
            {intent.origin}
          </span>
        </Row>
        {intent.originReference && <Row label="Reference">{intent.originReference}</Row>}
        {intent.originInvoiceId && (
          <Row label="Invoice">
            <Link
              href={`/invoices/${intent.originInvoiceId}`}
              className="text-primary-light hover:underline"
            >
              Open invoice
            </Link>
          </Row>
        )}
      </Card>

      {/* Bank transfer trail */}
      <Card title="Bank transfer" icon={<Landmark size={14} />}>
        <Row label="Provider">
          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11.5px] uppercase text-white/70">
            {intent.provider}
          </span>
        </Row>
        <Row label="Provider reference">
          {intent.providerReference ? (
            <span className="font-mono text-[12px] text-white/80">{intent.providerReference}</span>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Receiving account">
          {intent.receivingAccountNumber ? (
            <span>
              {intent.receivingBankName} · <span className="font-mono">{intent.receivingAccountNumber}</span> ·{" "}
              {intent.receivingAccountName}
            </span>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Sender">
          {intent.senderAccountNumber ? (
            <span>
              {intent.senderBankName} · <span className="font-mono">{intent.senderAccountNumber}</span>
            </span>
          ) : (
            <span className="text-white/50">Customer hasn&rsquo;t confirmed yet</span>
          )}
        </Row>
        {intent.matchedTransactionRef && (
          <Row label="Matched credit">
            <span className="font-mono text-[12px] text-emerald-300">{intent.matchedTransactionRef}</span>
          </Row>
        )}
      </Card>

      {intent.failureReason && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
          <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-rose-300">Failure reason</p>
          <p className="text-[13.5px] text-rose-100">{intent.failureReason}</p>
        </div>
      )}

      {/* Timestamps */}
      <Card title="Timeline">
        <Row label="Initiated">{fmtDate(intent.initiatedAt)}</Row>
        {intent.completedAt && <Row label="Completed">{fmtDate(intent.completedAt)}</Row>}
        {intent.lastVerifiedAt && <Row label="Last verified">{fmtDate(intent.lastVerifiedAt)}</Row>}
      </Card>
    </div>
  );
}

// ------------- pieces ---------------------------------------------------

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "succeeded"
      ? "bg-emerald-500/15 text-emerald-200"
      : status === "pending"
        ? "bg-amber-500/15 text-amber-200"
        : status === "failed" || status === "expired"
          ? "bg-rose-500/15 text-rose-200"
          : "bg-white/10 text-white/70";
  const Icon =
    status === "succeeded" ? CheckCircle2 :
    status === "pending" ? Clock :
    status === "failed" || status === "expired" ? XCircle : null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${cls}`}>
      {Icon && <Icon size={12} />} {status.replace("_", " ")}
    </span>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-white/55">
        {icon}
        {title}
      </div>
      <div className="divide-y divide-white/[0.05]">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-4 py-2.5 text-[13.5px]">
      <span className="text-white/55">{label}</span>
      <span className="text-white/90">{children}</span>
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
