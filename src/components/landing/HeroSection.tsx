"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wallet,
  Flame,
  CheckCircle2,
  UtensilsCrossed,
  Smartphone,
  Star,
} from "lucide-react";
import { EarnoraSymbol } from "@/components/brand/EarnoraSymbol";
import { CloudDivider } from "@/components/brand/CloudDivider";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#EAF3FF]/80 via-[#F4F8FE] to-[#FFFFFF] overflow-hidden">
      {/* Background ambient soft blue glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] sm:w-[900px] sm:h-[450px] bg-gradient-to-tr from-blue-400/10 via-sky-300/15 to-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-400/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200/80 text-[#1E6FD9] text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kenya&apos;s Verified Review & Earn Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F1F3D] tracking-tight leading-[1.1]">
              Your Honest <br />
              <span className="text-brand-gradient">
                Opinion Pays.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-[#6B7A99] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Earn real cash disbursed directly to your Safaricom M-Pesa line by sharing authentic, first-hand reviews of Kenyan restaurants, mobile apps, local businesses, telcos, and products.
            </p>

            {/* Dual Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 rounded-[12px] bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-blue-btn hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Earning Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <a
                href="#for-businesses"
                className="w-full sm:w-auto px-7 py-4 rounded-[12px] bg-white hover:bg-[#EEF3FF] border border-blue-200 text-[#0A3D91] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              >
                <Building2 className="w-4 h-4 text-[#1E6FD9]" />
                <span>For Businesses</span>
              </a>
            </div>

            {/* Quick Micro-Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-[#6B7A99]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Zero registration fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>Min withdrawal KES 100</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Instant Daraja B2C</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Floating Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            {/* Phone Container */}
            <div className="relative w-[300px] sm:w-[330px] rounded-[36px] bg-white border-[6px] border-[#0F1F3D] shadow-[0_25px_60px_rgba(15,31,61,0.18)] overflow-hidden">
              {/* Speaker / Dynamic Island Notch */}
              <div className="w-28 h-4 bg-[#0F1F3D] mx-auto rounded-b-xl z-20 relative" />

              {/* Blue Gradient Header in Phone */}
              <div className="bg-gradient-to-b from-[#1E6FD9] to-[#0B4FB3] text-white p-5 pt-3 pb-8 text-center relative">
                <div className="flex justify-center mb-1">
                  <EarnoraSymbol size={44} />
                </div>
                <h3 className="font-extrabold text-lg text-white">EarnOra</h3>
                <p className="text-[10px] text-blue-100">Review. Earn. Grow.</p>

                {/* Cloud wave inside phone mockup */}
                <div className="absolute bottom-0 left-0 right-0">
                  <CloudDivider orientation="horizontal" className="h-8" />
                </div>
              </div>

              {/* Inner Phone Content */}
              <div className="p-4 bg-white space-y-3">
                {/* Available Balance Box */}
                <div className="bg-[#EEF3FF] p-3.5 rounded-[16px] border border-blue-100/70">
                  <div className="flex items-center justify-between text-[11px] text-[#6B7A99]">
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-[#1E6FD9]" />
                      Available Balance
                    </span>
                    <span className="font-bold text-[#16A34A]">M-Pesa Ready</span>
                  </div>
                  <div className="text-2xl font-black text-[#0F1F3D] numeral-bold mt-1">
                    KES 1,450.00
                  </div>
                </div>

                {/* Simulated Earning Card 1 */}
                <div className="p-3 rounded-[14px] bg-white border border-blue-100 shadow-xs flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F1F3D]">Java House Kimathi</p>
                      <p className="text-[10px] text-[#6B7A99]">Dining review approved</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#16A34A] numeral-bold">
                    +KES 450
                  </span>
                </div>

                {/* Simulated Earning Card 2 */}
                <div className="p-3 rounded-[14px] bg-white border border-blue-100 shadow-xs flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F1F3D]">Hustler Fund App</p>
                      <p className="text-[10px] text-[#6B7A99]">UX testing review</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#16A34A] numeral-bold">
                    +KES 300
                  </span>
                </div>

                {/* Simulated Streak Tracker */}
                <div className="p-2.5 rounded-[12px] bg-[#EAF3FF] border border-blue-200/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#0A3D91]">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>5-Day Review Streak</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#16A34A]">+20% Bonus</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
