import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Smartphone, Bus } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Conddo — We build technology around real-life needs",
  description:
    "Conddo is a technology company building an ecosystem of software solutions for business, work and everyday life.",
};

const PRODUCTS = [
  {
    icon: Building2,
    name: "Conddo Enterprise",
    description: "Tailored software for businesses with specific operational needs.",
    href: "/enterprise",
    accent: "text-violet-300",
  },
  {
    icon: Smartphone,
    name: "Conddo App",
    description: "Practical business tools for small retailers and independent sellers.",
    href: "/conddo-app",
    accent: "text-emerald-300",
  },
  {
    icon: Bus,
    name: "Conddo Commute",
    description: "Scheduled commuting solutions for working professionals.",
    href: "/commute",
    accent: "text-amber-300",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      {/* 1. Hero */}
      <HeroGeometric
        eyebrow="ABOUT CONDDO"
        titleTop="We build technology around"
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            real-life needs.
          </span>
        }
        lede={
          <>
            <p>
              Conddo is a technology company building an ecosystem of software solutions for business, work and everyday life.
            </p>
            <p className="text-white/45">
              We believe useful technology should do more than introduce new tools. It should make real tasks easier, help people work more effectively and solve problems that matter.
            </p>
            <p className="text-white">
              That&apos;s the principle behind every solution we build.
            </p>
          </>
        }
      />

      {/* 2. Our Perspective */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4">
              OUR PERSPECTIVE
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.12]">
              Start with the problem.{" "}
              <span className="text-white/45">Build what makes a difference.</span>
            </h2>

            <div className="mt-8 space-y-4 text-pretty text-base sm:text-lg text-white/70 leading-relaxed">
              <p>
                The best technology starts with understanding people.
              </p>
              <p>
                A growing business may need software designed around its operations. An independent seller may need a simpler way to manage daily sales. A working professional may need a more organized commute.
              </p>
              <p>
                These are different problems, and they deserve solutions designed for their specific realities.
              </p>
              <p className="text-white font-medium">
                Conddo exists to build those solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. One Company. Different Solutions. */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4">
              ONE COMPANY. DIFFERENT SOLUTIONS.
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
              A growing ecosystem,{" "}
              <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
                built with purpose.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PRODUCTS.map((prod) => {
              const Icon = prod.icon;
              return (
                <div
                  key={prod.name}
                  className="group rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white mb-6">
                    <Icon size={22} className={prod.accent} />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    {prod.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60 mb-6">
                    {prod.description}
                  </p>
                  <Link
                    href={prod.href}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
                  >
                    <span>Learn more</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-12 text-sm text-white/50 text-center max-w-2xl mx-auto">
            Each product serves a distinct need. Together, they reflect our broader commitment to making technology useful in everyday life.
          </p>
        </div>
      </section>

      {/* 4. Looking Ahead */}
      <section className="relative bg-[#0a0a0c] py-28 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative text-center max-w-3xl mx-auto">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4">
            LOOKING AHEAD
          </p>
          <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
            We&apos;re here to keep building.
          </h2>
          <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed max-w-xl mx-auto">
            Our ecosystem will evolve as we learn more about the people we serve and the problems worth solving. We intend to stay practical, thoughtful and focused on creating solutions people can genuinely use.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button href="/#ecosystem" variant="primary" size="lg">
              Explore Our Ecosystem
              <ArrowRight size={18} />
            </Button>
            <Button href="/contact" variant="secondary-dark" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
