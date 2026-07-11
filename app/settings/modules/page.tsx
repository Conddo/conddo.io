"use client";

import { useMemo, useState } from "react";
import {
  Globe, Users, ShoppingCart, CalendarDays, Package, Wallet, Megaphone,
  BarChart3, IdCard, Pill, ClipboardList, ReceiptText, ScanLine, Music2,
  Scissors, Sparkles, ShoppingBag, Tag, Folder, Layers,
  LayoutGrid, AlertCircle, Loader2, type LucideIcon,
} from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { resetManifests } from "@/hooks/useManifests";
import { tenantModulesApi, type ModuleState } from "@/lib/api/tenantModules";
import { ApiError } from "@/lib/api/client";

/** /settings/modules — per-tenant module opt-in surface.
 *
 *  Owner-only (BE gates with @staffAccess.ownerOnly()). Shows every
 *  known module across every vertical with the tenant's current state,
 *  grouped by the dotted-id family (commerce / customers / inventory
 *  / marketing / etc.). Toggle flips the state via POST enable/disable;
 *  changes take effect on the user's next login per the BE spec, which
 *  we surface as a banner above the grid. */
export default function ModulesSettingsPage() {
  return (
    <SettingsShell
      active="modules"
      title="Modules"
      description="Turn modules on or off for your workspace. Changes take effect the next time you sign in."
    >
      <ModulesBody />
    </SettingsShell>
  );
}

