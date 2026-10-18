"use client";

import React from "react";
import { UserCheck, Edit3, ArrowDownToLine, Sparkles } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Sign Up & Verify Phone",
      description:
        "Create your free account in under 60 seconds. Verify your Kenyan phone number with a secure SMS OTP. Zero joining fees or activation payments.",
      icon: UserCheck,
      color: "from-blue-500/20 to-teal-500/20 text-blue-400 border-blue-500/30",
    },
    {
      step: "02",
      title: "Review & Complete Tasks",
      description:
        "Select tasks in dining, mobile apps, telcos, or surveys. Submit structured, honest feedback with a 50-word minimum, genuine pros & cons, or photo receipts.",
      icon: Edit3,
      color: "from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30",
    },
    {
      step: "03",
      title: "Withdraw to M-Pesa",
      description:
        "Once your review passes automated and human moderation, bounty funds credit your available balance immediately. Withdraw directly to M-Pesa from KES 100.",
      icon: ArrowDownToLine,
      color: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How EarnOra Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            No complicated tokens or confusing points. You submit real, constructive feedback and receive Kenyan Shillings sent straight to your phone.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-[26px] bg-gradient-to-b from-[#0F1A2E]/90 to-[#0A111E]/90 border border-slate-800 p-7 shadow-xl hover:border-slate-700 transition-all group"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-700/80 tracking-tighter">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
