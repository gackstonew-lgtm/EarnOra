"use client";

import React from "react";
import { Award, Check, Sparkles, Shield, Trophy } from "lucide-react";

export const ReviewerLevels: React.FC = () => {
  const levels = [
    {
      name: "Bronze Reviewer",
      threshold: "Starting Level (0 - 9 approved reviews)",
      dailyCap: "KES 500 Daily Earning Cap",
      icon: Shield,
      cardColor: "from-amber-950/40 via-amber-900/20 to-slate-900/80 border-amber-800/40",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      perks: [
        "Access to standard dining and app reviews",
        "Direct M-Pesa withdrawals from KES 100",
        "Daily streak multiplier eligibility",
        "Community leaderboard ranking",
      ],
    },
    {
      name: "Silver Reviewer",
      threshold: "10 - 24 approved reviews (min 80% quality score)",
      dailyCap: "KES 1,500 Daily Earning Cap",
      icon: Award,
      cardColor: "from-slate-800/40 via-slate-700/20 to-slate-900/80 border-slate-600/50",
      badgeColor: "bg-slate-300/20 text-slate-200 border-slate-400/30",
      perks: [
        "All Bronze perks included",
        "Higher priority task queue access",
        "Paid research survey eligibility (up to KES 600)",
        "Accelerated 12-hour moderation turnaround",
      ],
    },
    {
      name: "Gold Reviewer",
      threshold: "25 - 49 approved reviews (min 85% quality score)",
      dailyCap: "KES 3,500 Daily Earning Cap",
      icon: Trophy,
      highlight: true,
      cardColor: "from-amber-500/15 via-yellow-600/15 to-[#0F1E3D] border-amber-400/50 shadow-amber-500/10",
      badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/40",
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
      threshold: "50+ approved reviews (min 90% quality score)",
      dailyCap: "Unlimited Daily Earning Cap",
      icon: Sparkles,
      cardColor: "from-emerald-500/15 via-teal-500/15 to-[#0B1528] border-emerald-400/50 shadow-emerald-500/15",
      badgeColor: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
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
    <section id="levels" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Reputation Progression</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Reviewer Reputation Levels
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
                className={`rounded-[26px] bg-gradient-to-br ${lvl.cardColor} border p-6 shadow-xl flex flex-col justify-between relative backdrop-blur-md hover:-translate-y-1.5 transition-all duration-200`}
              >
                {lvl.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-black/40 border border-slate-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-400 stroke-[2.2]" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${lvl.badgeColor}`}
                    >
                      Tier
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-white">{lvl.name}</h3>
                  <p className="text-[11px] text-slate-300 font-semibold mt-1">
                    {lvl.threshold}
                  </p>
                  <p className="text-xs font-black text-emerald-400 mt-2 numeral-bold">
                    {lvl.dailyCap}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-700/60 space-y-2.5">
                    {lvl.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3">
                  <span className="text-[10px] text-slate-400 block text-center">
                    Level up via verified quality reviews
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
