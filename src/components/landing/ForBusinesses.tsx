"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  BarChart3,
  Users2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
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
    <section id="for-businesses" className="py-20 bg-[#0B1426]/70 border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[30px] bg-gradient-to-br from-[#0F1E3D] via-[#0B1528] to-[#070C18] border border-blue-500/25 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5" />
                <span>EarnOra For Merchants & Brands</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Understand What Your Kenyan Customers Really Think.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Tired of fake 5-star spam or unverified Google Maps attacks? Sponsor verified review bounties to gather authentic, constructive feedback that helps your team improve operations.
              </p>

              {/* 3 Value Pillars */}
              <div className="space-y-4 pt-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{b.title}</h4>
                        <p className="text-xs text-slate-300/80 mt-0.5 leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campaign CTA Button */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/business"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch a Campaign</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 px-3 py-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No long-term contracts • Pay only per approved review</span>
                </div>
              </div>
            </div>

            {/* Right Mock Analytics Card */}
            <div className="lg:col-span-5">
              <div className="rounded-[24px] bg-[#0A101D] border border-slate-700/80 p-5 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">
                    Merchant Sentiment Pulse
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                    Live Demo Preview
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Verified Reviews
                    </span>
                    <span className="text-lg font-black text-white mt-1 block">
                      128
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Average Rating
                    </span>
                    <span className="text-lg font-black text-amber-400 mt-1 block">
                      4.2 / 5.0
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    AI Topic Breakdown:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Customer Care & Courtesy</span>
                        <span className="text-emerald-400 font-bold">88% Positive</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full w-[88%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Wait Times & Queue Speed</span>
                        <span className="text-amber-400 font-bold">64% Positive</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full w-[64%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  <span>
                    Merchants cannot suppress honest negative feedback. Constructive critiques are highlighted for internal resolution.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
