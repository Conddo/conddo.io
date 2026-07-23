"use client";

import { useEffect, useRef, useState, use } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Landmark,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import {
  fmtNaira,
  payApi,
  type BankOption,
  type PublicIntent,
} from "@/lib/api/pay";

type Props = { params: Promise<{ intentId: string }> };

/**
 * /pay/{intentId} — customer-facing bank-transfer pay page.
 *
 *  1. Fetch intent → show receiving account (bank + acct + name) + amount
 *  2. Customer transfers from their own bank/USSD
 *  3. "I have paid" → sender bank picker + sender account input → confirm
 *  4. Poll verify every 5s until resolved
 *  5. Terminal: succeeded / failed / ambiguous
 *
 * The page is tenant-branded (logo + primary color from the intent's
 * business + brand block) so a customer sees the tenant, not Conddo.
 */
export default function PayPage({ params }: Props) {
  const { intentId } = use(params);
  const [intent, setIntent] = useState<PublicIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [senderBank, setSenderBank] = useState("");
  const [senderAcct, setSenderAcct] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial fetch — intent + bank list in parallel.
  useEffect(() => {
    payApi
      .get(intentId)
      .then((r) => setIntent(r.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Payment not found."));
    payApi.banks().then((r) => setBanks(r.data)).catch(() => setBanks([]));
  }, [intentId]);

  // Poll verify while in awaiting_confirmation (i.e. still pending after
  // the customer confirmed). Every 5s until we hit a terminal status.
  useEffect(() => {
    if (!intent) return;
    const terminal =
      intent.status === "succeeded" ||
      intent.status === "failed" ||
      intent.status === "refunded" ||
      intent.status === "partially_refunded";
    if (terminal || intent.status !== "pending" || !showConfirm) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const r = await payApi.verify(intentId);
        setIntent(r.data);
      } catch {
        // Silent — a transient failure shouldn't yank the customer out.
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [intent, showConfirm, intentId]);

  async function confirm() {
    if (!senderBank || !senderAcct.trim()) return;
    setConfirming(true);
    setError(null);
    try {
      const r = await payApi.confirm(intentId, senderBank, senderAcct.trim());
      setIntent(r.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Confirmation failed.");
    } finally {
      setConfirming(false);
    }
  }

  async function copyText(text: string | null) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // best-effort; some browsers block outside secure context
    }
  }

  if (error && !intent) {
    return (
      <Shell brand={null}>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-6 text-[14px] text-rose-200">
          <AlertCircle size={16} className="mb-1 inline" /> {error}
        </div>
      </Shell>
    );
  }
  if (!intent) {
    return (
      <Shell brand={null}>
        <div className="flex items-center gap-2 text-white/60">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      </Shell>
    );
  }

  const primary = intent.brand.primaryColor || "#7C5CBF";

  return (
    <Shell brand={intent.brand}>
      {/* Header — business identity */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Payment to</p>
        <div className="mt-2 flex items-center gap-3">
          {intent.brand.logoUrl && (
            <img
              src={intent.brand.logoUrl}
              alt={intent.business.name}
              className="h-10 w-10 rounded-lg object-contain"
            />
          )}
          <div>
            <p className="text-[18px] font-semibold text-white">{intent.business.name}</p>
            {intent.originReference && (
              <p className="text-[12.5px] text-white/55">{intent.originReference}</p>
            )}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6 rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Amount due</p>
        <p className="mt-2 font-mono text-[36px] font-semibold text-white">{fmtNaira(intent.amountKobo)}</p>
      </div>

      {/* Terminal states */}
      {intent.status === "succeeded" && <SuccessState intent={intent} primary={primary} />}
      {intent.status === "failed" && <FailedState intent={intent} onRetry={() => setShowConfirm(false)} />}
      {(intent.status === "refunded" || intent.status === "partially_refunded") && (
        <RefundedState />
      )}

      {/* Pending — active pay flow */}
      {intent.status === "pending" && (
        <>
          <ReceivingAccount intent={intent} onCopy={copyText} />

          {!showConfirm ? (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                style={{ backgroundColor: primary }}
                className="mt-5 w-full rounded-xl px-4 py-3.5 text-[14.5px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                I have paid
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-white/55">
                <ShieldCheck size={12} /> Secured by Importapay
              </p>
            </>
          ) : (
            <ConfirmForm
              banks={banks}
              senderBank={senderBank}
              setSenderBank={setSenderBank}
              senderAcct={senderAcct}
              setSenderAcct={setSenderAcct}
              confirm={confirm}
              confirming={confirming}
              primary={primary}
              error={error}
              polling={pollRef.current !== null}
            />
          )}
        </>
      )}
    </Shell>
  );
}

function Shell({
  brand,
  children,
}: {
  brand: PublicIntent["brand"] | null;
  children: React.ReactNode;
}) {
  const primary = brand?.primaryColor || "#7C5CBF";
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${primary}, transparent)` }}
      />
      <div className="relative mx-auto max-w-md px-5 py-10">
        <div className="rounded-3xl border border-white/8 bg-[#111114] p-6 shadow-2xl">
          {children}
        </div>
        <p className="mt-5 text-center text-[11px] text-white/35">
          Powered by <span className="text-white/60">Conddo</span>
        </p>
      </div>
    </div>
  );
}

function ReceivingAccount({
  intent,
  onCopy,
}: {
  intent: PublicIntent;
  onCopy: (v: string | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.1em] text-white/55">
        <Landmark size={13} /> Transfer to this account
      </div>
      <div className="space-y-2.5">
        <Row label="Bank" value={intent.receivingBankName} onCopy={onCopy} />
        <Row label="Account number" value={intent.receivingAccountNumber} onCopy={onCopy} mono />
        <Row label="Account name" value={intent.receivingAccountName} onCopy={onCopy} />
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-white/55">
        Send exactly <span className="font-mono text-white/80">{fmtNaira(intent.amountKobo)}</span> from your bank
        app, USSD, or transfer service. Then tap <strong className="text-white/80">I have paid</strong>.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string | null;
  onCopy: (v: string | null) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-white/50">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`text-[14px] text-white ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
        {value && (
          <button
            onClick={() => onCopy(value)}
            className="text-white/45 hover:text-white"
            aria-label={`Copy ${label}`}
          >
            <Copy size={12} />
          </button>
        )}
      </span>
    </div>
  );
}

function ConfirmForm({
  banks,
  senderBank,
  setSenderBank,
  senderAcct,
  setSenderAcct,
  confirm,
  confirming,
  primary,
  error,
  polling,
}: {
  banks: BankOption[];
  senderBank: string;
  setSenderBank: (v: string) => void;
  senderAcct: string;
  setSenderAcct: (v: string) => void;
  confirm: () => void;
  confirming: boolean;
  primary: string;
  error: string | null;
  polling: boolean;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <p className="mb-3 text-[13px] font-medium text-white">Confirm your transfer</p>
      <p className="mb-4 text-[12px] text-white/60">
        Tell us which bank you paid from so we can match it to your transfer.
      </p>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.06em] text-white/50">Your bank</span>
        <select
          value={senderBank}
          onChange={(e) => setSenderBank(e.target.value)}
          disabled={confirming || polling}
          className="w-full rounded-lg border border-white/10 bg-[#0a0a0c] px-3 py-2.5 text-[13.5px] text-white focus:border-white/30 focus:outline-none"
        >
          <option value="">Select your bank…</option>
          {banks.map((b) => (
            <option key={b.code} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.06em] text-white/50">
          Your account number
        </span>
        <input
          value={senderAcct}
          onChange={(e) => setSenderAcct(e.target.value.replace(/\D/g, ""))}
          disabled={confirming || polling}
          inputMode="numeric"
          maxLength={10}
          placeholder="0123456789"
          className="w-full rounded-lg border border-white/10 bg-[#0a0a0c] px-3 py-2.5 font-mono text-[13.5px] text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
        />
      </label>
      {error && (
        <p className="mb-2 rounded-lg bg-rose-500/[0.08] px-3 py-2 text-[12.5px] text-rose-100">
          <AlertCircle size={12} className="mr-1 inline" /> {error}
        </p>
      )}
      {polling && (
        <p className="mb-2 flex items-center gap-2 rounded-lg bg-amber-500/[0.08] px-3 py-2 text-[12.5px] text-amber-100">
          <Clock size={12} /> Waiting for your transfer to reflect — this usually takes under a minute.
        </p>
      )}
      <button
        onClick={confirm}
        disabled={!senderBank || !senderAcct || confirming || polling}
        style={{ backgroundColor: primary }}
        className="w-full rounded-xl px-4 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {confirming ? <Loader2 size={13} className="mr-1 inline animate-spin" /> : null}
        {polling ? "Checking…" : "Confirm payment"}
      </button>
    </div>
  );
}

function SuccessState({ intent, primary }: { intent: PublicIntent; primary: string }) {
  return (
    <div className="mt-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-5 text-center">
      <span
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: primary + "20", color: primary }}
      >
        <CheckCircle2 size={26} />
      </span>
      <p className="text-[16px] font-semibold text-white">Payment successful</p>
      <p className="mt-1 text-[13px] text-white/70">
        Thanks — {intent.business.name} has received your payment.
      </p>
      {intent.matchedTransactionRef && (
        <p className="mt-3 font-mono text-[10.5px] text-white/45">
          Ref: {intent.matchedTransactionRef}
        </p>
      )}
    </div>
  );
}

function FailedState({ intent, onRetry }: { intent: PublicIntent; onRetry: () => void }) {
  return (
    <div className="mt-2 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-5 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/[0.15] text-rose-300">
        <XCircle size={26} />
      </span>
      <p className="text-[16px] font-semibold text-white">Payment couldn&rsquo;t be matched</p>
      <p className="mt-1 text-[13px] leading-relaxed text-white/70">
        {intent.failureReason ??
          "We didn't find a matching transfer. If you already paid, please contact the business."}
      </p>
      {intent.business.contactEmail && (
        <a
          href={`mailto:${intent.business.contactEmail}`}
          className="mt-4 inline-block text-[13px] text-white/75 underline hover:text-white"
        >
          Contact {intent.business.name}
        </a>
      )}
    </div>
  );
}

function RefundedState() {
  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <p className="text-[15px] font-medium text-white">Payment refunded</p>
      <p className="mt-1 text-[13px] text-white/60">This payment has been returned to you.</p>
    </div>
  );
}
