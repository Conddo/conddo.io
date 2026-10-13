"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Building2, Smartphone, Bus, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Wordmark } from "@/components/marketing/Wordmark";

type OptionKey = "enterprise" | "app" | "commute" | "general";

const CONTACT_OPTIONS = [
  {
    key: "enterprise" as OptionKey,
    title: "Business software and partnerships",
    description: "Have a business challenge that may need a tailored software solution?",
    cta: "Discuss Your Project",
    icon: Building2,
    badge: "Conddo Enterprise",
  },
  {
    key: "app" as OptionKey,
    title: "Conddo App",
    description: "Questions about using Conddo App for your business?",
    cta: "Contact App Support",
    icon: Smartphone,
    badge: "Vendors & Retail",
  },
  {
    key: "commute" as OptionKey,
    title: "Conddo Commute",
    description: "Interested in a route, commuting service or partnership?",
    cta: "Discuss Commute",
    icon: Bus,
    badge: "Professionals",
  },
  {
    key: "general" as OptionKey,
    title: "General enquiries",
    description: "Something else on your mind?",
    cta: "Get in Touch",
    icon: HelpCircle,
    badge: "General",
  },
];

function ContactContent() {
  const searchParams = useSearchParams();
  const initialTopic = (searchParams.get("topic") as OptionKey) || "enterprise";

  const [selectedTopic, setSelectedTopic] = useState<OptionKey>(initialTopic);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });

  useEffect(() => {
    const t = searchParams.get("topic") as OptionKey;
    if (t && ["enterprise", "app", "commute", "general"].includes(t)) {
      setSelectedTopic(t);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const currentOption = CONTACT_OPTIONS.find((o) => o.key === selectedTopic) || CONTACT_OPTIONS[0];

  return (
    <div className="container-x py-20 md:py-32">
      {/* Hero */}
      <div className="max-w-3xl mb-16 md:mb-20">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-4">
          CONTACT US
        </p>
        <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.08]">
          Tell us what you&apos;re working on.
        </h1>
        <p className="mt-6 text-pretty text-base sm:text-lg text-white/65 leading-relaxed">
          Whether you&apos;re looking for software for your business, exploring Conddo App or interested in Conddo Commute, we&apos;d like to hear from you.
        </p>
        <p className="mt-2 text-white/50 text-sm">
          Choose the option that best describes your enquiry and we&apos;ll take it from there.
        </p>
      </div>

      {/* 4 Contact Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {CONTACT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedTopic === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedTopic(opt.key)}
              className={`flex flex-col justify-between text-left rounded-3xl border p-6 transition-all duration-300 ${
                isSelected
                  ? "border-primary-light/60 bg-white/[0.06] shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isSelected
                        ? "border-primary-light/40 bg-primary-light/10 text-primary-light"
                        : "border-white/10 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-white/40">
                    {opt.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {opt.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/60">
                  {opt.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-primary-light">
                <span>{opt.cta}</span>
                <ArrowRight size={13} className={isSelected ? "translate-x-0.5" : ""} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Contact Form */}
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 backdrop-blur-md">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-wider text-primary-light mb-1">
            Enquiry Topic
          </p>
          <h2 className="text-xl font-semibold text-white">
            {currentOption.title}
          </h2>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-8 text-center">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white">Message Received</h3>
            <p className="text-sm text-white/70 mt-2">
              Thank you for reaching out, {form.name || "friend"}. Our team will review your message regarding {currentOption.title} and respond to {form.email} shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Your full name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adeola Johnson"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-primary-light/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-primary-light/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Business / organization (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Health"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-primary-light/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                How can we help?
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tell us what you're working on, your operational challenges, or what you'd like to achieve..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-primary-light/50 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-white px-6 py-3.5 text-sm font-medium text-ink transition-all hover:bg-white/90"
            >
              {currentOption.cta}
            </button>
          </form>
        )}
      </div>

      {/* Closing Line */}
      <div className="mt-24 pt-10 border-t border-white/10 text-center">
        <Wordmark tone="light" className="text-xl inline-block mb-3" />
        <p className="text-sm text-white/60">
          Practical technology for business, work and everyday life.
        </p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <MarketingShell>
      <Suspense fallback={<div className="min-h-screen" />}>
        <ContactContent />
      </Suspense>
    </MarketingShell>
  );
}
