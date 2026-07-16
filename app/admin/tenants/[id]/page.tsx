"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail,
  PowerOff,
  Check,
  Users,
  ShoppingCart,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type TenantDetail,
} from "@/lib/api/admin";
import { StudioNav } from "@/components/admin/StudioNav";

/** studio.getconddo.com/tenants/[id] — full per-tenant snapshot + admin
 *  actions (trigger password reset, deactivate). Shows owner identity,
 *  credit balance, sites, and top-line usage counts. */
export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
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
      id={params.id}
      onSignOut={() => {
        clearAdminToken();
        router.replace("/admin/dashboard");
      }}
    />
  );
}

function Body({ id, onSignOut }: { id: string; onSignOut: () => void }) {
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<"reset" | "deactivate" | null>(null);
  const [flash, setFlash] = useState<{ tone: "ok" | "err"; msg: string } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setDetail(await adminApi.tenant(id));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load tenant");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function triggerReset() {
    if (action) return;
    setAction("reset");
    setFlash(null);
    try {
      const res = await adminApi.resetTenantPassword(id);
      setFlash({
        tone: res.sent ? "ok" : "err",
        msg: res.sent
          ? "Password reset email sent to the owner."
          : "Could not send — this tenant has no owner user.",
      });
    } catch (err) {
      setFlash({
        tone: "err",
        msg: err instanceof AdminApiError ? err.message : "Reset failed",
      });
    } finally {
      setAction(null);
    }
  }

  async function deactivate() {
    if (action) return;
    if (!window.confirm("Deactivate this tenant? Users will lose access.")) return;
    setAction("deactivate");
    setFlash(null);
    try {
      await adminApi.deactivateTenant(id);
      setFlash({ tone: "ok", msg: "Tenant deactivated." });
      await load();
    } catch (err) {
      setFlash({
        tone: "err",
        msg: err instanceof AdminApiError ? err.message : "Deactivate failed",
      });
    } finally {
      setAction(null);
    }
  }

  return (
    <div>
      <StudioNav onRefresh={load} onSignOut={onSignOut} />
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link
          href="/admin/tenants"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
        >
          <ArrowLeft size={13} /> Tenants
        </Link>

        {loading && !detail && (
          <div className="mt-16 flex items-center justify-center text-white/50">
            <Loader2 size={18} className="mr-2 animate-spin" /> Loading tenant…
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-4 text-rose-200">
            <AlertCircle size={16} className="mt-0.5" />
            <div>
              <p className="font-medium">Couldn&apos;t load tenant</p>
              <p className="mt-0.5 text-[13px] text-rose-200/80">{error}</p>
            </div>
          </div>
        )}
        {detail && (
          <>
            <Header row={detail.summary} onReset={triggerReset} onDeactivate={deactivate} action={action} />
            {flash && (
              <div
                className={`mt-4 rounded-xl border p-3 text-[13px] ${
                  flash.tone === "ok"
                    ? "border-emerald-400/25 bg-emerald-500/[0.06] text-emerald-200"
                    : "border-rose-400/25 bg-rose-500/[0.06] text-rose-200"
                }`}
              >
                {flash.msg}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric icon={Users} label="Users" value={detail.usersCount} />
              <Metric icon={ShoppingCart} label="Orders" value={detail.ordersCount} />
              <Metric icon={Globe} label="Sites" value={detail.sites.length} />
              <Metric
                icon={Sparkles}
                label="Credits left"
                value={detail.credits ? detail.credits.available : 0}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <OwnerCard owner={detail.owner} />
              <CreditsCard credits={detail.credits} />
            </div>

            <SitesCard sites={detail.sites} />
          </>
        )}
      </div>
    </div>
  );
}

function Header({
  row,
  onReset,
  onDeactivate,
  action,
}: {
  row: TenantDetail["summary"];
  onReset: () => void;
  onDeactivate: () => void;
  action: "reset" | "deactivate" | null;
}) {
  const isActive = row.status === "ACTIVE";
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-[26px] font-semibold text-white">{row.name}</h1>
          <span className="font-mono text-[13px] text-white/50">@{row.slug}</span>
          {!isActive && (
            <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-rose-200">
              {row.status.toLowerCase()}
            </span>
          )}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-white/50">
          {row.verticalId && <span>{row.verticalId}</span>}
          {row.planId && <span className="uppercase tracking-wide">{row.planId}</span>}
          <span>Created {new Date(row.createdAt).toLocaleDateString()}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={action !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/90 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-primary disabled:opacity-60"
        >
          {action === "reset" ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
          Send password reset
        </button>
        {isActive && (
          <button
            onClick={onDeactivate}
            disabled={action !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] font-medium text-white/85 hover:bg-rose-500/10 hover:border-rose-400/40 hover:text-rose-200 disabled:opacity-60"
          >
            {action === "deactivate" ? <Loader2 size={12} className="animate-spin" /> : <PowerOff size={12} />}
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-4">
      <div className="flex items-center gap-2 text-white/60">
        <Icon size={14} />
        <span className="text-[11.5px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-[24px] font-semibold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function OwnerCard({ owner }: { owner: TenantDetail["owner"] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5">
      <p className="text-[12px] font-medium uppercase tracking-wide text-white/60">Owner</p>
      {!owner ? (
        <p className="mt-3 text-[13px] text-white/50 italic">No owner user attached to this tenant.</p>
      ) : (
        <>
          <p className="mt-2 text-[15px] font-medium text-white">{owner.fullName ?? "(no name)"}</p>
          <p className="mt-0.5 text-[13.5px] text-white/80">{owner.email}</p>
          <ul className="mt-3 space-y-1 font-mono text-[11px] text-white/50">
            <li>
              {owner.emailVerified ? (
                <span className="text-emerald-300">✓ Email verified</span>
              ) : (
                <span className="text-amber-200">Email not verified</span>
              )}
            </li>
            {owner.phone && (
              <li>
                {owner.phoneVerified ? (
                  <span className="text-emerald-300">✓ Phone verified</span>
                ) : (
                  <span className="text-amber-200">Phone not verified</span>
                )}
                <span className="text-white/40"> · {owner.phone}</span>
              </li>
            )}
            {owner.lastLoginAt && (
              <li>Last login {new Date(owner.lastLoginAt).toLocaleString()}</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

function CreditsCard({ credits }: { credits: TenantDetail["credits"] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111114] p-5">
      <p className="text-[12px] font-medium uppercase tracking-wide text-white/60">Credits</p>
      {!credits ? (
        <p className="mt-3 text-[13px] text-white/50 italic">No credit account provisioned.</p>
      ) : (
        <>
          <p className="mt-2 text-[15px] font-medium uppercase tracking-wide text-white">
            {credits.tier}
          </p>
          <p className="mt-0.5 text-[24px] font-semibold text-white">
            {credits.available.toLocaleString()}
            <span className="ml-1.5 text-[13px] font-normal text-white/50">
              / {credits.monthlyQuota.toLocaleString()} available
            </span>
          </p>
          <ul className="mt-3 space-y-1 font-mono text-[11px] text-white/50">
            <li>Used {credits.creditsUsed}</li>
            {credits.reservedCredits > 0 && <li>Reserved {credits.reservedCredits}</li>}
            {credits.topupCredits > 0 && <li>Top-ups {credits.topupCredits}</li>}
          </ul>
        </>
      )}
    </div>
  );
}

function SitesCard({ sites }: { sites: TenantDetail["sites"] }) {
  return (
    <section className="mt-4 rounded-2xl border border-white/[0.06] bg-[#111114] overflow-hidden">
      <header className="border-b border-white/[0.06] px-5 py-3.5">
        <h2 className="text-[14px] font-medium text-white">Sites</h2>
      </header>
      {sites.length === 0 ? (
        <p className="px-5 py-6 text-[13px] text-white/45">No sites yet.</p>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {sites.map((s) => {
            const label = s.customDomain ?? (s.subdomain ? `${s.subdomain}.getconddo.com` : "(no url)");
            return (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] text-white">{label}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-white/45">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusPill active={s.active} qa={s.qaApproved} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StatusPill({ active, qa }: { active: boolean; qa: boolean }) {
  const label = active ? "Live" : qa ? "Approved" : "Pending";
  const tone = active
    ? "bg-emerald-500/15 text-emerald-300"
    : qa
      ? "bg-primary/15 text-primary-light"
      : "bg-amber-500/15 text-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${tone}`}>
      {active && <Check size={10} />}
      {label}
    </span>
  );
}
