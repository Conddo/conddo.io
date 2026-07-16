"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
} from "lucide-react";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type CreatedTenant,
} from "@/lib/api/admin";
import { StudioNav } from "@/components/admin/StudioNav";

/** studio.getconddo.com/tenants/new — admin creates a tenant on behalf of
 *  a customer. Returns an invite URL the admin can paste into an email or
 *  Slack message; the owner uses it to set their own password (the admin
 *  never sees a plaintext credential). */
export default function CreateTenantPage() {
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
  return <CreateForm onSignOut={() => { clearAdminToken(); router.replace("/admin/dashboard"); }} />;
}

function CreateForm({ onSignOut }: { onSignOut: () => void }) {
  const [businessName, setBusinessName] = useState("");
  const [verticalId, setVerticalId] = useState("general");
  const [planId, setPlanId] = useState("starter");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTenant | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await adminApi.createTenant({
        businessName: businessName.trim(),
        verticalId,
        planId,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerFullName: ownerFullName.trim(),
      });
      setCreated(result);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't create tenant");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div>
        <StudioNav onSignOut={onSignOut} />
        <div className="mx-auto max-w-2xl px-6 py-8">
          <SuccessCard tenant={created} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <StudioNav onSignOut={onSignOut} />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/admin/tenants"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
        >
          <ArrowLeft size={13} /> Tenants
        </Link>
        <h1 className="text-[22px] font-semibold text-white">Create a tenant</h1>
        <p className="mt-1 text-[13.5px] text-white/60">
          Provisions the workspace with an invite link. The owner sets their own
          password before their first sign-in.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-white/[0.06] bg-[#111114] p-6"
        >
          <Field label="Business name" required>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Flagscale PR"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Vertical" required>
              <select
                required
                value={verticalId}
                onChange={(e) => setVerticalId(e.target.value)}
                className={inputCls}
              >
                {VERTICALS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-black">
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Plan" required>
              <select
                required
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className={inputCls}
              >
                {PLANS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-black">
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Owner full name" required>
            <input
              type="text"
              required
              value={ownerFullName}
              onChange={(e) => setOwnerFullName(e.target.value)}
              placeholder="Ada Lovelace"
              className={inputCls}
            />
          </Field>

          <Field label="Owner email" required>
            <input
              type="email"
              required
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="ada@example.com"
              className={inputCls}
            />
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] p-3 text-[13px] text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/admin/tenants"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-white/75 hover:bg-white/[0.06]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              Create tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuccessCard({ tenant }: { tenant: CreatedTenant }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(tenant.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — user can select manually */
    }
  }
  return (
    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.05] p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
          <Check size={18} />
        </span>
        <div>
          <h2 className="text-[16px] font-semibold text-white">Tenant created</h2>
          <p className="text-[13px] text-white/60">
            <span className="font-medium text-white">{tenant.name}</span>{" "}
            <span className="font-mono text-white/45">@{tenant.slug}</span>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[12px] font-medium uppercase tracking-wide text-white/60">
          Invite URL — send to the owner
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 p-2.5">
          <code className="flex-1 truncate font-mono text-[12px] text-white/85">
            {tenant.inviteUrl}
          </code>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 text-[12px] font-medium text-white/85 hover:bg-white/[0.1]"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-[11.5px] text-white/45">
          Link expires in 7 days. The owner clicks it to set their password.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Link
          href="/admin/tenants"
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[13px] text-white/75 hover:bg-white/[0.06]"
        >
          Back to tenants
        </Link>
        <Link
          href={`/admin/tenants/${tenant.tenantId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-medium text-white hover:bg-primary/90"
        >
          Open tenant
        </Link>
      </div>
    </div>
  );
}

// ---- shared field helpers ------------------------------------------------

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[13.5px] text-white outline-none placeholder:text-white/30 focus:border-primary/50";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-white/70">
        {label}
        {required && <span className="ml-0.5 text-rose-300">*</span>}
      </span>
      {children}
    </label>
  );
}

// The BE loads verticals from classpath:verticals/*.yml — this list mirrors
// the six vertical ids in the current build. Keep in sync when adding a new
// vertical file server-side.
const VERTICALS = [
  { id: "general", label: "General business" },
  { id: "fashion", label: "Fashion & tailoring" },
  { id: "food-and-beverage", label: "Food & beverage" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "real-estate", label: "Real estate" },
  { id: "professional-services", label: "Professional services" },
  { id: "retail", label: "Retail" },
  { id: "logistics", label: "Logistics" },
  { id: "music-studio", label: "Music studio" },
  { id: "beauty-and-wellness", label: "Beauty & wellness" },
];

// Pricing v2 (V67). Keep the DB seed and this list aligned.
const PLANS = [
  { id: "free", label: "Free" },
  { id: "student", label: "Student" },
  { id: "starter", label: "Starter" },
  { id: "growth", label: "Growth" },
  { id: "pro", label: "Pro" },
];
