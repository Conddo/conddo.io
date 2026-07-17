import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building2,
  Bell,
  CreditCard,
  IdCard,
  Link2,
  LayoutGrid,
  MessageSquare,
  Palette,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";

type SettingsKey = "profile" | "brand" | "billing" | "notifications" | "connections" | "modules" | "staff" | "support" | "api-keys" | "danger";

// Settings entries are only listed once the backend endpoints behind them
// exist. Connected Accounts / API Keys stay hidden until those modules ship
// (page files still exist for direct-link access but show empty/disabled
// states). Billing now ships with the pricing-tiers work so it's back in
// the nav; the page degrades to "Billing is being set up" via QueryBoundary
// when the BE hasn't deployed.
const NAV: { key: SettingsKey; label: string; icon: LucideIcon; href: string }[] = [
  { key: "profile", label: "Business Profile", icon: Building2, href: "/settings" },
  { key: "brand", label: "Brand", icon: Palette, href: "/settings/brand" },
  { key: "modules", label: "Modules", icon: LayoutGrid, href: "/settings/modules" },
  { key: "billing", label: "Subscription and Billing", icon: CreditCard, href: "/settings/billing" },
  { key: "connections", label: "Connected Accounts", icon: Link2, href: "/settings/connections" },
  { key: "notifications", label: "Notifications", icon: Bell, href: "/settings/notifications" },
  { key: "staff", label: "Staff and Permissions", icon: IdCard, href: "/staff" },
  { key: "support", label: "Support and Requests", icon: MessageSquare, href: "/settings/support" },
];

/** Settings layout: the standard app shell + the settings sub-navigation, shared by
 *  every settings sub-section so they stay consistent and deep-linkable. */
export function SettingsShell({
  active,
  title,
  description,
  children,
}: {
  active: SettingsKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <AppShell title="Settings">
      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="shrink-0 md:w-56">
          <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.05em] text-white/45">Management</p>
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                  item.key === active
                    ? "bg-primary/[0.08] font-medium text-primary"
                    : "text-white/65 hover:bg-white/[0.02] hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-neutral-border" />
            <Link
              href="/settings/danger"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                active === "danger" ? "bg-rose-500/[0.06] font-medium text-rose-200" : "text-rose-200 hover:bg-rose-500/[0.06]"
              }`}
            >
              <TriangleAlert size={18} />
              Danger Zone
            </Link>
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl flex-1">
          <div className="mb-6">
            <h2 className="text-[22px] font-medium tracking-[-0.01em] text-white">{title}</h2>
            <p className="mt-1 text-[15px] text-white/65">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </AppShell>
  );
}
