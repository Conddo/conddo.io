"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Floating rotated gradient pill — 5 of them layered behind the hero copy
 *  in different colors/positions to create cinematic depth without a
 *  background video. Each one enters with a long ease-out then slowly
 *  bobs in place forever. Adapted from Kokonut UI's HeroGeometric pattern. */
function FloatingShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

/** Cinematic dark hero — five floating gradient pills behind, large display
 *  type with a soft gradient on the second line, a quiet eyebrow chip up
 *  top, and an optional children slot (for CTAs / product mock).
 *
 *  Tuned to Conddo's palette: deep ink background, violet/rose accents on
 *  the shapes (kept the Kokonut palette since it matches our primary violet
 *  and complements it without competing).
 *
 *  `lede` accepts a string for the simple case or ReactNode when the copy
 *  needs multiple paragraphs / inline formatting. */
export function HeroGeometric({
  eyebrow = "Conddo.io",
  titleTop,
  titleBottom,
  lede,
  children,
}: {
  eyebrow?: string;
  titleTop: string;
  titleBottom: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0c]">
      {/* Base radial glow — soft violet + rose corners. */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-rose-500/[0.05] blur-3xl" />

      {/* Floating gradient pills — 5 of them at different rotations + colors. */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-primary/[0.18]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <FloatingShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <FloatingShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-400/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <FloatingShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.12]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <FloatingShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.12]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      {/* Copy column */}
      <div className="relative z-10 container-x py-20 md:py-28">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12 backdrop-blur"
          >
            <Circle className="h-2 w-2 fill-primary-light text-primary-light" />
            <span className="text-[12px] font-mono uppercase tracking-[0.12em] text-white/60">
              {eyebrow}
            </span>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <h1 className="text-balance text-5xl sm:text-7xl md:text-[96px] font-semibold mb-8 md:mb-10 tracking-[-0.03em] leading-[0.95]">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                {titleTop}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-light via-white/95 to-rose-300">
                {titleBottom}
              </span>
            </h1>
          </motion.div>

          {lede && (
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              {/* Wrap whatever the caller passed (string or paragraphs) in
                  the same constraints, but let the caller supply <p> tags
                  for multi-paragraph lede so paragraph spacing stays
                  consistent with the rest of the marketing system. */}
              <div className="text-pretty text-lg md:text-xl text-white/55 mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4 space-y-4 [&>p]:text-pretty">
                {typeof lede === "string" ? <p>{lede}</p> : lede}
              </div>
            </motion.div>
          )}

          {children && (
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Top + bottom fade-to-black gradient so the hero blends into both
          the sticky nav above and the next section below. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/80 pointer-events-none" />
    </div>
  );
}
