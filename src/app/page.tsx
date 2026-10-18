import React from "react";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EarningCategories } from "@/components/landing/EarningCategories";
import { WhyEarnOra } from "@/components/landing/WhyEarnOra";
import { ForBusinesses } from "@/components/landing/ForBusinesses";
import { ReviewerLevels } from "@/components/landing/ReviewerLevels";
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "EarnOra — Your Honest Opinion Pays | Real M-Pesa Earnings in Kenya",
  description:
    "Turn your genuine reviews into real M-Pesa earnings. Review Kenyan hotels, apps, local businesses, and fintechs. Fast Daraja B2C payouts, zero joining fees.",
};

export default function LandingPage() {
  // Schema.org Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://earnora.co.ke/#website",
        "url": "https://earnora.co.ke",
        "name": "EarnOra",
        "description": "Kenya's Premier Review & Earn Platform",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://earnora.co.ke/earn?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
        "inLanguage": "en-KE",
      },
      {
        "@type": "Organization",
        "@id": "https://earnora.co.ke/#organization",
        "name": "EarnOra Technologies Limited",
        "url": "https://earnora.co.ke",
        "logo": "https://earnora.co.ke/assets/earnora-logo-dark.jpg",
        "sameAs": ["https://twitter.com/EarnOraKE"],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full min-h-screen flex flex-col bg-[#070C18] text-slate-100 overflow-x-hidden">
        {/* 1. Sticky Navbar */}
        <LandingNavbar />

        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Trust Strip */}
        <TrustStrip />

        {/* 4. How It Works (3 Steps) */}
        <HowItWorks />

        {/* 5. Earning Categories Grid (8 Cards) */}
        <EarningCategories />

        {/* 6. Why EarnOra Pillars */}
        <WhyEarnOra />

        {/* 7. For Businesses Section */}
        <ForBusinesses />

        {/* 8. Reviewer Levels (Bronze to Platinum) */}
        <ReviewerLevels />

        {/* 9. Testimonials Carousel */}
        <TestimonialsCarousel />

        {/* 10. FAQ Accordion */}
        <FaqAccordion />

        {/* 11. Final Call to Action Banner */}
        <FinalCta />

        {/* 12. Landing Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
