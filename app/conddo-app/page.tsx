import type { Metadata } from "next";
import { ArrowRight, ShoppingCart, Users, ClipboardList, Zap, Check } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Conddo App — Your business, beyond the DMs",
  description:
    "A simpler way to run your business for vendors and small retailers selling through WhatsApp, Instagram, TikTok and social channels.",
};

const SELLER_FEATURES = [
  {
    icon: ShoppingCart,
    title: "Keep track of orders.",
    description: "Organize incoming orders and make it easier to follow what needs to be fulfilled.",
  },
  {
    icon: Users,
    title: "Manage your customers.",
    description: "Keep useful customer information accessible as your business grows.",
  },
  {
    icon: ClipboardList,
    title: "Stay on top of your operations.",
    description: "Bring important daily business activities into one convenient workspace.",
  },
  {
    icon: Zap,
    title: "Spend less time juggling tools.",
    description: "Reduce the need to switch between scattered notes, messages and disconnected records.",
  },
];

const CATEGORIES = [
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Food & Catering",
  "Accessories & Jewelry",
  "Everyday Retail Goods",
];

export default function ConddoAppLandingPage() {
  return (
    <MarketingShell>
      {/* 1. Hero */}
      <HeroGeometric
        eyebrow="CONDDO APP"
        titleTop="Your business,"
        titleBottom={
          <span className="bg-gradient-to-r from-emerald-300 via-white/95 to-teal-200 bg-clip-text text-transparent">
            beyond the DMs.
          </span>
        }
        lede={
          <>
            <p>
              You sell on WhatsApp, Instagram, TikTok and wherever your customers find you. Keeping up with everything shouldn&apos;t become another full-time job.
            </p>
            <p className="text-white/45">
              Conddo App helps small retailers and independent sellers bring everyday business activities into one simpler experience.
            </p>
          </>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/onboarding/create-account" variant="primary" size="lg">
            Get Started
            <ArrowRight size={18} />
          </Button>
          <Button href="#features" variant="secondary-dark" size="lg">
            See What You Can Do
          </Button>
        </div>
      </HeroGeometric>

      {/* 2. Made for the Way You Sell */}
      <section id="features" className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 scroll-mt-20 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300 mb-4">
              MADE FOR THE WAY YOU SELL
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
              Keep selling.{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-white/95 to-teal-200 bg-clip-text text-transparent">
                Get more organized.
              </span>
            </h2>
            <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
              Your customers may come from different channels, but you still need a clear view of your business. Conddo App is designed to help you manage the everyday work behind each sale, without making things unnecessarily complicated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SELLER_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-emerald-300 mb-6 transition-transform group-hover:scale-105">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Designed for Independent Sellers */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300 mb-4">
                DESIGNED FOR SELLERS
              </p>
              <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.12]">
                Built for the business you&apos;re growing.
              </h2>
              <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
                Whether you&apos;re selling fashion, beauty products, food, accessories or other everyday goods, you need tools that fit the reality of running a small business.
              </p>
              <p className="mt-4 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
                Conddo App is designed for sellers who want to spend less time sorting things out and more time serving customers.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-sm">
                <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
                  What Sellers Manage with Conddo
                </p>
                <div className="space-y-2.5">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium text-white/80">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Simple by Design */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative text-center max-w-3xl mx-auto">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-emerald-300 mb-4">
            SIMPLE BY DESIGN
          </p>
          <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.12]">
            You don&apos;t need a complicated system to run a serious business.
          </h2>
          <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
            Get started with a straightforward experience built around the things you do every day. As your business grows, a more organized way of working can help you stay in control.
          </p>

          <div className="mt-10">
            <Button href="/onboarding/create-account" variant="primary" size="lg">
              Get Started with Conddo App
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Closing CTA */}
      <section className="relative bg-[#0a0a0c] py-28 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative text-center max-w-3xl mx-auto">
          <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
            Make room for more business.
          </h2>
          <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed max-w-xl mx-auto">
            Bring your everyday selling activities into one place and build better habits around the business you&apos;re growing.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Button href="/onboarding/create-account" variant="primary" size="lg">
              Try Conddo App
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
