"use client";

import React from "react";
import {
  Brain,
  Award,
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
      color: "from-purple-500/15 via-violet-500/10 to-transparent border-purple-500/30 text-purple-400",
    },
    {
      title: "Verified-Experience Badges",
      subtitle: "Proof of Genuine Visits",
      description:
        "Reviewers can upload original photos, receipts, booking confirmations, or scan merchant QR codes at the counter. Verified reviews earn trust badges and multiplier reward bonuses.",
      icon: ShieldCheck,
      badge: "Anti-Fraud",
      color: "from-blue-500/15 via-teal-500/10 to-transparent border-blue-500/30 text-blue-400",
    },
    {
      title: "Reputation Levels & Progression",
      subtitle: "Bronze to Platinum Perks",
      description:
        "Consistent genuine reviewers level up from Bronze to Platinum. Higher reputation unlocks higher daily earning caps, exclusive brand bounties, and complimentary product testing samples.",
      icon: TrendingUp,
      badge: "Progression",
      color: "from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/30 text-amber-400",
    },
    {
      title: "Instant M-Pesa Payouts",
      subtitle: "Safaricom Daraja B2C Automation",
      description:
        "Once approved, your money is yours immediately. Request a withdrawal anytime from KES 100 with direct disbursement straight to your phone. No delayed cycles or withdrawal fees.",
      icon: Zap,
      badge: "Zero Delays",
      color: "from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Swahili & English (Bilingual)",
      subtitle: "Natively Built for Kenya",
      description:
        "Full support for English, Kiswahili, and Sheng. Express your real, unfiltered experience in the language you speak naturally every day in Nairobi, Mombasa, Kisumu, and beyond.",
      icon: Globe2,
      badge: "Local First",
      color: "from-teal-500/15 via-cyan-500/10 to-transparent border-teal-500/30 text-teal-400",
    },
  ];

  return (
    <section id="why-earnora" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built on Trust & Technology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why Review on EarnOra?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
                className={`rounded-[24px] bg-gradient-to-br ${pillar.color} border p-6 shadow-xl relative overflow-hidden backdrop-blur-md hover:-translate-y-1 transition-all duration-200 ${
                  i === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-slate-700/60 flex items-center justify-center">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-slate-700 text-slate-300">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-white">{pillar.title}</h3>
                <p className="text-xs font-semibold text-emerald-400/90 mt-0.5">
                  {pillar.subtitle}
                </p>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
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
