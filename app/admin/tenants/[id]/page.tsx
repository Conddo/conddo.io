"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Mail,
  PowerOff,
  Check,
  Users,
  ShoppingCart,
  Globe,
  Sparkles,
  Trash2,
  RotateCcw,
  KeyRound,
  Copy,
} from "lucide-react";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type AdminModuleRow,
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
  const router = useRouter();
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<"reset" | "setPassword" | "deactivate" | "delete" | "restore" | null>(null);
  const [flash, setFlash] = useState<{ tone: "ok" | "err"; msg: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  /** One-shot reveal of an admin-issued password. Cleared when the admin
   *  dismisses the modal — no second look, no back button. */
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);

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

  async function setPassword() {
    if (action) return;
    if (
      !window.confirm(
        "Generate a new password for this tenant's owner? Their live sessions will be terminated. The password is shown ONCE — copy it before dismissing.",
      )
    )
      return;
    setAction("setPassword");
    setFlash(null);
    try {
      const res = await adminApi.setTenantPassword(id);
      setRevealedPassword(res.password);
    } catch (err) {
      setFlash({
        tone: "err",
        msg: err instanceof AdminApiError ? err.message : "Set password failed",
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

  async function softDelete(confirmSlug: string) {
    if (action) return;
    setAction("delete");
    setFlash(null);
    try {
      await adminApi.softDeleteTenant(id, confirmSlug);
      // Bounce out — the deleted tenant is now hidden from the list.
      router.push("/admin/tenants");
    } catch (err) {
      setFlash({
        tone: "err",
        msg: err instanceof AdminApiError ? err.message : "Delete failed",
      });
      setAction(null);
    }
  }

  async function restore() {
    if (action) return;
    setAction("restore");
    setFlash(null);
    try {
      await adminApi.restoreTenant(id);
      setFlash({ tone: "ok", msg: "Tenant restored." });
      await load();
    } catch (err) {
      setFlash({
        tone: "err",
        msg: err instanceof AdminApiError ? err.message : "Restore failed",
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
            <Header
              row={detail.summary}
              onReset={triggerReset}
              onSetPassword={setPassword}
              onDeactivate={deactivate}
              action={action}
            />
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

            <MaintenancePanel tenantId={id} />
            <ModulesPanel tenantId={id} />

            <DangerZone
              tenantName={detail.summary.name}
              tenantSlug={detail.summary.slug}
              deleted={detail.summary.deletedAt != null}
              onDeleteClick={() => setDeleteOpen(true)}
              onRestore={restore}
              action={action}
            />
          </>
        )}
      </div>

      {revealedPassword && detail && (
        <RevealedPasswordModal
          password={revealedPassword}
          ownerEmail={detail.owner?.email ?? null}
          onDismiss={() => setRevealedPassword(null)}
        />
      )}

      {deleteOpen && detail && (
        <DeleteConfirmModal
          tenantName={detail.summary.name}
          tenantSlug={detail.summary.slug}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={async (typedSlug) => {
            setDeleteOpen(false);
            await softDelete(typedSlug);
          }}
        />
      )}
    </div>
  );
}

function Header({
  row,
  onReset,
  onSetPassword,
  onDeactivate,
  action,
}: {
  row: TenantDetail["summary"];
  onReset: () => void;
  onSetPassword: () => void;
  onDeactivate: () => void;
  action: "reset" | "setPassword" | "deactivate" | "delete" | "restore" | null;
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
          Send reset email
        </button>
        <button
          onClick={onSetPassword}
          disabled={action !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-white/90 hover:bg-white/[0.08] disabled:opacity-60"
          title="Generate a new password and reveal it once"
        >
          {action === "setPassword" ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
          Set new password
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

/* ------------------------------------------------------------------- */
/* Danger zone + delete confirmation                                     */
/* ------------------------------------------------------------------- */

function DangerZone({
  tenantName,
  tenantSlug,
  deleted,
  onDeleteClick,
  onRestore,
  action,
}: {
  tenantName: string;
  tenantSlug: string;
  deleted: boolean;
  onDeleteClick: () => void;
  onRestore: () => void;
  action: "reset" | "setPassword" | "deactivate" | "delete" | "restore" | null;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/[0.04] p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-rose-200/80">
        Danger zone
      </p>
      {deleted ? (
        <>
          <p className="mt-2 text-[14px] text-white">
            <span className="font-medium">{tenantName}</span> is currently
            deleted. Data is intact and the tenant can be restored.
          </p>
          <button
            onClick={onRestore}
            disabled={action !== null}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-500/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-emerald-200 hover:bg-emerald-500/[0.10] disabled:opacity-60"
          >
            {action === "restore" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RotateCcw size={12} />
            )}
            Restore tenant
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-[14px] leading-relaxed text-white/80">
            Delete <span className="font-medium text-white">{tenantName}</span>{" "}
            (<span className="font-mono text-white/60">@{tenantSlug}</span>) from
            the platform. This is a soft delete — the tenant is hidden from
            all admin lists, sign-in is refused, and their site goes offline.
            Data is preserved; a platform admin can restore later.
          </p>
          <button
            onClick={onDeleteClick}
            disabled={action !== null}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/[0.10] px-3 py-1.5 text-[12.5px] font-medium text-rose-200 hover:bg-rose-500/[0.16] disabled:opacity-60"
          >
            {action === "delete" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Delete tenant
          </button>
        </>
      )}
    </section>
  );
}

function DeleteConfirmModal({
  tenantName,
  tenantSlug,
  onCancel,
  onConfirm,
}: {
  tenantName: string;
  tenantSlug: string;
  onCancel: () => void;
  onConfirm: (typedSlug: string) => void | Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === tenantSlug;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!matches) return;
    void onConfirm(typed.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm tenant deletion"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-rose-400/25 bg-[#111114] p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-semibold text-white">
              Delete {tenantName}?
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-white/65">
              This tenant will be hidden from admin lists, their users
              will be locked out, and the public site at{" "}
              <span className="font-mono text-white/80">
                {tenantSlug}.getconddo.com
              </span>{" "}
              will go offline. Data is preserved and a platform admin can
              restore it.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-white/70">
              Type <span className="font-mono text-white">{tenantSlug}</span> to confirm
            </span>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              placeholder={tenantSlug}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[13.5px] text-white outline-none placeholder:text-white/25 focus:border-rose-400/50"
            />
          </label>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-white/75 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!matches}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-rose-500/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={13} />
              Delete tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----- Maintenance: reset sessions + purge seed --------------------------

function MaintenancePanel({ tenantId }: { tenantId: string }) {
  const [busy, setBusy] = useState<"reset" | "purge" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function reset() {
    setBusy("reset");
    setErr(null);
    setMsg(null);
    try {
      const r = await adminApi.resetTenantSessions(tenantId);
      setMsg(
        r.refreshTokensDeleted === 0
          ? "No active sessions to reset."
          : `Invalidated ${r.refreshTokensDeleted} refresh token${r.refreshTokensDeleted === 1 ? "" : "s"}. Users will re-login on next request.`,
      );
    } catch (e) {
      setErr(e instanceof AdminApiError ? e.message : "Reset failed");
    } finally {
      setBusy(null);
    }
  }

  async function purge() {
    if (
      !window.confirm(
        "Delete seed products whose SKUs don't match this tenant's current vertical, and clear any module overrides. Real tenant data (products with non-seed SKUs) is not touched. Continue?",
      )
    )
      return;
    setBusy("purge");
    setErr(null);
    setMsg(null);
    try {
      const r = await adminApi.purgeTenantSeed(tenantId);
      setMsg(
        `Deleted ${r.productsDeleted} seed product${r.productsDeleted === 1 ? "" : "s"} + cleared ${r.overridesCleared} module override${r.overridesCleared === 1 ? "" : "s"}.`,
      );
    } catch (e) {
      setErr(e instanceof AdminApiError ? e.message : "Purge failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-[13px] font-semibold text-white">Session &amp; seed</div>
      <p className="mt-1 text-[12px] text-white/50">
        Use after changing this tenant&apos;s vertical: reset sessions so they get a fresh JWT
        against the new modules, and purge leftover demo rows from the previous vertical.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={reset}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-white/[0.08] disabled:opacity-50"
        >
          {busy === "reset" ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
          Reset sessions
        </button>
        <button
          onClick={purge}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-white/[0.08] disabled:opacity-50"
        >
          {busy === "purge" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Purge seed data
        </button>
      </div>
      {msg && <div className="mt-3 text-[12px] text-emerald-300">{msg}</div>}
      {err && <div className="mt-3 text-[12px] text-rose-300">{err}</div>}
    </div>
  );
}

// ----- Modules: admin add/remove per tenant ------------------------------

function ModulesPanel({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<AdminModuleRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    adminApi
      .tenantModules(tenantId)
      .then((r) => {
        if (alive) setRows(r);
      })
      .catch((e) => {
        if (alive) setErr(e instanceof AdminApiError ? e.message : "Load failed");
      });
    return () => {
      alive = false;
    };
  }, [tenantId]);

  async function toggle(moduleId: string, next: boolean) {
    setPending((p) => new Set(p).add(moduleId));
    try {
      const updated = await adminApi.setTenantModule(tenantId, moduleId, next);
      setRows((prev) =>
        prev ? prev.map((r) => (r.id === moduleId ? updated : r)) : prev,
      );
    } catch (e) {
      setErr(e instanceof AdminApiError ? e.message : "Update failed");
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(moduleId);
        return n;
      });
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-semibold text-white">Modules</div>
        <div className="text-[11px] text-white/40">
          Vertical default = auto; toggling writes an override.
        </div>
      </div>

      {err && <div className="mt-2 text-[12px] text-rose-300">{err}</div>}

      {!rows && !err && (
        <div className="mt-3 flex items-center gap-2 text-[12px] text-white/40">
          <Loader2 size={12} className="animate-spin" /> Loading modules…
        </div>
      )}

      {rows && (
        <ul className="mt-3 divide-y divide-white/6">
          {rows.map((r) => {
            const isPending = pending.has(r.id);
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="truncate font-mono text-[12px] text-white">{r.id}</div>
                  <div className="text-[11px] text-white/40">
                    {r.source === "tenant_choice" ? "override" : "vertical default"}
                    {r.inVerticalDefault ? " · in preset" : " · outside preset"}
                  </div>
                </div>
                <button
                  onClick={() => toggle(r.id, !r.enabled)}
                  disabled={isPending}
                  className={
                    "inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 " +
                    (r.enabled ? "bg-emerald-500/70" : "bg-white/12")
                  }
                  aria-pressed={r.enabled}
                  aria-label={r.enabled ? `Disable ${r.id}` : `Enable ${r.id}`}
                >
                  <span
                    className={
                      "h-5 w-5 rounded-full bg-white transition " +
                      (r.enabled ? "translate-x-[22px]" : "translate-x-[2px]")
                    }
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ----- One-shot password reveal ------------------------------------------

function RevealedPasswordModal({
  password,
  ownerEmail,
  onDismiss,
}: {
  password: string;
  ownerEmail: string | null;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — admin can still read + type it */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-400/20 bg-cinema-elev p-5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-200">
          <KeyRound size={14} /> New password issued
        </div>
        <p className="mt-2 text-[13px] text-white/70">
          Share this with{" "}
          <span className="text-white">{ownerEmail ?? "the owner"}</span> via a
          secure channel. Their live sessions have been terminated.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/12 bg-black/40 p-3">
          <code className="flex-1 select-all break-all font-mono text-[15px] tracking-wide text-white">
            {password}
          </code>
          <button
            onClick={copy}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/12 bg-white/[0.05] px-2 py-1 text-[12px] text-white/85 hover:bg-white/[0.10]"
            aria-label="Copy password"
          >
            {copied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-3 text-[12px] text-rose-200/90">
          This is the only time you&apos;ll see this password. Once you close this
          dialog it&apos;s unrecoverable — you&apos;ll have to generate another.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/90 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-primary"
          >
            I&apos;ve copied it — close
          </button>
        </div>
      </div>
    </div>
  );
}
