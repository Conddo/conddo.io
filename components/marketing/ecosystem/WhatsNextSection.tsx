"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function WhatsNextSection() {
  return (
    <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
      {/* Soft ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-violet-600/10 via-rose-500/10 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-x relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={12} />
            <span>A GROWING ECOSYSTEM</span>
          </motion.div>

          <motion.h2
            className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            We&apos;re building for{" "}
            <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
              more of everyday life.
            </span>
          </motion.h2>

          <motion.p
            className="mt-6 text-pretty text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Conddo starts with the challenges people face today, but our ambition extends further. We&apos;re building an ecosystem of useful technology solutions that can support more businesses, more people and more of the things that matter in everyday life.
          </motion.p>

          <motion.p
            className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-white/40"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            This is only the beginning.
          </motion.p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            <Link
              href="#ecosystem"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-ink transition-all hover:bg-white/90"
            >
              <span>Explore the Ecosystem</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
