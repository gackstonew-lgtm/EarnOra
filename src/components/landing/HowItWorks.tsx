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
      iconColor: "text-[#1E6FD9] bg-[#EEF3FF]",
    },
    {
      step: "02",
      title: "Review & Complete Tasks",
      description:
        "Select tasks in dining, mobile apps, telcos, or surveys. Submit structured, honest feedback with a 50-word minimum, genuine pros & cons, or photo receipts.",
      icon: Edit3,
      iconColor: "text-[#0A3D91] bg-[#EAF3FF]",
    },
    {
      step: "03",
      title: "Withdraw to M-Pesa",
      description:
        "Once your review passes automated and human moderation, bounty funds credit your available balance immediately. Withdraw directly to M-Pesa from KES 100.",
      icon: ArrowDownToLine,
      iconColor: "text-[#16A34A] bg-emerald-50",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF3FF] border border-blue-200/70 text-[#1E6FD9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1F3D] tracking-tight">
            How EarnOra Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7A99] leading-relaxed">
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
                className="relative rounded-[20px] bg-white border border-blue-100/70 p-7 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.06)] hover:shadow-[0_12px_32px_rgba(30,111,217,0.1)] hover:border-[#1E6FD9]/40 transition-all group"
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-[14px] ${item.iconColor} border border-blue-100/60 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="text-3xl font-black text-blue-100/90 tracking-tighter">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-[#0F1F3D] group-hover:text-[#1E6FD9] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7A99] mt-2.5 leading-relaxed">
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
