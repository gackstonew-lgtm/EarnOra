"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  BarChart3,
  Users2,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
} from "lucide-react";

export const ForBusinesses: React.FC = () => {
  const benefits = [
    {
      title: "100% Real Customer Feedback",
      description:
        "No bot farms or ghost profiles. Real verified Kenyans sharing actual, first-hand customer experiences at your branches or on your app.",
      icon: Users2,
    },
    {
      title: "AI Sentiment Intelligence Dashboard",
      description:
        "Automatically synthesize hundreds of reviews into actionable themes: customer service speed, pricing perception, food freshness, or app crashes.",
      icon: BarChart3,
    },
    {
      title: "Self-Service Campaign Builder",
      description:
        "Select targeted towns (Nairobi, Mombasa, Eldoret, Nakuru), define review requirements, set custom bounties, and fund directly via M-Pesa Paybill.",
      icon: Sliders,
    },
  ];

  return (
    <section id="for-businesses" className="py-20 bg-white border-y border-blue-100/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-gradient-to-br from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] p-8 sm:p-12 shadow-[0_15px_50px_rgba(11,79,179,0.22)] relative overflow-hidden text-white">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wide border border-white/20">
                <Building2 className="w-3.5 h-3.5 text-sky-200" />
                <span>EarnOra For Merchants & Brands</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Understand What Your Kenyan Customers Really Think.
              </h2>

              <p className="text-sm text-blue-100 leading-relaxed max-w-xl">
                Tired of fake 5-star spam or unverified Google Maps attacks? Sponsor verified review bounties to gather authentic, constructive feedback that helps your team improve operations.
              </p>

              {/* 3 Value Pillars */}
              <div className="space-y-4 pt-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-[12px] bg-white/15 backdrop-blur-xs text-white border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{b.title}</h4>
                        <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campaign CTA Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/business"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-[12px] bg-white hover:bg-slate-50 text-[#0A3D91] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch a Campaign</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-blue-100 px-3 py-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Pay only per approved review</span>
                </div>
              </div>
            </div>

            {/* Right Mock Analytics Card (Crisp White Card) */}
            <div className="lg:col-span-5">
              <div className="rounded-[20px] bg-white border border-blue-100 p-6 shadow-2xl text-[#0F1F3D] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="font-bold text-xs text-[#0F1F3D]">
                      Live Merchant Dashboard
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1E6FD9] px-2 py-0.5 rounded-full bg-[#EAF3FF]">
                    Artcaffé Westgate
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-[12px] bg-[#EEF3FF] border border-blue-100/60">
                    <span className="text-[10px] font-semibold text-[#6B7A99]">Verified Reviews</span>
                    <p className="text-xl font-black text-[#0F1F3D] numeral-bold mt-0.5">342</p>
                    <span className="text-[10px] font-bold text-[#16A34A]">+24% this week</span>
                  </div>
                  <div className="p-3 rounded-[12px] bg-[#EEF3FF] border border-blue-100/60">
                    <span className="text-[10px] font-semibold text-[#6B7A99]">Average Rating</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-xl font-black text-[#0F1F3D] numeral-bold">4.6</p>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#6B7A99]">88% positive sentiment</span>
                  </div>
                </div>

                {/* Sentiment themes */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-[#0F1F3D]">Key Customer Insights</div>
                  <div className="p-2.5 rounded-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between">
                    <span>Barista Coffee Quality</span>
                    <span className="font-bold">96% Praise</span>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-sky-50 text-sky-800 border border-sky-200 text-xs flex items-center justify-between">
                    <span>Weekend Waiter Speed</span>
                    <span className="font-bold">78% Positive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
