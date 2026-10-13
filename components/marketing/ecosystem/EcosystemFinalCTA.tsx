"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function EcosystemFinalCTA({
  title = "Let's find the right solution for you.",
  description = "Explore the Conddo ecosystem and discover what we're building for your business, your work and your everyday life.",
  primaryCtaText = "Explore Our Solutions",
  primaryCtaHref = "#ecosystem",
  secondaryCtaText = "Contact Us",
  secondaryCtaHref = "/contact",
}: {
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}) {
  return (
    <section className="relative bg-[#0a0a0c] py-28 md:py-36 overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.12),transparent_65%)] pointer-events-none" />

      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Link
              href={primaryCtaHref}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-ink transition-all hover:bg-white/90"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={secondaryCtaHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/25"
            >
              <span>{secondaryCtaText}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
