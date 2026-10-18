"use client";

import React from "react";
import { Award, Check, Sparkles, Shield, Trophy } from "lucide-react";

export const ReviewerLevels: React.FC = () => {
  const levels = [
    {
      name: "Bronze Reviewer",
      threshold: "Starting Level (0 - 9 approved reviews)",
      dailyCap: "KES 500 Daily Cap",
      icon: Shield,
      iconColor: "text-amber-700 bg-amber-50 border-amber-200",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      perks: [
        "Access to standard dining and app reviews",
        "Direct M-Pesa withdrawals from KES 100",
        "Daily streak multiplier eligibility",
        "Community leaderboard ranking",
      ],
    },
    {
      name: "Silver Reviewer",
      threshold: "10 - 24 approved reviews (80% score)",
      dailyCap: "KES 1,500 Daily Cap",
      icon: Award,
      iconColor: "text-slate-700 bg-slate-100 border-slate-200",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      perks: [
        "All Bronze perks included",
        "Higher priority task queue access",
        "Paid research survey eligibility (up to KES 600)",
        "Accelerated 12-hour moderation turnaround",
      ],
    },
    {
      name: "Gold Reviewer",
      threshold: "25 - 49 approved reviews (85% score)",
      dailyCap: "KES 3,500 Daily Cap",
      icon: Trophy,
      highlight: true,
      iconColor: "text-amber-600 bg-amber-50 border-amber-300",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      perks: [
        "All Silver perks included",
        "Sponsored physical product testing samples",
        "Voice & audio review bounties unlocked",
        "Dedicated VIP moderation desk",
        "+5% bonus on all completed review tasks",
      ],
    },
    {
      name: "Platinum Reviewer",
      threshold: "50+ approved reviews (90% score)",
      dailyCap: "Unlimited Daily Cap",
      icon: Sparkles,
      iconColor: "text-[#1E6FD9] bg-[#EAF3FF] border-blue-200",
      badgeColor: "bg-[#EAF3FF] text-[#0A3D91] border-blue-200",
      perks: [
        "Unlimited daily bounties without cap",
        "Direct invitations to premium beta brand launches",
        "Instant automated review approval algorithm",
        "+15% permanent streak bonus multiplier",
        "EarnOra Community Ambassador badge",
      ],
    },
  ];

  return (
    <section id="levels" className="py-20 md:py-28 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF3FF] border border-blue-200/70 text-[#1E6FD9] text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Reputation Progression</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F3D] tracking-tight">
            Reviewer Reputation Levels
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7A99] leading-relaxed">
            The more thorough and consistent your honest reviews are, the higher your tier. Advance through four tiers with increasing payout caps and exclusive bounties.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((lvl) => {
            const Icon = lvl.icon;
            return (
              <div
                key={lvl.name}
                className={`rounded-[20px] bg-white border ${
                  lvl.highlight
                    ? "border-[#1E6FD9] ring-2 ring-[#1E6FD9]/20 shadow-[0_12px_36px_rgba(30,111,217,0.15)]"
                    : "border-blue-100/70 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.06)]"
                } p-6 flex flex-col justify-between relative hover:-translate-y-1.5 transition-all duration-200`}
              >
                {lvl.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-[14px] ${lvl.iconColor} border flex items-center justify-center shadow-xs`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${lvl.badgeColor}`}>
                      {lvl.dailyCap}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#0F1F3D]">{lvl.name}</h3>
                  <p className="text-xs text-[#6B7A99] mt-1">
                    {lvl.threshold}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                    {lvl.perks.map((perk) => (
                      <div key={perk} className="flex items-start gap-2 text-xs text-[#0F1F3D]">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
