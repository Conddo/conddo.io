"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import { StudioNav } from "@/components/admin/StudioNav";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type AdminKycRow,
} from "@/lib/api/admin";

/** /admin/kyc — SUPER_ADMIN queue of tenants awaiting KYC review. */
export default function AdminKycQueuePage() {
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
      onSignOut={() => {
        clearAdminToken();
        router.replace("/admin/dashboard");
      }}
    />
  );
}

function Body({ onSignOut }: { onSignOut: () => void }) {
  const [rows, setRows] = useState<AdminKycRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await adminApi.kycPending();
      setRows(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load queue.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-cinema-base text-white">
      <StudioNav onRefresh={load} onSignOut={onSignOut} />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2 className="text-[20px] font-semibold text-white">KYC review queue</h2>
            <p className="text-[13px] text-white/60">
              Tenants awaiting approval to accept live customer payments. Approve to enable payments; reject to
              request changes.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4 text-[13.5px] text-rose-200">
            <AlertCircle size={14} className="mr-1 inline" /> {error}
          </div>
        )}

        {rows === null ? (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 size={16} className="animate-spin" /> Loading queue…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-cinema-elev p-10 text-center">
            <p className="text-[15px] text-white/85">The queue is clear.</p>
            <p className="mt-1 text-[13px] text-white/55">
              Tenant submissions land here for review.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/8">
            <table className="w-full text-[13.5px]">
              <thead className="bg-white/[0.03] text-left text-[11.5px] uppercase tracking-[0.06em] text-white/50">
                <tr>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.tenantId} className="border-t border-white/[0.05]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px] text-white/75">{r.tenantId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-white/75">
                      {r.bankName ? (
                        <>
                          {r.bankName} <span className="text-white/45">·</span>{" "}
                          {r.accountNumber?.slice(-4).padStart(10, "•")}
                        </>
                      ) : (
                        <span className="text-amber-300">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      <Clock size={12} className="mr-1 inline" />
                      {r.kycSubmittedAt ? new Date(r.kycSubmittedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/kyc/${r.tenantId}`}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 px-3 py-1.5 text-[12.5px] text-white/85 hover:bg-white/[0.05]"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
