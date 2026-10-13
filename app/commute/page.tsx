"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { ArrowRight, MapPin, Calendar, Compass, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";

const COMMUTE_PILLARS = [
  {
    icon: MapPin,
    title: "Planned routes.",
    description: "Explore commuting options organized around defined routes and pickup points.",
  },
  {
    icon: Calendar,
    title: "Regular schedules.",
    description: "Build your workday around a clearer transport routine.",
  },
  {
    icon: Compass,
    title: "A more organized experience.",
    description: "Get the important details of your commute in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Designed for working professionals.",
    description: "A service concept focused on people who make the same work journey regularly.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Register your interest",
    description: "Tell us where you travel from, where you work and when you usually commute.",
  },
  {
    num: "02",
    title: "Find a suitable route",
    description: "We assess demand and available routes to identify suitable commuting options.",
  },
  {
    num: "03",
    title: "Confirm your commute",
    description: "Where a suitable service is available, review the schedule, pickup arrangements and pricing.",
  },
  {
    num: "04",
    title: "Travel with a plan",
    description: "Follow your confirmed schedule and receive relevant trip information.",
  },
];

export default function CommutePage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    departureTime: "07:00 AM",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MarketingShell>
      {/* 1. Hero */}
      <HeroGeometric
        eyebrow="CONDDO COMMUTE"
        titleTop="Your work commute,"
        titleBottom={
          <span className="bg-gradient-to-r from-amber-300 via-white/95 to-orange-200 bg-clip-text text-transparent">
            sorted.
          </span>
        }
        lede={
          <>
            <p>
              A regular work journey deserves a better plan.
            </p>
            <p className="text-white/45">
              Conddo Commute is being developed around scheduled transport for working professionals who want a more organized way to travel between home and work.
            </p>
            <p>
              Explore a commuting experience built around planned routes, regular schedules and a more predictable routine.
            </p>
          </>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="#register" variant="primary" size="lg">
            Register Your Interest
            <ArrowRight size={18} />
          </Button>
          <Button href="#how-it-works" variant="secondary-dark" size="lg">
            How It Works
          </Button>
        </div>
      </HeroGeometric>

      {/* 2. A Different Way to Commute */}
      <section className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-amber-300 mb-4">
              A DIFFERENT WAY TO COMMUTE
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
              Make your everyday journey{" "}
              <span className="bg-gradient-to-r from-amber-300 via-white/95 to-orange-200 bg-clip-text text-transparent">
                more intentional.
              </span>
            </h2>
            <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
              Daily commuting can take time, energy and planning. Conddo Commute aims to make regular work journeys easier to organize through scheduled transport options.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMUTE_PILLARS.map((col) => {
              const Icon = col.icon;
              return (
                <div
                  key={col.title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-300 mb-6 transition-transform group-hover:scale-105">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {col.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {col.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 scroll-mt-20 overflow-hidden">
        <div className="container-x relative">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-amber-300 mb-4">
              HOW IT WORKS
            </p>
            <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
              A commute you can{" "}
              <span className="text-white/45">plan around.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-sm"
              >
                <div className="font-mono text-3xl font-semibold text-amber-400/40 mb-4">
                  {s.num}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Help Shape the Service / Register */}
      <section id="register" className="relative bg-[#0a0a0c] py-24 md:py-36 border-t border-white/5 scroll-mt-20 overflow-hidden">
        <div className="container-x relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-amber-300 mb-4">
                HELP SHAPE THE SERVICE
              </p>
              <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.12]">
                Your route could be the place we start.
              </h2>
              <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
                We&apos;re exploring commuting needs among working professionals to understand which routes, schedules and pickup points would make the biggest difference.
              </p>
              <p className="mt-4 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
                Tell us about your regular journey and help us understand where Conddo Commute should go next.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/50">
                <em>*Service availability depends on route coverage and operational arrangements.</em>
              </div>
            </div>

            {/* Interactive Route Registration Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 backdrop-blur-md">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Route Registration Form
                </h3>
                <p className="text-xs text-white/50 mb-6">
                  Share your typical work journey to help prioritize your corridor.
                </p>

                {submitted ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 text-center">
                    <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-white">Interest Registered</h4>
                    <p className="text-xs text-white/70 mt-1">
                      Thank you! We&apos;ve added your corridor ({form.origin} &rarr; {form.destination}) to our route demand analysis. We&apos;ll notify you when service begins.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Where do you travel from? (Pickup area / neighborhood)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Yaba, Surulere, Ikeja, Ajah"
                        value={form.origin}
                        onChange={(e) => setForm({ ...form, origin: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-amber-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Where is your office / work location?
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Victoria Island, Marina, Lekki Phase 1"
                        value={form.destination}
                        onChange={(e) => setForm({ ...form, destination: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-amber-400/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Typical morning departure time
                      </label>
                      <select
                        value={form.departureTime}
                        onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-2.5 text-sm text-white focus:border-amber-400/50 focus:outline-none"
                      >
                        <option value="06:30 AM">06:30 AM</option>
                        <option value="07:00 AM">07:00 AM</option>
                        <option value="07:30 AM">07:30 AM</option>
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="08:30 AM">08:30 AM</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Work email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-amber-400/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="080..."
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-amber-400/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-ink transition-all hover:bg-white/90"
                    >
                      Register Your Interest
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Closing CTA */}
      <section className="relative bg-[#0a0a0c] py-28 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="container-x relative text-center max-w-3xl mx-auto">
          <h2 className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
            Let&apos;s make the journey to work work better.
          </h2>
          <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed max-w-xl mx-auto">
            Share your route and commuting needs with us.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Button href="#register" variant="primary" size="lg">
              Register Your Interest
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
