"use client";

import React from "react";
import {
  Brain,
  TrendingUp,
  Zap,
  Globe2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const WhyEarnOra: React.FC = () => {
  const pillars = [
    {
      title: "AI-Screened Review Quality",
      subtitle: "Rewarding Depth & Thoughtfulness",
      description:
        "Every submission runs through advanced NLP quality evaluation checking for original thought, substance, and detail. Higher quality reviews earn the maximum bounty tier—never penalized for honest constructive criticism.",
      icon: Brain,
      badge: "Quality First",
      iconColor: "text-[#1E6FD9] bg-[#EEF3FF]",
    },
    {
      title: "Verified-Experience Badges",
      subtitle: "Proof of Genuine Visits",
      description:
        "Reviewers can upload original photos, receipts, booking confirmations, or scan merchant QR codes at the counter. Verified reviews earn trust badges and multiplier reward bonuses.",
      icon: ShieldCheck,
      badge: "Anti-Fraud",
      iconColor: "text-[#0A3D91] bg-[#EAF3FF]",
    },
    {
      title: "Reputation Levels & Progression",
      subtitle: "Bronze to Platinum Perks",
      description:
        "Consistent genuine reviewers level up from Bronze to Platinum. Higher reputation unlocks higher daily earning caps, exclusive brand bounties, and complimentary product testing samples.",
      icon: TrendingUp,
      badge: "Progression",
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Instant M-Pesa Payouts",
      subtitle: "Safaricom Daraja B2C Automation",
      description:
        "Once approved, your money is yours immediately. Request a withdrawal anytime from KES 100 with direct disbursement straight to your phone. No delayed cycles or withdrawal fees.",
      icon: Zap,
      badge: "Zero Delays",
      iconColor: "text-[#16A34A] bg-emerald-50",
    },
    {
      title: "Swahili & English (Bilingual)",
      subtitle: "Natively Built for Kenya",
      description:
        "Full support for English, Kiswahili, and Sheng. Express your real, unfiltered experience in the language you speak naturally every day in Nairobi, Mombasa, Kisumu, and beyond.",
      icon: Globe2,
      badge: "Local First",
      iconColor: "text-[#1E6FD9] bg-sky-50",
    },
  ];

  return (
    <section id="why-earnora" className="py-20 md:py-28 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF3FF] border border-blue-200/70 text-[#1E6FD9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built on Trust & Technology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F3D] tracking-tight">
            Why Review on EarnOra?
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7A99] leading-relaxed">
            We built EarnOra to eliminate fake reviews and replace bot spam with honest, well-compensated Kenyan voices.
          </p>
        </div>

        {/* 5 Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`rounded-[20px] bg-white border border-blue-100/70 p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.06)] hover:shadow-[0_12px_32px_rgba(30,111,217,0.12)] hover:border-[#1E6FD9]/40 transition-all duration-200 hover:-translate-y-1 ${
                  i === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-[14px] ${pillar.iconColor} border border-blue-100/60 flex items-center justify-center shadow-xs`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3FF] text-[#0A3D91] border border-blue-200/50">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[#0F1F3D]">{pillar.title}</h3>
                <p className="text-xs font-bold text-[#16A34A] mt-0.5">
                  {pillar.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[#6B7A99] mt-3 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
