"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, RefreshCcw, ShieldCheck } from "lucide-react";

/** Top nav shared across every /admin/* page. Keeps the visual identity
 *  (dark, chromeless, "Conddo Studio" mark) consistent while giving the
 *  admin a way to jump between the overview, sites queue, and tenants. */
export function StudioNav({
  onRefresh,
  onSignOut,
}: {
  onRefresh?: () => void;
  onSignOut?: () => void;
}) {
  const path = usePathname();
  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
              <ShieldCheck size={17} />
            </span>
            <div>
              <h1 className="text-[15px] font-semibold text-white">Conddo Studio</h1>
              <p className="text-[11px] text-white/45">Platform administration</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavTab href="/admin/dashboard" label="Overview" active={path === "/admin/dashboard" || path === "/admin"} />
            <NavTab href="/admin/tenants" label="Tenants" active={path?.startsWith("/admin/tenants") ?? false} />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/80 hover:bg-white/[0.06]"
              aria-label="Refresh"
            >
              <RefreshCcw size={13} /> Refresh
            </button>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/80 hover:bg-white/[0.06]"
            >
              <LogOut size={13} /> Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NavTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-white/[0.06] text-white"
          : "text-white/55 hover:text-white/85 hover:bg-white/[0.03]"
      }`}
    >
      {label}
    </Link>
  );
}
