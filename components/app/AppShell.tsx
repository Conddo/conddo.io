"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell, LogOut, Menu, MessageSquare, Search, X } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAppNav } from "@/hooks/useAppNav";
import { useActiveModulePaths, isPathAllowed } from "@/hooks/useModuleAccess";
import type { NavLink } from "@/lib/manifest/types";
import { logout, meQuery, type Me } from "@/lib/api/account";
import { getAccessToken } from "@/lib/api/auth";
import { refreshAccessToken } from "@/lib/api/client";
import { InstallAppButton } from "@/components/app/InstallAppButton";
import { VerifyEmailBanner } from "@/components/app/VerifyEmailBanner";
import { Wordmark } from "@/components/marketing/Wordmark";

type Identity = { businessName: string; userName: string; roleLabel: string; initials: string };

const FALLBACK_IDENTITY: Identity = { businessName: "Your workspace", userName: "Account", roleLabel: "", initials: "?" };

// Sidebar role label — visible under the user's name. TENANT_ADMIN reads as
// "Owner" to make it clear it's THIS workspace's owner, not a platform admin
// (matches Stripe / Linear / Notion / Slack convention). STAFF is plain "Staff
// member" so it doesn't read like internal Conddo staff.
const roleLabel = (role?: string) =>
  role === "TENANT_ADMIN" ? "Owner" :
  role === "STAFF" ? "Staff member" :
  role === "CUSTOMER" ? "Customer" :
  role ?? "";

function deriveIdentity(me: Me | null): Identity {
  if (!me) return FALLBACK_IDENTITY;
  const userName = me.user.fullName?.trim() || me.user.email;
  const initials =
    me.user.initials && me.user.initials !== "?"
      ? me.user.initials
      : (me.user.fullName?.trim()
          ? me.user.fullName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("")
          : me.user.email[0] ?? "?"
        ).toUpperCase();
  return { businessName: me.tenant.name, userName, roleLabel: roleLabel(me.user.role), initials };
}

function SidebarBody({
  pathname,
  identity,
  nav,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  identity: Identity;
  nav: NavLink[];
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand — inline wordmark on the cinema surface. */}
      <div className="px-5 py-6">
        <Link href="/dashboard" onClick={onNavigate} className="inline-block">
          <Wordmark tone="light" />
        </Link>
        <p className="mt-2.5 truncate text-[12px] text-white/45">{identity.businessName}</p>
      </div>

      {/* Nav — active route picks up a soft primary fill + side accent line. */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
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
                size={17}
                strokeWidth={active ? 2.25 : 1.85}
                className={active ? "text-primary-light" : "text-white/55 group-hover:text-white/85"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Support / feature-request nudge — visible on every screen so
          tenants can ask for what they don't see. Falls right above the
          user panel so it reads as "help" not "primary nav". */}
      <div className="px-3 pb-3">
        <Link
          href="/settings/support"
          onClick={onNavigate}
          className="group flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[12.5px] text-white/60 transition-colors hover:border-primary/25 hover:bg-primary/[0.05] hover:text-white"
        >
          <MessageSquare
            size={14}
            className="text-white/45 group-hover:text-primary-light"
            strokeWidth={1.85}
          />
          Missing something? Ask us.
        </Link>
      </div>

      {/* User panel at the bottom. */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="mb-3 [&:empty]:hidden">
          <InstallAppButton variant="compact" />
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/25 font-mono text-[11.5px] font-medium text-primary-light">
            {identity.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{identity.userName}</p>
            <p className="text-[11px] text-white/45">{identity.roleLabel || "Member"}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The authenticated app shell — cinematic dark surface. Permanent sidebar
 * on desktop, dismissable drawer on mobile, plus a sticky glass topbar
 * with the page title and per-page actions.
 *
 * Sets html background to cinema-base on mount + restores on unmount —
 * same pattern as MarketingShell / CinematicAuthShell so iOS overscroll
 * matches and the marketing→app transition stays on one continuous
 * surface.
 */
export function AppShell({
  title,
  subtitle,
  actions,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { data: me } = useApiQuery<Me>(meQuery);
  const identity = deriveIdentity(me);
  const nav = useAppNav();
  const modulePaths = useActiveModulePaths();

  // Cinema-base html background while inside the authed shell.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = "#0a0a0c";
    return () => {
      html.style.backgroundColor = prev;
    };
  }, []);

  // Client-side auth guard: app screens require an access token.
  useEffect(() => {
    let active = true;
    (async () => {
      if (getAccessToken()) {
        if (active) setAuthed(true);
        return;
      }
      const recovered = await refreshAccessToken();
      if (!active) return;
      if (recovered) {
        setAuthed(true);
      } else {
        setAuthed(false);
        router.replace("/login");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // Plan/vertical access guard: when the tenant's manifest is known, a route for
  // a module they don't have (e.g. /inventory on a plan without it) bounces to
  // Home. Unguarded when modulePaths is null (no manifest → static-nav fallback).
  useEffect(() => {
    if (authed !== true || modulePaths === null) return;
    if (!isPathAllowed(pathname, modulePaths)) router.replace("/dashboard");
  }, [authed, modulePaths, pathname, router]);

  // Cross-shell guard: STAFF users belong on /work, not the owner dashboard.
  useEffect(() => {
    if (authed !== true || !me) return;
    if (me.user.role === "STAFF") {
      router.replace("/work");
    }
  }, [authed, me, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (authed !== true) {
    return <div className="min-h-screen bg-cinema-base" />;
  }

  return (
    <div className="min-h-screen bg-cinema-base text-white">
      {/* Desktop sidebar — always open. Sits on cinema-elev so it's
          subtly elevated from the main content surface. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-cinema-elev lg:block">
        <SidebarBody pathname={pathname} identity={identity} nav={nav} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer — collapsible glass panel. */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[17rem] max-w-[82%] border-r border-white/[0.08] bg-cinema-elev">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white"
            >
              <X size={18} />
            </button>
            <SidebarBody
              pathname={pathname}
              identity={identity}
              nav={nav}
              onNavigate={() => setOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Sticky glass topbar — backdrop blurred over the page content. */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-cinema-base/80 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/[0.06] lg:hidden"
            >
              <Menu size={20} />
            </button>
            {backHref && (
              <Link
                href={backHref}
                aria-label="Go back"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft size={19} />
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-medium leading-tight tracking-tighter text-white md:text-[20px]">
                {title}
              </h1>
              {subtitle && <p className="truncate text-[13px] text-white/55">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/search"
              aria-label="Search"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                pathname === "/search"
                  ? "bg-primary/15 text-primary-light"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Search size={18} />
            </Link>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                pathname === "/notifications"
                  ? "bg-primary/15 text-primary-light"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Bell size={18} />
            </Link>
            {actions}
          </div>
        </header>

        <VerifyEmailBanner />

        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
