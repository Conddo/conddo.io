"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Plus,
  Rocket,
  Wallet,
  ClipboardList,
  UserPlus,
  Package,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { CreditsWidget } from "@/components/app/CreditsWidget";
import { DashboardFollowupsWidget } from "@/components/app/DashboardFollowupsWidget";
import { DashboardProgramsWidget } from "@/components/app/DashboardProgramsWidget";
import { verticalOf } from "@/lib/verticalCopy";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useActiveModulePaths, isPathAllowed } from "@/hooks/useModuleAccess";
import { naira } from "@/lib/format";
import { tenantWorkspaceUrl } from "@/lib/brand";
import { dashboardApi, type Summary, type Tone } from "@/lib/api/dashboard";
import { ordersApi } from "@/lib/api/orders";
import { bookingsApi } from "@/lib/api/bookings";
import { websiteApi } from "@/lib/api/website";
import { meQuery } from "@/lib/api/account";

const greetingFor = (hour: number) =>
  hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

// KPI cards: fixed presentation (label/icon/href) + live values from /dashboard/summary.
type StatKey = keyof Summary;

const STAT_META: { key: StatKey; label: string; icon: LucideIcon; href: string; currency?: boolean }[] = [
  { key: "revenueToday", label: "Revenue today", icon: Wallet, href: "/payments", currency: true },
  { key: "pendingOrders", label: "Pending orders", icon: ClipboardList, href: "/orders" },
  { key: "newCustomers", label: "New customers", icon: UserPlus, href: "/customers" },
  { key: "lowStockItems", label: "Low stock items", icon: Package, href: "/inventory" },
];

const deltaColor: Record<Tone, string> = {
  success: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-rose-200",
  neutral: "text-white/45",
};

const stageTone = (stage?: string): "info" | "warning" | "primary" | "success" | "neutral" => {
  const s = (stage ?? "").toLowerCase();
  if (!s) return "neutral";
  if (s.includes("deliver")) return "success";
  if (s.includes("production")) return "warning";
  if (s.includes("ready")) return "primary";
  return "info";
};

const fmtTime = (t: string) => {
  const m = t.match(/(\d{2}):(\d{2})/); // "HH:MM[:SS]" or ISO → HH:MM
  return m ? `${m[1]}:${m[2]}` : t;
};

/** Setup checklist banner. Header collapses to "X of Y steps". Click to
 *  expand: lists each step with a check (done) or a dismiss button
 *  (incomplete — for steps the tenant doesn't plan to do, e.g. staff). */
