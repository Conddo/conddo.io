"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import { StudioNav } from "@/components/admin/StudioNav";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type AdminKycRow,
} from "@/lib/api/admin";

/** /admin/kyc/[tenantId] — SUPER_ADMIN detailed KYC review. Shows every
 *  document + bank line, with Approve / Reject actions. Reject requires
 *  a reason the tenant will see back on their settings page. */
export default function AdminKycDetailPage() {
  // Match the pattern used elsewhere in /admin (useParams hook) rather
  // than Next 15's async `use(params)` — the deploy is on the older
  // params-as-object contract and use() on a plain object throws a
  // client-side exception.
  const { tenantId } = useParams<{ tenantId: string }>();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/dashboard");
      return;
    }
    setAuthed(true);
  }, [router]);

  if (authed !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={22} className="animate-spin text-white/50" />
      </div>
    );
  }
  return (
    <Body
      tenantId={tenantId}
      onSignOut={() => {
        clearAdminToken();
        router.replace("/admin/dashboard");
      }}
    />
  );
}

function Body({ tenantId, onSignOut }: { tenantId: string; onSignOut: () => void }) {
  const [row, setRow] = useState<AdminKycRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const router = useRouter();

  async function load() {
    setError(null);
    try {
      const data = await adminApi.kyc(tenantId);
      setRow(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load record.");
    }
  }

  useEffect(() => {
    load();
  }, [tenantId]);

  async function approve() {
    setAction("approve");
    setError(null);
    try {
      const data = await adminApi.approveKyc(tenantId);
      setRow(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Approval failed.");
    } finally {
      setAction(null);
    }
  }
  async function reject() {
    if (!rejectReason.trim()) return;
    setAction("reject");
    setError(null);
    try {
      const data = await adminApi.rejectKyc(tenantId, rejectReason.trim());
      setRow(data);
      setShowReject(false);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Rejection failed.");
    } finally {
      setAction(null);
    }
  }

  return (
    <div className="min-h-screen bg-cinema-base text-white">
      <StudioNav onRefresh={load} onSignOut={onSignOut} />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <button
          onClick={() => router.push("/admin/kyc")}
          className="mb-6 inline-flex items-center gap-1.5 text-[12.5px] text-white/60 hover:text-white"
        >
          <ArrowLeft size={13} /> Back to queue
        </button>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3 text-[13px] text-rose-200">
            <AlertCircle size={13} className="mr-1 inline" /> {error}
          </div>
        )}

        {!row ? (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-white/50">Tenant ID</p>
                  <p className="mt-1 font-mono text-[13px] text-white">{row.tenantId}</p>
                </div>
                <StatusPill status={row.kycStatus} paymentsEnabled={row.paymentsEnabled} />
              </div>
              {row.kycSubmittedAt && (
                <p className="text-[12px] text-white/50">
                  Submitted {new Date(row.kycSubmittedAt).toLocaleString()}
                  {row.kycReviewedAt && ` · Last reviewed ${new Date(row.kycReviewedAt).toLocaleString()}`}
                </p>
              )}
            </div>

            <Card title="Bank account">
              <Row label="Bank">{row.bankName || <em className="text-white/50">not set</em>}</Row>
              <Row label="Bank code">{row.bankCode || "—"}</Row>
              <Row label="Account number">{row.accountNumber || "—"}</Row>
              <Row label="Account name">{row.accountName || "—"}</Row>
              <Row label="Verified">
                {row.accountVerified ? (
                  <span className="text-emerald-300">
                    <CheckCircle2 size={12} className="mr-1 inline" /> Yes
                  </span>
                ) : (
                  <span className="text-amber-300">Not yet</span>
                )}
              </Row>
            </Card>

            <Card title="Compliance documents">
              <DocRow label="CAC certificate" url={row.cacDocumentUrl} />
              <DocRow label="Director's ID" url={row.directorIdUrl} />
              <DocRow label="Utility bill" url={row.utilityBillUrl} />
              <Row label="Business address">{row.businessAddress || "—"}</Row>
            </Card>

            {row.kycRejectionReason && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4 text-[13px] text-rose-100">
                <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-rose-300">Previous rejection</p>
                {row.kycRejectionReason}
              </div>
            )}

            {row.kycStatus === "under_review" && (
              <div className="flex gap-3">
                <button
                  onClick={approve}
                  disabled={action !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-4 py-2 text-[13px] font-medium text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50"
                >
                  {action === "approve" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Approve
                </button>
                <button
                  onClick={() => setShowReject((s) => !s)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-4 py-2 text-[13px] font-medium text-rose-100 hover:bg-rose-500/25"
                >
                  <XCircle size={13} /> Reject with reason
                </button>
              </div>
            )}

            {showReject && (
              <div className="rounded-2xl border border-white/8 bg-cinema-elev p-4">
                <p className="mb-2 text-[12px] uppercase tracking-[0.08em] text-white/50">
                  Reason (shown to tenant)
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Utility bill is older than 3 months. Please upload a more recent one."
                  className="w-full rounded-lg border border-white/10 bg-cinema-base px-3 py-2 text-[13.5px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={reject}
                    disabled={!rejectReason.trim() || action === "reject"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1.5 text-[12.5px] font-medium text-rose-100 hover:bg-rose-500/30 disabled:opacity-50"
                  >
                    {action === "reject" ? <Loader2 size={12} className="animate-spin" /> : null} Confirm rejection
                  </button>
                  <button
                    onClick={() => {
                      setShowReject(false);
                      setRejectReason("");
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-[12.5px] text-white/70 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, paymentsEnabled }: { status: string; paymentsEnabled: boolean }) {
  const cls =
    status === "approved" && paymentsEnabled
      ? "bg-emerald-500/15 text-emerald-200"
      : status === "approved"
        ? "bg-amber-500/15 text-amber-200"
        : status === "under_review"
          ? "bg-amber-500/15 text-amber-200"
          : status === "rejected"
            ? "bg-rose-500/15 text-rose-200"
            : "bg-white/8 text-white/70";
  const label = status === "approved" && !paymentsEnabled ? "approved · bank pending" : status;
  return <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] ${cls}`}>{label}</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
      <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-white/50">{title}</p>
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

function DocRow({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] items-center gap-4 py-2.5 text-[13.5px]">
      <span className="text-white/55">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary-light hover:underline"
        >
          Open document <ExternalLink size={11} />
        </a>
      ) : (
        <span className="text-rose-300">Missing</span>
      )}
    </div>
  );
}
