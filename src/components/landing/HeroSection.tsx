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

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background soft ambient gradient glows (Violet, Teal, Emerald) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] sm:w-[900px] sm:h-[450px] bg-gradient-to-tr from-violet-600/15 via-teal-500/15 to-emerald-500/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kenya&apos;s Verified Review & Earn Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Your Honest <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Opinion Pays.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Earn real cash disbursed directly to your Safaricom M-Pesa line by sharing authentic, first-hand reviews of Kenyan restaurants, mobile apps, local businesses, telcos, and products.
            </p>

            {/* Dual Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Earning Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <a
                href="#for-businesses"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>For Businesses</span>
              </a>
            </div>

            {/* Quick Micro-Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero registration fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Min withdrawal KES 100</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/20 to-emerald-500/10 blur-3xl rounded-full" />

            {/* Floating Container with motion */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[38px] p-3.5 bg-gradient-to-b from-slate-700/60 via-slate-800/60 to-slate-900/80 border border-slate-600/50 shadow-2xl backdrop-blur-2xl"
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-10 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Screen Canvas */}
              <div className="rounded-[30px] bg-[#070C18] border border-slate-800 overflow-hidden pt-8 pb-5 px-3.5 space-y-3.5 text-white">
                {/* Mock Phone App Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <EarnoraSymbol size={26} />
                    <span className="font-extrabold text-sm tracking-tight">Earnora</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>M-Pesa Connected</span>
                  </div>
                </div>

                {/* Animated Earning Counter Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F1E3D] via-[#0D2447] to-[#071326] border border-emerald-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Available Balance</span>
                    <span className="flex items-center gap-1 text-orange-400 font-bold">
                      <Flame className="w-3 h-3" />
                      <span>4-Day Streak</span>
                    </span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="text-2xl font-black tracking-tight text-white numeral-bold mt-1"
                  >
                    KES 850.00
                  </motion.div>
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Recent Payout:</span>
                    <span className="font-bold text-emerald-400">+KES 450.00 Disbursed</span>
                  </div>
                </div>

                {/* Live Card Stack Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Active Review Bounties
                  </span>

                  {/* Card 1: Hotel */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0F1E36] to-[#132442] border border-blue-500/30 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          Java House Kimathi St
                        </p>
                        <p className="text-[10px] text-slate-300">Dining & Coffee Review</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 numeral-bold">
                      KES 450
                    </span>
                  </div>

                  {/* Card 2: App */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0A262C] to-[#0E3339] border border-teal-500/30 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          M-Pesa App UX Review
                        </p>
                        <p className="text-[10px] text-slate-300">Biometric & Global Pay</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 numeral-bold">
                      KES 300
                    </span>
                  </div>
                </div>

                {/* Bottom Nav Simulation Pill */}
                <div className="pt-1 flex items-center justify-around py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-bold">● Home</span>
                  <span>Tasks</span>
                  <div className="w-7 h-7 -mt-2 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <span>Activity</span>
                  <span>Menu</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
