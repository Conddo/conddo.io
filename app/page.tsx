import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import { EcosystemHeroVisual } from "@/components/marketing/ecosystem/EcosystemHeroVisual";
import { EcosystemIntro } from "@/components/marketing/ecosystem/EcosystemIntro";
import { WhyConddoExists } from "@/components/marketing/ecosystem/WhyConddoExists";
import { FindYourConddo } from "@/components/marketing/ecosystem/FindYourConddo";
import { OurApproachSection } from "@/components/marketing/ecosystem/OurApproachSection";
import { WhatsNextSection } from "@/components/marketing/ecosystem/WhatsNextSection";
import { EcosystemFinalCTA } from "@/components/marketing/ecosystem/EcosystemFinalCTA";

export const metadata: Metadata = {
  title: "Conddo — Technology for the way we live, work and do business",
  description:
    "Conddo builds practical software solutions for businesses, independent sellers and working professionals. Explore Conddo Enterprise, Conddo App, and Conddo Commute.",
  openGraph: {
    title: "Conddo — Technology for the way we live, work and do business",
    description:
      "One ecosystem. Different solutions. Practical software built around real-world needs.",
    type: "website",
  },
};

/**
 * Repositioned Conddo Homepage
 *
 * 1. Hero: "Technology for the way we live, work and do business."
 *    + Visual: 3-product connected interface preview (Enterprise / App / Commute)
 * 2. Introducing the Ecosystem: "Different challenges. Purpose-built solutions."
 * 3. The Problem We Solve: "Life is complicated enough. Your tools shouldn't make it harder."
 * 4. Find Your Conddo: "Start with what you need." (Persona matcher)
 * 5. Our Approach: "Useful technology. Real-world impact."
 * 6. What's Next?: "We're building for more of everyday life."
 * 7. Closing CTA: "Let's find the right solution for you."
 */
export default function Home() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="ONE ECOSYSTEM. DIFFERENT SOLUTIONS."
        titleTop="Technology for the way we"
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            live, work and do business.
          </span>
        }
        lede="Conddo builds practical software solutions for businesses, independent sellers and working professionals. Each solution is designed around a real need, helping people work smarter, operate better and move forward."
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="#ecosystem" variant="primary" size="lg">
            Explore Our Solutions
            <ArrowRight size={18} />
          </Button>
          <Button href="/about" variant="secondary-dark" size="lg">
            About Conddo
          </Button>
        </div>

        {/* Visual Direction: Connected 3-product interface preview */}
        <EcosystemHeroVisual />
      </HeroGeometric>

      <EcosystemIntro />
      <WhyConddoExists />
      <FindYourConddo />
      <OurApproachSection />
      <WhatsNextSection />
      <EcosystemFinalCTA />
    </MarketingShell>
  );
}
