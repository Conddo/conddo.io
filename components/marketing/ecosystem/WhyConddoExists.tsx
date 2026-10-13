"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Layers, Shuffle, Sparkles, Check } from "lucide-react";

export function WhyConddoExists() {
  return (
    <section className="relative bg-[#0a0a0c] py-24 md:py-36 overflow-hidden border-t border-white/5">
      <div className="container-x relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7">
            <motion.p
              className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              WHY CONDDO EXISTS
            </motion.p>
            <motion.h2
              className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.12]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Life is complicated enough.{" "}
              <span className="text-white/45">Your tools shouldn&apos;t make it harder.</span>
            </motion.h2>

            <motion.div
              className="mt-8 space-y-4 text-pretty text-base sm:text-lg text-white/70 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <p>
                Running a business shouldn&apos;t mean juggling disconnected systems. Selling online shouldn&apos;t mean losing track of orders. Getting to work shouldn&apos;t have to be a daily struggle to figure out.
              </p>
              <p className="text-white font-medium">
                We believe technology should make these everyday experiences simpler.
              </p>
              <p className="text-white/60">
                Conddo brings that belief to life through focused solutions that address real problems, one experience at a time.
              </p>
            </motion.div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/25"
              >
                <span>Get to Know Us</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Visual Contrast */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md"
            >
              <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-5">
                The Contrast
              </div>

              {/* Scattered Reality */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4.5 mb-4">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-medium mb-2">
                  <Shuffle size={14} />
                  <span>The Usual Friction</span>
                </div>
                <ul className="space-y-1.5 text-xs text-white/60">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-rose-400" />
                    Spreadsheets that fall out of sync
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-rose-400" />
                    Lost WhatsApp order details & chats
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-rose-400" />
                    Unpredictable, chaotic daily commutes
                  </li>
                </ul>
              </div>

              {/* The Conddo Principle */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4.5">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-2">
                  <Sparkles size={14} />
                  <span>The Conddo Standard</span>
                </div>
                <ul className="space-y-1.5 text-xs text-white/75">
                  <li className="flex items-center gap-2 text-white/90">
                    <Check size={13} className="text-emerald-400" />
                    Systems tailored to your actual workflow
                  </li>
                  <li className="flex items-center gap-2 text-white/90">
                    <Check size={13} className="text-emerald-400" />
                    Orders and clients unified in one place
                  </li>
                  <li className="flex items-center gap-2 text-white/90">
                    <Check size={13} className="text-emerald-400" />
                    Scheduled, dependable travel to work
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
