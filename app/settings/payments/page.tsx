"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  Landmark,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { mediaApi } from "@/lib/api/media";
import {
  paymentAccountApi,
  type PaymentAccount,
  type KycStatus,
} from "@/lib/api/payment-account";
import { payApi, type BankOption } from "@/lib/api/pay";

/**
 * /settings/payments — single-scroll KYC + bank connect page.
 *
 *  1. Status header — where the tenant is in the flow
 *  2. Bank account — code + number + name (verified locally today,
 *     Importapay name-enquiry lands in Phase 2)
 *  3. KYC documents — CAC, director ID, utility bill + business address
 *  4. Submit — only enabled when everything above is filled in
 *
 *  While the KYC is under_review or approved the whole form is
 *  read-only. Reject sends the tenant back into edit mode with the
 *  admin's reason on top.
 */
export default function PaymentsSettingsPage() {
  return (
    <SettingsShell
      active="payments"
      title="Payments and Payouts"
      description="Connect your bank, upload compliance documents, and enable customer payments once approved."
    >
      <PaymentsBody />
    </SettingsShell>
  );
}

function PaymentsBody() {
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    paymentAccountApi
      .get()
      .then((r) => setAccount(r.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load account."));
  }, []);

  if (!account && !error) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }
  if (error && !account) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5 text-[14px] text-rose-200">
        <AlertCircle size={16} className="mb-1 inline" /> {error}
      </div>
    );
  }
  const a = account!;
  const locked = a.kycStatus === "under_review" || a.kycStatus === "approved";

  return (
    <div className="space-y-8">
      <StatusHeader status={a.kycStatus} paymentsEnabled={a.paymentsEnabled} reason={a.kycRejectionReason} />
      <BankSection account={a} locked={locked} onSaved={setAccount} />
      <KycDocsSection account={a} locked={locked} onSaved={setAccount} />
      <SubmitSection
        account={a}
        locked={locked}
        submitting={submitting}
        onSubmit={async () => {
          setSubmitting(true);
          try {
            const res = await paymentAccountApi.submit();
            setAccount(res.data);
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't submit.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}

function StatusHeader({
  status,
  paymentsEnabled,
  reason,
}: {
  status: KycStatus;
  paymentsEnabled: boolean;
  reason: string | null;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <div className={`rounded-2xl border p-5 ${config.wrapper}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
          <config.Icon size={20} className={config.iconColor} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[16px] font-medium ${config.title}`}>{config.label}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-white/70">{config.description}</p>
          {status === "rejected" && reason && (
            <p className="mt-3 rounded-lg bg-rose-500/[0.08] px-3 py-2 text-[13px] text-rose-100">
              Reviewer note: {reason}
            </p>
          )}
          {status === "approved" && !paymentsEnabled && (
            <p className="mt-3 rounded-lg bg-amber-500/[0.08] px-3 py-2 text-[13px] text-amber-100">
              KYC is approved but your bank account isn&rsquo;t verified. Update your bank details below to
              turn payments on.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<
  KycStatus,
  {
    label: string;
    description: string;
    Icon: typeof ShieldCheck;
    wrapper: string;
    iconBg: string;
    iconColor: string;
    title: string;
  }
> = {
  pending: {
    label: "Get set up to accept payments",
    description:
      "Add your bank account and upload compliance documents. When you submit, our team reviews and enables live payments — usually within one business day.",
    Icon: ShieldCheck,
    wrapper: "border-white/8 bg-cinema-elev",
    iconBg: "bg-primary/[0.1]",
    iconColor: "text-primary",
    title: "text-white",
  },
  under_review: {
    label: "Under review",
    description:
      "We&rsquo;ve received your submission and are reviewing. You&rsquo;ll get an email as soon as approval is complete.",
    Icon: Clock,
    wrapper: "border-amber-500/20 bg-amber-500/[0.04]",
    iconBg: "bg-amber-500/[0.15]",
    iconColor: "text-amber-300",
    title: "text-amber-100",
  },
  approved: {
    label: "Payments are live",
    description: "You can accept payments from customers across orders, invoices, bookings, and payment links.",
    Icon: CheckCircle2,
    wrapper: "border-emerald-500/20 bg-emerald-500/[0.04]",
    iconBg: "bg-emerald-500/[0.15]",
    iconColor: "text-emerald-300",
    title: "text-emerald-100",
  },
  rejected: {
    label: "Submission needs changes",
    description:
      "Address the reviewer&rsquo;s note below, re-upload any affected documents, and submit again.",
    Icon: XCircle,
    wrapper: "border-rose-500/20 bg-rose-500/[0.04]",
    iconBg: "bg-rose-500/[0.15]",
    iconColor: "text-rose-300",
    title: "text-rose-100",
  },
};

function BankSection({
  account,
  locked,
  onSaved,
}: {
  account: PaymentAccount;
  locked: boolean;
  onSaved: (a: PaymentAccount) => void;
}) {
  const [bankCode, setBankCode] = useState(account.bankCode ?? "");
  const [bankName, setBankName] = useState(account.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(account.accountNumber ?? "");
  const [accountName, setAccountName] = useState(account.accountName ?? "");
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksState, setBanksState] = useState<"loading" | "loaded" | "failed">("loading");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Pull the canonical bank list (from Importapay) so tenants pick from a
  // dropdown instead of typing a bank name + code by hand. Distinct
  // loading / loaded / failed states so a fetch error doesn't leave the
  // select stuck on "Loading banks…" forever.
  useEffect(() => {
    payApi
      .banks()
      .then((r) => {
        setBanks(r.data);
        setBanksState("loaded");
      })
      .catch(() => setBanksState("failed"));
  }, []);

  function onBankPick(name: string) {
    setBankName(name);
    const match = banks.find((b) => b.name === name);
    setBankCode(match?.code ?? "");
  }

  const valid = bankName.trim() && bankCode.trim() && accountNumber.trim() && accountName.trim();

  async function save() {
    if (!valid) {
      setMsg("Please fill in every field before saving.");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await paymentAccountApi.updateBank({ bankCode, bankName, accountNumber, accountName });
      onSaved(res.data);
      setMsg("Saved.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      icon={<Landmark size={18} />}
      title="Bank account"
      description="Where your settled funds land. Our compliance team confirms the account name matches during KYC review."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Bank">
          <select
            disabled={locked || banksState !== "loaded"}
            value={bankName}
            onChange={(e) => onBankPick(e.target.value)}
            className={inputClass}
          >
            <option value="">
              {banksState === "loading" && "Loading banks…"}
              {banksState === "failed" && "Bank list unavailable — try refresh"}
              {banksState === "loaded" && "Select your bank…"}
            </option>
            {banks.map((b) => (
              <option key={`${b.code}-${b.name}`} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          {banksState === "failed" && (
            <p className="mt-1 text-[11.5px] text-rose-300">
              Couldn&rsquo;t reach the bank service. Refresh the page in a moment.
            </p>
          )}
        </Field>
        <Field label="Account number">
          <input
            disabled={locked}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
            placeholder="0123456789"
            inputMode="numeric"
            maxLength={10}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Account name">
            <input
              disabled={locked}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={inputClass}
              placeholder="Exactly as it appears on your bank statement"
            />
          </Field>
          <p className="mt-1.5 text-[11.5px] text-white/45">
            Type it exactly as your bank displays it. Our team confirms the name matches the account
            number during KYC review.
          </p>
        </div>
      </div>
      {!locked && (
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} variant="primary" disabled={saving || !valid}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : null} Save bank details
          </Button>
          {msg && <span className="text-[13px] text-white/60">{msg}</span>}
        </div>
      )}
    </Section>
  );
}

function KycDocsSection({
  account,
  locked,
  onSaved,
}: {
  account: PaymentAccount;
  locked: boolean;
  onSaved: (a: PaymentAccount) => void;
}) {
  const [cac, setCac] = useState<string | null>(account.cacDocumentUrl);
  const [director, setDirector] = useState<string | null>(account.directorIdUrl);
  const [utility, setUtility] = useState<string | null>(account.utilityBillUrl);
  const [address, setAddress] = useState<string>(account.businessAddress ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await paymentAccountApi.updateKycDocs({
        cacDocumentUrl: cac,
        directorIdUrl: director,
        utilityBillUrl: utility,
        businessAddress: address,
      });
      onSaved(res.data);
      setMsg("Saved.");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      icon={<FileCheck2 size={18} />}
      title="Compliance documents"
      description="Nigerian AML/CFT requirements. Files are stored securely and shared only with our compliance reviewers."
    >
      <div className="space-y-3">
        <DocUploader label="CAC certificate" value={cac} onChange={setCac} disabled={locked} />
        <DocUploader label="Director's government ID" value={director} onChange={setDirector} disabled={locked} />
        <DocUploader label="Utility bill (last 3 months)" value={utility} onChange={setUtility} disabled={locked} />
        <Field label="Business address">
          <input
            disabled={locked}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
            placeholder="Street, city, state"
          />
        </Field>
      </div>
      {!locked && (
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} variant="primary" disabled={saving}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : null} Save documents
          </Button>
          {msg && <span className="text-[13px] text-white/60">{msg}</span>}
        </div>
      )}
    </Section>
  );
}

function DocUploader({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pick(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const res = await mediaApi.upload(file, "kyc");
      onChange(res.data.url);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-cinema-elev px-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-white">{label}</p>
        <p className="mt-0.5 truncate text-[12px] text-white/50">
          {value ? "Uploaded" : "PDF or image, up to 10 MB"}
          {err && <span className="ml-2 text-rose-300">{err}</span>}
        </p>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => ref.current?.click()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[12.5px] text-white/85 hover:bg-white/[0.04] disabled:opacity-50"
      >
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {value ? "Replace" : "Upload"}
      </button>
    </div>
  );
}

function SubmitSection({
  account,
  locked,
  submitting,
  onSubmit,
}: {
  account: PaymentAccount;
  locked: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  if (locked) return null;
  const missing = [
    !account.accountNumber && "bank account",
    !account.cacDocumentUrl && "CAC document",
    !account.directorIdUrl && "director ID",
    !account.utilityBillUrl && "utility bill",
    !account.businessAddress && "business address",
  ].filter(Boolean) as string[];
  const ready = missing.length === 0;
  return (
    <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
      <p className="text-[15px] font-medium text-white">Submit for review</p>
      <p className="mt-1 text-[13.5px] text-white/65">
        Once submitted, edits are locked until a reviewer approves or asks for changes.
      </p>
      {!ready && (
        <p className="mt-3 rounded-lg bg-amber-500/[0.06] px-3 py-2 text-[12.5px] text-amber-100">
          Still needed: {missing.join(", ")}.
        </p>
      )}
      <div className="mt-4">
        <Button variant="primary" onClick={onSubmit} disabled={!ready || submitting}>
          {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Submit for review
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-white/75">
          {icon}
        </span>
        <div>
          <p className="text-[15px] font-medium text-white">{title}</p>
          <p className="mt-0.5 text-[13px] text-white/60">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] uppercase tracking-[0.06em] text-white/55">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-cinema-base px-3 py-2 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none disabled:opacity-60";
