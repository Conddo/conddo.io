"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2, Smartphone, Bus } from "lucide-react";

const ECOSYSTEM_SOLUTIONS = [
  {
    title: "Conddo Enterprise",
    tagline: "Software built around your business.",
    description:
      "For established businesses that need more than off-the-shelf software. We design and implement tailored systems around your workflows, operations and business goals.",
    cta: "Discover Enterprise",
    href: "/enterprise",
    icon: Building2,
    accentGlow: "from-violet-500/20 via-purple-500/5 to-transparent",
    badgeColor: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    hoverBorder: "hover:border-violet-500/30",
  },
  {
    title: "Conddo App",
    tagline: "A simpler way to run your business.",
    description:
      "For vendors and small retailers selling through WhatsApp, Instagram, TikTok and other social channels. Manage your everyday business activities from one convenient place.",
    cta: "Discover Conddo App",
    href: "/conddo-app",
    icon: Smartphone,
    accentGlow: "from-emerald-500/20 via-teal-500/5 to-transparent",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/30",
  },
  {
    title: "Conddo Commute",
    tagline: "A better way to get to work.",
    description:
      "For professionals looking for a more organized way to commute. Discover scheduled transport options designed around regular work journeys.",
    cta: "Discover Commute",
    href: "/commute",
    icon: Bus,
    accentGlow: "from-amber-500/20 via-orange-500/5 to-transparent",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    hoverBorder: "hover:border-amber-500/30",
  },
];

export function EcosystemIntro() {
  return (
    <section id="ecosystem" className="relative bg-[#0a0a0c] py-24 md:py-36 scroll-mt-20 overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="container-x relative">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            THE CONDDO ECOSYSTEM
          </motion.p>
          <motion.h2
            className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Different challenges.{" "}
            <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
              Purpose-built solutions.
            </span>
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Not every problem needs the same kind of technology. That&apos;s why we&apos;re building a growing ecosystem of solutions, each focused on a specific part of everyday life and work.
          </motion.p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {ECOSYSTEM_SOLUTIONS.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <motion.div
                key={sol.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className={`group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] ${sol.hoverBorder}`}
              >
                {/* Subtle card glow */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${sol.accentGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition-transform group-hover:scale-105">
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${sol.badgeColor}`}>
                      Active
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-white mb-2">
                    {sol.title}
                  </h3>
                  <p className="font-medium text-sm text-primary-light mb-4">
                    {sol.tagline}
                  </p>
                  <p className="text-sm leading-relaxed text-white/60">
                    {sol.description}
                  </p>
                </div>

                <div className="relative pt-8 mt-6 border-t border-white/10">
                  <Link
                    href={sol.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-primary-light"
                  >
                    <span>{sol.cta}</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
