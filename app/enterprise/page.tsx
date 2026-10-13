import type { Metadata } from "next";
import { ArrowRight, Cpu, Layers, GitMerge, Globe, CheckCircle2 } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conddo Enterprise — Software that works the way your business does",
  description:
    "Tailored software systems, workflow automation, and custom digital platforms designed around your operations, not the other way around.",
};

const OPERATIONS_PILLARS = [
  {
    icon: Cpu,
    title: "Custom business systems",
    description: "Software tailored to your specific operational needs.",
  },
  {
    icon: Layers,
    title: "Workflow automation",
    description: "Reduce repetitive manual processes and make work more consistent.",
  },
  {
    icon: GitMerge,
    title: "Systems integration",
    description: "Connect tools and processes that need to work together.",
  },
  {
    icon: Globe,
    title: "Web-based platforms",
    description: "Build accessible digital systems for your teams, customers and partners.",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Understand",
    description: "We learn how your business operates, where the friction exists and what needs to improve.",
  },
  {
    num: "02",
    title: "Define",
    description: "We translate your requirements into a clear solution, with defined priorities, workflows and scope.",
  },
  {
    num: "03",
    title: "Build",
    description: "We design, develop and implement a solution aligned with your business needs.",
  },
  {
    num: "04",
    title: "Improve",
    description: "As your operations evolve, we can identify opportunities to refine and extend your systems.",
  },
];

const WHO_WE_WORK_WITH = [
  "Pharmacies and healthcare-related businesses",
  "Service businesses with complex workflows",
  "Organizations managing multiple teams or locations",
  "Businesses that need integrations or custom digital platforms",
];

export default function EnterprisePage() {
  return (
    <MarketingShell>
      {/* 1. Hero */}
      <HeroGeometric
        eyebrow="CONDDO ENTERPRISE"
        titleTop="Software that works the"
        titleBottom={
          <span className="bg-gradient-to-r from-violet-300 via-white/95 to-primary-light bg-clip-text text-transparent">
            way your business does.
          </span>
        }
        lede={
          <>
            <p>
              Your business has its own processes, people and challenges. Your software should reflect that.
            </p>
            <p className="text-white/45">
              Conddo Enterprise designs and implements tailored software solutions for businesses that need technology built around their operations, not the other way around.
            </p>
          </>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/contact?topic=enterprise" variant="primary" size="lg">
            Discuss Your Project
            <ArrowRight size={18} />
          </Button>
          <Button href="#approach" variant="secondary-dark" size="lg">
            Explore Our Approach
          </Button>
        </div>
      </HeroGeometric>

      {/* 2. Built Around Your Operations */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-violet-300 mb-4">
              BUILT AROUND YOUR OPERATIONS
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
              Your business isn&apos;t off the shelf.{" "}
              <span className="text-white/45">Your software shouldn&apos;t be either.</span>
            </h2>
            <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
              When standard tools cannot support the way your business works, you need a solution designed for your actual requirements. We work with businesses to understand their workflows, identify operational gaps and build software that brings their processes together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OPERATIONS_PILLARS.map((op) => {
              const Icon = op.icon;
              return (
                <div
                  key={op.title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-violet-300 mb-6 transition-transform group-hover:scale-105">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {op.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {op.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. How We Work */}
      <section id="approach" className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 scroll-mt-20 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-violet-300 mb-4">
              OUR PROCESS
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
              From operational challenge to{" "}
              <span className="bg-gradient-to-r from-violet-300 via-white/95 to-primary-light bg-clip-text text-transparent">
                working solution.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.num}
                className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm"
              >
                <div className="font-mono text-3xl font-semibold text-violet-400/40 mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Who We Work With */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-violet-300 mb-4">
                WHO WE WORK WITH
              </p>
              <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.12]">
                For businesses ready for a better way to operate.
              </h2>
              <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
                We work with organizations that need technology to support specific operational needs. Every engagement starts with understanding the business, not forcing it into a predefined package.
              </p>
            </div>

            <div className="lg:col-span-6 space-y-3.5">
              {WHO_WE_WORK_WITH.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-base text-white/85 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Closing CTA */}
      <section className="relative bg-[#0a0a0c] py-28 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative text-center max-w-3xl mx-auto">
          <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
            Tell us what your business needs to do better.
          </h2>
          <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed max-w-xl mx-auto">
            Let&apos;s discuss your operations and explore the right software solution for your organization.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button href="/contact?topic=enterprise" variant="primary" size="lg">
              Discuss Your Project
              <ArrowRight size={18} />
            </Button>
            <Button href="/contact" variant="secondary-dark" size="lg">
              Contact Conddo
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