function ModulesBody() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApiQuery(tenantModulesApi.list);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const grouped = useMemo(() => groupModules(data ?? []), [data]);

  async function toggle(state: ModuleState) {
    if (updatingId) return;
    setUpdatingId(state.id);
    try {
      if (state.enabled) {
        await tenantModulesApi.disable(state.id);
      } else {
        await tenantModulesApi.enable(state.id);
      }
      // Invalidate the sidebar's cached manifests so it re-fetches the live
      // effective set — no more "sign out and back in" copy needed.
      resetManifests();
      await refetch();
      toast.success(
        state.enabled ? "Module turned off" : "Module turned on",
        "The sidebar updates immediately.",
      );
    } catch (err) {
      toast.error(
        "Couldn't update module",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-cinema-elev p-12 text-white/55">
        <Loader2 size={20} className="mr-2 animate-spin" />
        Loading modules…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-6 text-rose-200">
        <p className="font-medium">Couldn&apos;t load modules</p>
        <p className="mt-1 text-[14px] text-rose-200/85">
          {error.message ?? "Please try again."}
        </p>
        <button
          onClick={refetch}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-[13px] font-medium text-rose-100 hover:bg-rose-500/20"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <section
          key={group.key}
          className="rounded-2xl border border-white/[0.06] bg-cinema-elev overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <h3 className="text-[15px] font-medium text-white">{group.label}</h3>
              <p className="mt-0.5 text-[12.5px] text-white/55">{group.description}</p>
            </div>
            <span className="font-mono text-[10.5px] uppercase tracking-loose text-white/40">
              {group.items.filter((m) => m.enabled).length}/{group.items.length} on
            </span>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {group.items.map((m) => (
              <li key={m.id}>
                <ModuleRow
                  state={m}
                  busy={updatingId === m.id}
                  onToggle={() => toggle(m)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ModuleRow({
  state,
  busy,
  onToggle,
}: {
  state: ModuleState;
  busy: boolean;
  onToggle: () => void;
}) {
  const meta = moduleMeta(state.id);
  const Icon = meta.icon;
  const isOverride = state.source === "tenant_choice";
  const overrideHint =
    isOverride && state.enabled !== state.inVerticalDefault
      ? state.enabled
        ? "Added to your workspace"
        : "Removed from your workspace"
      : null;

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-primary-light">
        <Icon size={17} strokeWidth={1.85} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14.5px] font-medium text-white">{meta.label}</p>
          {overrideHint && (
            <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-loose text-primary-light">
              {overrideHint}
            </span>
          )}
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-white/40">{state.id}</p>
      </div>
      <Toggle on={state.enabled} busy={busy} onClick={onToggle} />
    </div>
  );
}

function Toggle({ on, busy, onClick }: { on: boolean; busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${
        on
          ? "border-primary/30 bg-primary"
          : "border-white/15 bg-white/[0.04]"
      }`}
    >
      <span
        className={`absolute inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      >
        {busy && <Loader2 size={10} className="animate-spin text-primary" />}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Module taxonomy — labels, icons, grouping derived from the dotted id.   */
/* ---------------------------------------------------------------------- */

type ModuleMeta = { label: string; icon: LucideIcon };

const BASE_ICON: Record<string, LucideIcon> = {
  website: Globe,
  customers: Users,
  crm: Users,
  pos: ScanLine,
  inventory: Package,
  prescriptions: Pill,
  consultations: ClipboardList,
  payments: Wallet,
  analytics: BarChart3,
  staff: IdCard,
  marketing: Megaphone,
  orders: ShoppingCart,
  bookings: CalendarDays,
  fittings: Scissors,
  fabric: Layers,
  sessions: Music2,
  loyalty: Sparkles,
  discounts: Tag,
  refill: AlertCircle,
  followup: ClipboardList,
  documents: Folder,
  store: ShoppingBag,
  receipts: ReceiptText,
};

const VERTICAL_SUFFIX_LABEL: Record<string, string> = {
  pharmacy: "for Pharmacy",
  fashion: "for Fashion",
  retail: "for Retail",
  hospitality: "for Hospitality",
  studio: "for Studios",
};

const HEAD_LABEL: Record<string, string> = {
  website: "Website",
  customers: "Customers",
  crm: "Customers",
  pos: "Point of Sale",
  inventory: "Inventory",
  prescriptions: "Prescriptions",
  consultations: "Consultations",
  payments: "Payments",
  analytics: "Analytics",
  staff: "Staff",
  marketing: "Marketing",
  orders: "Orders",
  bookings: "Bookings",
  fittings: "Fittings",
  fabric: "Fabric tracking",
  sessions: "Sessions",
  loyalty: "Loyalty",
  discounts: "Discounts",
  refill: "Refill offers",
  followup: "Follow-ups",
  documents: "Documents",
  store: "Storefront",
};

const MARKETING_SUFFIX_LABEL: Record<string, string> = {
  social: "Marketing — Social",
  email:  "Marketing — Email",
  sms:    "Marketing — SMS",
  ads:    "Marketing — Ads",
};

function moduleMeta(id: string): ModuleMeta {
  const [head, suffix] = id.split(".") as [string, string | undefined];
  // Marketing sub-modules get their own label so they read distinctly.
  if (head === "marketing" && suffix && MARKETING_SUFFIX_LABEL[suffix]) {
    return { label: MARKETING_SUFFIX_LABEL[suffix], icon: Megaphone };
  }
  const baseLabel = HEAD_LABEL[head] ?? prettify(head);
  const verticalLabel = suffix ? VERTICAL_SUFFIX_LABEL[suffix] : undefined;
  const label = verticalLabel ? `${baseLabel} ${verticalLabel}` : baseLabel;
  const icon = BASE_ICON[head] ?? LayoutGrid;
  return { label, icon };
}

function prettify(s: string) {
  return s.replace(/[._-]/g, " ").replace(/(^| )./g, (m) => m.toUpperCase());
}

/* ---------------------------------------------------------------------- */
/* Grouping — by functional area, not dotted prefix, so the UI reads in    */
/* the order an owner thinks about their business.                         */
/* ---------------------------------------------------------------------- */

type Group = {
  key: string;
  label: string;
  description: string;
  match: (id: string) => boolean;
};

const GROUPS: Group[] = [
  {
    key: "commerce",
    label: "Storefront & Sales",
    description: "Your website, online ordering, and walk-in point-of-sale.",
    match: (id) => /^(website|store|pos|orders)/.test(id),
  },
  {
    key: "customers",
    label: "Customers",
    description: "CRM, customer profiles, bookings, and clinical records.",
    match: (id) => /^(customers|crm|bookings|consultations|prescriptions)/.test(id),
  },
  {
    key: "operations",
    label: "Operations",
    description: "Inventory, fittings, sessions, fabrics, and fulfilment.",
    match: (id) => /^(inventory|fittings|fabric|sessions|documents|followup|refill)/.test(id),
  },
  {
    key: "money",
    label: "Money",
    description: "Payments, receipts, and revenue analytics.",
    match: (id) => /^(payments|receipts|analytics)/.test(id),
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Campaigns, loyalty, discounts, ads, and engagement.",
    match: (id) => /^(marketing|loyalty|discounts)/.test(id),
  },
  {
    key: "team",
    label: "Team",
    description: "Staff accounts and role-based access.",
    match: (id) => /^staff/.test(id),
  },
];

function groupModules(items: ModuleState[]) {
  const buckets = GROUPS.map((g) => ({ ...g, items: [] as ModuleState[] }));
  const other = { key: "other", label: "Other", description: "", items: [] as ModuleState[] };

  for (const m of items) {
    const bucket = buckets.find((b) => b.match(m.id));
    if (bucket) bucket.items.push(m);
    else other.items.push(m);
  }

  // Sort each bucket: enabled-then-default first, then by id.
  const sorted = [...buckets, ...(other.items.length > 0 ? [other] : [])]
    .map((g) => ({
      ...g,
      items: g.items.slice().sort((a, b) => {
        if (a.inVerticalDefault !== b.inVerticalDefault) return a.inVerticalDefault ? -1 : 1;
        return a.id.localeCompare(b.id);
      }),
    }))
    .filter((g) => g.items.length > 0);

  return sorted;
}
