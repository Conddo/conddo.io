"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Moon, Sun, X, LogOut, type LucideIcon } from "lucide-react";
import { getAccessToken } from "@/lib/api/auth";
import { refreshAccessToken } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTheme } from "@/components/app/ThemeProvider";
import { logout, meQuery } from "@/lib/api/account";
import { landingPathFor, roleDefFor } from "@/lib/api/staff";

export type WorkNavItem = { label: string; href: string; icon: LucideIcon };

/** Lean app shell for staff users — cinematic dark variant. Mirrors
 *  AppShell's structure (desktop permanent sidebar, mobile drawer, auth
 *  guard, cinema-base html background on mount) but renders a much shorter
 *  nav scoped to a single role so a Cashier / Pharmacist / Stock Manager
 *  / Bookkeeper isn't tempted to wander into admin-only surfaces.
 *
 *  Cross-shell guards mirror AppShell:
 *    - TENANT_ADMIN landing in /work → /dashboard
 *    - STAFF landing in /dashboard   → /work (set in AppShell)
 *    - /work (no suffix)             → role-specific landing */
export function WorkShell({
  title,
  subtitle,
  actions,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  nav: WorkNavItem[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { data: me } = useApiQuery(meQuery);
  const { mode, toggle: toggleTheme } = useTheme();

  // Cinema-base html background while inside the staff shell.
  // Switches to light bg in light mode.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = mode === "light" ? "#f8f8f6" : "#0a0a0c";
    return () => {
      html.style.backgroundColor = prev;
    };
  }, [mode]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (getAccessToken()) { if (active) setAuthed(true); return; }
      const recovered = await refreshAccessToken();
      if (!active) return;
      if (recovered) setAuthed(true);
      else { setAuthed(false); router.replace("/login"); }
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!me) return;
    if (me.user.role === "TENANT_ADMIN" || me.user.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [me, router]);

  useEffect(() => {
    if (!me) return;
    if (pathname === "/work") {
      router.replace(landingPathFor(me.user.staffRole));
    }
  }, [me, pathname, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (authed !== true) {
    return <div className="min-h-screen bg-cinema-base" />;
  }

  const roleDef = roleDefFor(me?.user.staffRole);
  const tenantName = me?.tenant.name ?? "Workspace";
  const userName = me?.user.fullName ?? me?.user.email ?? "Staff";
  const initials = me?.user.initials ?? "?";

  const themeClass = mode === "light" ? "theme-light" : "theme-dark";

  return (
    <div className={`app-shell min-h-screen bg-cinema-base text-white ${themeClass}`}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/[0.06] bg-cinema-elev lg:block">
        <SidebarBody
          pathname={pathname}
          nav={nav}
          tenantName={tenantName}
          userName={userName}
          initials={initials}
          roleLabel={roleDef.label}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
          currentMode={mode}
        />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[15rem] max-w-[82%] border-r border-white/[0.08] bg-cinema-elev">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white"
            >
              <X size={16} />
            </button>
            <SidebarBody
              pathname={pathname}
              nav={nav}
              tenantName={tenantName}
              userName={userName}
              initials={initials}
              roleLabel={roleDef.label}
              onLogout={handleLogout}
              onToggleTheme={toggleTheme}
              currentMode={mode}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-cinema-base/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-medium tracking-tighter text-white sm:text-[20px]">{title}</h1>
              {subtitle && <p className="truncate text-[12.5px] text-white/55">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={mode === "dark" ? "Light mode" : "Dark mode"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {actions}
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarBody({
  pathname,
  nav,
  tenantName,
  userName,
  initials,
  roleLabel,
  onLogout,
  onToggleTheme,
  currentMode,
}: {
  pathname: string;
  nav: WorkNavItem[];
  tenantName: string;
  userName: string;
  initials: string;
  roleLabel: string;
  onLogout: () => void;
  onToggleTheme: () => void;
  currentMode: "dark" | "light";
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Tenant header */}
      <div className="border-b border-white/[0.06] px-4 py-5">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-loose text-white/45">Workspace</p>
        <p className="mt-1 truncate text-[14px] font-medium text-white">{tenantName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                    active
                      ? "bg-white/[0.06] font-medium text-white"
                      : "text-white/65 hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary-light"
                    />
                  )}
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.25 : 1.85}
                    className={active ? "text-primary-light" : "text-white/55 group-hover:text-white/85"}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme toggle */}
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={currentMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex w-full items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[12.5px] text-white/60 transition-colors hover:border-primary/25 hover:bg-primary/[0.05] hover:text-white"
        >
          {currentMode === "dark" ? (
            <Sun size={14} className="text-white/45" strokeWidth={1.85} />
          ) : (
            <Moon size={14} className="text-white/45" strokeWidth={1.85} />
          )}
          {currentMode === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>

      {/* User strip */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/25 font-mono text-[11.5px] font-semibold text-primary-light">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">{userName}</p>
            <p className="truncate text-[11px] text-white/45">{roleLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[12px] font-medium text-white/65 transition-colors hover:border-rose-400/30 hover:bg-rose-500/[0.06] hover:text-rose-200"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );
}
