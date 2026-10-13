"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Smartphone,
  Bus,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type ProductKey = "enterprise" | "app" | "commute";

const PRODUCTS = [
  {
    key: "enterprise" as ProductKey,
    name: "Conddo Enterprise",
    tagline: "Tailored business software",
    badge: "Enterprise",
    color: "from-violet-500/20 via-purple-500/10 to-transparent",
    border: "hover:border-violet-400/40",
    activeBorder: "border-violet-400/60 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
    dotColor: "bg-violet-400",
    icon: Building2,
    href: "/enterprise",
  },
  {
    key: "app" as ProductKey,
    name: "Conddo App",
    tagline: "Social & retail selling",
    badge: "Vendors & Retail",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "hover:border-emerald-400/40",
    activeBorder: "border-emerald-400/60 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    dotColor: "bg-emerald-400",
    icon: Smartphone,
    href: "/conddo-app",
  },
  {
    key: "commute" as ProductKey,
    name: "Conddo Commute",
    tagline: "Scheduled work travel",
    badge: "Professionals",
    color: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "hover:border-amber-400/40",
    activeBorder: "border-amber-400/60 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    dotColor: "bg-amber-400",
    icon: Bus,
    href: "/commute",
  },
];

export function EcosystemHeroVisual() {
  const [active, setActive] = useState<ProductKey>("enterprise");

  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl">
      {/* Ecosystem Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {PRODUCTS.map((prod) => {
          const isSelected = active === prod.key;
          const Icon = prod.icon;
          return (
            <button
              key={prod.key}
              type="button"
              onClick={() => setActive(prod.key)}
              className={`group flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                isSelected
                  ? `bg-white/10 text-white ${prod.activeBorder}`
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${prod.dotColor}`} />
              <Icon size={15} />
              <span>{prod.name}</span>
            </button>
          );
        })}
      </div>

      {/* Interface Preview Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d12]/90 p-4 sm:p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          {active === "enterprise" && (
            <motion.div
              key="enterprise"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-violet-300">
                      Enterprise Suite
                    </span>
                    <span className="text-xs text-white/40">Multi-location Operations</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">
                    Apex Medical & Diagnostic Network
                  </h3>
                </div>
                <Link
                  href="/enterprise"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200 transition-colors"
                >
                  Explore Enterprise <ArrowRight size={13} />
                </Link>
              </div>

              {/* Enterprise Dashboard Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Clinical Inventory Hub</span>
                    <TrendingUp size={14} className="text-violet-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">₦24.8M</div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={11} /> 3 branch warehouses synchronized
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Workflow Automations</span>
                    <ShieldCheck size={14} className="text-violet-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">99.4%</div>
                  <div className="text-[11px] text-white/40 mt-1">
                    Automated dispensing & prescription audits
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Custom Integrations</span>
                    <Building2 size={14} className="text-violet-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">Connected</div>
                  <div className="text-[11px] text-white/40 mt-1">
                    EHR, Accounting & Lab telemetry
                  </div>
                </div>
              </div>

              {/* Workflows table mock */}
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-3.5 text-xs">
                <div className="text-white/40 font-mono text-[11px] mb-2 uppercase tracking-wider">
                  Live Operations Queue
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-white/90">Ikeja Central — Batch Refill Batch #8402</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px]">Auto-verified</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      <span className="text-white/90">Victoria Island — Patient Care Consultation Route</span>
                    </div>
                    <span className="text-violet-300 font-mono text-[11px]">Synced to EHR</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === "app" && (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-emerald-300">
                      Conddo App
                    </span>
                    <span className="text-xs text-white/40">Multi-Channel Social Commerce</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">
                    Zainab Luxury Fabrics
                  </h3>
                </div>
                <Link
                  href="/conddo-app"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  Explore Conddo App <ArrowRight size={13} />
                </Link>
              </div>

              {/* Conddo App Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Today&apos;s DM Sales</span>
                    <ShoppingBag size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">₦185,000</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    6 orders via WhatsApp & Instagram
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Order Tracking</span>
                    <Sparkles size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">4 Pending</div>
                  <div className="text-[11px] text-white/40 mt-1">
                    Instant receipts issued automatically
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Customer Roster</span>
                    <Smartphone size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">412 Clients</div>
                  <div className="text-[11px] text-white/40 mt-1">
                    Preferences & purchase histories saved
                  </div>
                </div>
              </div>

              {/* Live orders preview */}
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-3.5 text-xs">
                <div className="text-white/40 font-mono text-[11px] mb-2 uppercase tracking-wider">
                  Recent Social Orders
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-mono">
                        WhatsApp
                      </span>
                      <span className="text-white/90">Mrs. Folake · Silk Brocade 6 Yards</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px]">Paid (₦54,000)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 font-mono">
                        Instagram
                      </span>
                      <span className="text-white/90">Chidi O. · Men&apos;s Senator Kaftan Set</span>
                    </div>
                    <span className="text-amber-300 font-mono text-[11px]">Awaiting Dispatch</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === "commute" && (
            <motion.div
              key="commute"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-amber-300">
                      Conddo Commute
                    </span>
                    <span className="text-xs text-white/40">Scheduled Professional Transit</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">
                    Morning Executive Route #14
                  </h3>
                </div>
                <Link
                  href="/commute"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
                >
                  Explore Commute <ArrowRight size={13} />
                </Link>
              </div>

              {/* Conddo Commute Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Route Confirmation</span>
                    <MapPin size={14} className="text-amber-400" />
                  </div>
                  <div className="text-xl font-semibold text-white">Yaba → VI</div>
                  <div className="text-[11px] text-amber-400 mt-1">
                    Express via Third Mainland Bridge
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Schedule & Seat</span>
                    <Clock size={14} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">07:15 AM</div>
                  <div className="text-[11px] text-white/40 mt-1">
                    Reserved Seat #4A · Climate-controlled
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Commute Routine</span>
                    <Bus size={14} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-white">Predictable</div>
                  <div className="text-[11px] text-white/40 mt-1">
                    Consistent daily work travel
                  </div>
                </div>
              </div>

              {/* Transit detail */}
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-3.5 text-xs">
                <div className="text-white/40 font-mono text-[11px] mb-2 uppercase tracking-wider">
                  Upcoming Trip Details
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="text-white/90">Pickup: Commercial Avenue, Yaba (7:15 AM)</span>
                    </div>
                    <span className="text-amber-300 font-mono text-[11px]">Confirmed</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-white/90">Drop-off: Adeola Odeku, Victoria Island (8:05 AM)</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px]">On Time</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