function SetupNudge({
  checklist,
  onChanged,
}: {
  checklist: import("@/lib/api/dashboard").Checklist;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [dismissingKey, setDismissingKey] = useState<string | null>(null);

  async function dismiss(stepKey: string, label: string) {
    if (!window.confirm(`Hide "${label}" from your setup list?`)) return;
    setDismissingKey(stepKey);
    try {
      await dashboardApi.dismissChecklistStep(stepKey);
      toast.success("Step hidden", "It won't show up on the checklist anymore.");
      onChanged();
    } catch (err) {
      toast.error(
        "Couldn't hide step",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setDismissingKey(null);
    }
  }

  return (
    <div className="mb-6 rounded-lg bg-amber-500/15 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-amber-300">
            <Rocket size={18} />
          </span>
          <div>
            <p className="text-[14px] font-medium text-white">Finish setting up your business</p>
            <p className="text-[13px] text-white/65">
              {checklist.completed} of {checklist.total} steps complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[13px] text-white/65 hover:text-white"
          >
            {expanded ? (<><ChevronUp size={14} /> Hide</>) : (<><ChevronDown size={14} /> Show steps</>)}
          </button>
          <Link href="/settings" className="text-[14px] font-medium text-amber-300 hover:underline">
            Continue setup →
          </Link>
        </div>
      </div>
      {expanded && (
        <ul className="mt-4 space-y-1 border-t border-warning/20 pt-3">
          {checklist.steps.map((step) => (
            <li
              key={step.key}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-amber-500/15"
            >
              <span className="flex items-center gap-2 text-[13px]">
                {step.done ? (
                  <Check size={13} className="text-emerald-300" />
                ) : (
                  <span className="block h-3 w-3 rounded-full border border-content-muted" />
                )}
                <span className={step.done ? "text-white/45 line-through" : "text-white/65"}>
                  {step.label}
                </span>
              </span>
              {!step.done && (
                <button
                  type="button"
                  onClick={() => dismiss(step.key, step.label)}
                  disabled={dismissingKey !== null}
                  aria-label={`Dismiss ${step.label}`}
                  title="Skip this step"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white/45 hover:bg-warning/20 hover:text-amber-300 disabled:opacity-50"
                >
                  {dismissingKey === step.key ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <X size={11} />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary } = useApiQuery(dashboardApi.summary);
  const { data: recentOrders } = useApiQuery(() => ordersApi.listRecent(4));
  const { data: todayBookings } = useApiQuery(bookingsApi.today);
  const { data: website } = useApiQuery(websiteApi.status);
  const { data: me } = useApiQuery(meQuery);
  const { data: checklist, refetch: refetchChecklist } = useApiQuery(dashboardApi.setupChecklist);
  const recent = (recentOrders ?? []).slice(0, 4);
  const todays = todayBookings ?? [];
  const setupDone = checklist ? checklist.completed >= checklist.total : true;

  // Tier/plan accuracy: only surface KPIs, widgets, and actions for modules this
  // tenant's plan includes. `null` (no manifest) → show everything (fallback).
  const modulePaths = useActiveModulePaths();
  const has = (path: string) => modulePaths === null || isPathAllowed(path, modulePaths);
  const showOrders = has("/orders");
  const showWebsite = has("/website");
  const showBookings = has("/bookings");
  const stats = STAT_META.filter((s) => has(s.href));
  const isPharmacy = verticalOf(me) === "pharmacy";

  const now = new Date();
  const firstName = me?.user.fullName?.trim().split(/\s+/)[0] ?? "";
  const greeting = `${greetingFor(now.getHours())}${firstName ? `, ${firstName}` : ""}.`;
  const today = now.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <AppShell
      title={greeting}
      subtitle={today}
      actions={
        showOrders ? (
          <Button href="/orders" variant="primary" size="md">
            <Plus size={17} />
            <span className="hidden sm:inline">New Order</span>
          </Button>
        ) : undefined
      }
    >
      {/* Setup nudge — only while there are steps left */}
      {checklist && !setupDone && (
        <SetupNudge checklist={checklist} onChanged={refetchChecklist} />
      )}

      {/* Stat cards — only those whose module is in the tenant's plan */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ key, label, icon: Icon, href, currency }) => {
          const s = summary?.[key];
          const value = s ? (currency ? naira(s.value) : String(s.value)) : "—";
          const tone: Tone = s?.tone ?? "neutral";
          const inner = (
            <>
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[13px] text-white/65">{label}</p>
                <Icon size={18} className="text-white/45" />
              </div>
              <p className="font-mono text-[24px] font-medium leading-none text-white">{value}</p>
              <p className={`mt-2 text-[12px] ${deltaColor[tone]}`}>{s?.delta ?? " "}</p>
            </>
          );
          const base = "rounded-lg border border-white/[0.06] bg-cinema-elev p-5";
          return (
            <Link key={key} href={href} className={`${base} block transition-colors hover:border-primary hover:bg-white/[0.02]/40`}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* Credits widget — every tenant sees their monthly credit standing
          at all times per the Billing spec. Lives above vertical-specific
          widgets so the ambient awareness is the first thing after the KPIs. */}
      <div className="mb-6">
        <CreditsWidget />
      </div>

      {/* Pharmacy Beta-feature widgets — each self-gates on its feature
          flag, so the grid only takes space when at least one is enabled. */}
      {isPharmacy && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashboardFollowupsWidget />
          <DashboardProgramsWidget />
        </div>
      )}

      {/* Two-column: orders + side cards — each gated by the tenant's plan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        {showOrders && (
        <div className="rounded-lg border border-white/[0.06] bg-cinema-elev lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-[15px] font-medium text-white">Recent Orders</h2>
            <a href="/orders" className="text-[13px] font-medium text-primary hover:underline">
              View all orders
            </a>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[0.05em] text-white/45">
                <th className="whitespace-nowrap px-5 py-2.5 font-medium">Order ID</th>
                <th className="whitespace-nowrap px-5 py-2.5 font-medium">Customer</th>
                <th className="whitespace-nowrap px-5 py-2.5 font-medium">Status</th>
                <th className="whitespace-nowrap px-5 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {recent.length > 0 ? (
                recent.map((o) => (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[13px] text-white/65">{o.id}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-[14px] text-white">{o.customer}</td>
                    <td className="whitespace-nowrap px-5 py-3"><Chip tone={stageTone(o.stage)}>{o.stage ?? "—"}</Chip></td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-mono text-[13px] text-white">{naira(o.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[14px] text-white/65">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        )}

        {/* Side column */}
        {(showWebsite || showBookings) && (
        <div className={`space-y-6 ${showOrders ? "" : "lg:col-span-3"}`}>
          {/* Website status */}
          {showWebsite && (
          <div className="rounded-lg border border-white/[0.06] bg-cinema-elev p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-white">Website Status</h2>
              {website?.subdomain ? <Chip tone="success">● Live</Chip> : <Chip tone="warning">In progress</Chip>}
            </div>
            {website?.subdomain ? (
              <>
                <div className="mb-4 rounded-md bg-white/[0.02] px-3 py-2 font-mono text-[12px] text-white/65">
                  {tenantWorkspaceUrl(website.subdomain)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[20px] font-medium leading-none text-white">{website.visitsToday ?? 0}</p>
                    <p className="mt-1 text-[12px] text-white/45">Visits today</p>
                  </div>
                  <div>
                    <p className="font-mono text-[20px] font-medium leading-none text-white">{website.enquiries ?? 0}</p>
                    <p className="mt-1 text-[12px] text-white/45">New enquiries</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[13px] leading-relaxed text-white/65">
                Your website is being set up. Its status and traffic will appear here once it&apos;s live.
              </p>
            )}
          </div>
          )}

          {/* Today's bookings */}
          {showBookings && (
          <div className="rounded-lg border border-white/[0.06] bg-cinema-elev">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-[15px] font-medium text-white">Today&apos;s Bookings</h2>
            </div>
            {todays.length > 0 ? (
              <ul className="divide-y divide-white/[0.06]">
                {todays.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="shrink-0 rounded-md bg-primary/[0.08] px-2 py-1 font-mono text-[11px] font-medium text-primary">
                      {fmtTime(b.start)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-white">{b.customer}</p>
                      <p className="truncate text-[12px] text-white/45">{b.service}</p>
                    </div>
                    <ChevronRight size={16} className="text-white/45" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-[14px] text-white/65">No bookings today</p>
            )}
            <div className="px-5 py-4">
              <Button href="/bookings" variant="secondary" size="md" className="w-full">
                View calendar
              </Button>
            </div>
          </div>
          )}
        </div>
        )}
      </div>
    </AppShell>
  );
}
