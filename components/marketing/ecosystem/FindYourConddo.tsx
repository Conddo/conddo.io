"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2, ShoppingBag, Briefcase, CheckCircle2 } from "lucide-react";

const PERSONAS = [
  {
    role: "I run an established business.",
    need: "You need software that fits the way your business actually operates.",
    solution: "Conddo Enterprise",
    cta: "Explore Enterprise",
    href: "/enterprise",
    icon: Building2,
    gradient: "from-violet-500/10 to-transparent",
    accent: "text-violet-300",
    badge: "Tailored Architecture",
  },
  {
    role: "I sell products through social media.",
    need: "You need a simpler way to manage sales and everyday business activities.",
    solution: "Conddo App",
    cta: "Explore Conddo App",
    href: "/conddo-app",
    icon: ShoppingBag,
    gradient: "from-emerald-500/10 to-transparent",
    accent: "text-emerald-300",
    badge: "Social & Retail",
  },
  {
    role: "I commute to work regularly.",
    need: "You want a more organized option for your regular journey to work.",
    solution: "Conddo Commute",
    cta: "Explore Commute",
    href: "/commute",
    icon: Briefcase,
    gradient: "from-amber-500/10 to-transparent",
    accent: "text-amber-300",
    badge: "Scheduled Transit",
  },
];

export function FindYourConddo() {
  return (
    <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
      <div className="container-x relative">
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            WHERE DO YOU FIT IN?
          </motion.p>
          <motion.h2
            className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Start with{" "}
            <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
              what you need.
            </span>
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Whether you&apos;re building a business, managing an established operation or looking for a better way to get to work, there&apos;s a Conddo solution designed with your needs in mind.
          </motion.p>
        </div>

        {/* Persona Match Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PERSONAS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.role}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-white mb-3">
                    &ldquo;{p.role}&rdquo;
                  </h3>

                  <p className="text-sm leading-relaxed text-white/60 mb-6">
                    {p.need}
                  </p>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1">
                      Recommended solution
                    </p>
                    <p className={`text-base font-semibold ${p.accent}`}>
                      {p.solution}
                    </p>
                  </div>
                </div>

                <div className="relative pt-6 mt-6 border-t border-white/10">
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors group-hover:text-primary-light"
                  >
                    <span>{p.cta}</span>
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
