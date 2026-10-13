"use client";

import { motion } from "framer-motion";
import { Users, Compass, RefreshCw } from "lucide-react";

const APPROACH_PILLARS = [
  {
    icon: Users,
    title: "Built around people.",
    description:
      "We start with the people who will use our products and the challenges they face.",
    color: "text-violet-300",
    border: "hover:border-violet-400/30",
  },
  {
    icon: Compass,
    title: "Designed for real life.",
    description:
      "We focus on practical experiences that work in the context of everyday business and work.",
    color: "text-emerald-300",
    border: "hover:border-emerald-400/30",
  },
  {
    icon: RefreshCw,
    title: "Made to evolve.",
    description:
      "As needs change, our solutions can grow, improve and adapt.",
    color: "text-amber-300",
    border: "hover:border-amber-400/30",
  },
];

export function OurApproachSection() {
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
            BUILT WITH PURPOSE
          </motion.p>
          <motion.h2
            className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Useful technology.{" "}
            <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
              Real-world impact.
            </span>
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            We don&apos;t believe in building software just to add another product to the market. We focus on understanding the problem, designing around the people experiencing it and building solutions that make a practical difference.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {APPROACH_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className={`group rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] ${p.border}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white mb-6 transition-transform group-hover:scale-105">
                  <Icon size={22} className={p.color} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {p.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
