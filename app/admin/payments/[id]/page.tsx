"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Landmark,
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
  type AdminPaymentDetail,
} from "@/lib/api/admin";

const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    kobo / 100,
  );

/** /admin/payments/[id] — SUPER_ADMIN detail + reverify action for
 *  support triage on stuck / disputed intents. */
export default function AdminPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [intent, setIntent] = useState<AdminPaymentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reverifying, setReverifying] = useState(false);

  async function load() {
    setError(null);
    try {
      const d = await adminApi.payment(id);
      setIntent(d);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        clearAdminToken();
        router.replace("/admin");
        return;
      }
      setError(err instanceof AdminApiError ? err.message : "Couldn't load payment.");
    }
  }

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function reverify() {
    setReverifying(true);
    setError(null);
    try {
      const d = await adminApi.reverifyPayment(id);
      setIntent(d);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Re-verify failed.");
    } finally {
      setReverifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <StudioNav />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/admin/payments"
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

        {intent && (
          <div className="space-y-5">
            {/* Header — status + amount + reverify */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Payment</p>
                  <p className="mt-2 font-mono text-[12.5px] text-white/80">{intent.id}</p>
                  <p className="mt-1 text-[11.5px] text-white/45">
                    Tenant · <span className="font-mono">{intent.tenantId}</span>
                  </p>
                </div>
                <StatusPill status={intent.status} />
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-mono text-[30px] font-semibold text-white">
                  {naira(intent.amountKobo)}
                </p>
                {intent.feeKobo > 0 && (
                  <p className="text-[12px] text-white/50">
                    net {naira(intent.netKobo)} (fee {naira(intent.feeKobo)})
                  </p>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={reverify}
                  disabled={reverifying}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white/80 hover:bg-white/[0.06] disabled:opacity-50"
                >
                  <RefreshCcw size={13} className={reverifying ? "animate-spin" : ""} />
                  Re-verify with provider
                </button>
                <p className="mt-2 text-[11.5px] text-white/45">
                  Forces the provider to re-check this transaction. Use when an intent looks stuck.
                </p>
              </div>
            </div>

            <Card title="Customer">
              <Row label="Name">{intent.customerName ?? "—"}</Row>
              <Row label="Email">{intent.customerEmail ?? "—"}</Row>
              <Row label="Phone">{intent.customerPhone ?? "—"}</Row>
            </Card>

            <Card title="Origin">
              <Row label="Type">
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11.5px] uppercase text-white/70">
                  {intent.origin}
                </span>
              </Row>
              {intent.originReference && <Row label="Reference">{intent.originReference}</Row>}
              {intent.originInvoiceId && (
                <Row label="Invoice ID">
                  <span className="font-mono text-[12px]">{intent.originInvoiceId}</span>
                </Row>
              )}
              {intent.originOrderId && (
                <Row label="Order ID">
                  <span className="font-mono text-[12px]">{intent.originOrderId}</span>
                </Row>
              )}
              {intent.originBookingId && (
                <Row label="Booking ID">
                  <span className="font-mono text-[12px]">{intent.originBookingId}</span>
                </Row>
              )}
            </Card>

            <Card title="Bank transfer" icon={<Landmark size={14} />}>
              <Row label="Provider">
                <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11.5px] uppercase text-white/70">
                  {intent.provider}
                </span>
              </Row>
              <Row label="Provider ref">
                {intent.providerReference ? (
                  <span className="font-mono text-[12px] text-white/80">{intent.providerReference}</span>
                ) : (
                  "—"
                )}
              </Row>
              <Row label="Receiving">
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
                  <span className="font-mono text-[12px] text-emerald-300">
                    {intent.matchedTransactionRef}
                  </span>
                </Row>
              )}
            </Card>

            {intent.failureReason && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
                <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-rose-300">Failure reason</p>
                <p className="text-[13.5px] text-rose-100">{intent.failureReason}</p>
              </div>
            )}

            <Card title="Timeline">
              <Row label="Initiated">{fmtDate(intent.initiatedAt)}</Row>
              {intent.completedAt && <Row label="Completed">{fmtDate(intent.completedAt)}</Row>}
              {intent.lastVerifiedAt && <Row label="Last verified">{fmtDate(intent.lastVerifiedAt)}</Row>}
            </Card>
          </div>
        )}
      </main>
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
  const Icon =
    status === "succeeded" ? CheckCircle2 :
    status === "pending" ? Clock :
    status === "failed" || status === "expired" ? XCircle : null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${cls}`}
    >
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
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
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
