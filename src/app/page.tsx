"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EARNING_CARDS, BRAND_TAGLINE, BRAND_HERO_HEADLINE } from "@/lib/constants";
import { EarningCard } from "@/components/cards/EarningCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Wallet, Clock, Flame, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [filterQuery, setFilterQuery] = useState("");

  // Category earnings from user data (fallback to 0.00)
  const categoryEarnings: Record<string, number> = {
    hotels_restaurants: 450.0,
    apps_websites: 300.0,
    local_services: 0.0,
    telco_fintech: 0.0,
    public_services: 0.0,
    paid_surveys: 0.0,
    product_testing: 0.0,
    watch_answer: 0.0,
    daily_checkin: 25.0,
    refer_earn: 150.0,
  };

  const filteredCards = EARNING_CARDS.filter(
    (card) =>
      card.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      card.tag.toLowerCase().includes(filterQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Branding Header */}
      <section className="relative rounded-[22px] bg-gradient-to-br from-emerald-950/70 via-[#0C1A33] to-[#08101E] border border-emerald-500/25 p-6 shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{BRAND_TAGLINE}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight max-w-xl">
            {BRAND_HERO_HEADLINE}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
            Get rewarded for genuine, first-hand reviews of Kenyan restaurants, mobile apps, local businesses, telcos, and products. Verified payouts directly to your M-Pesa.
          </p>

          {/* Quick User Balance Card */}
          {user && (
            <div className="mt-5 grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-700/60">
              <div className="bg-slate-900/70 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  <span>Available</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 numeral-bold">
                  KES {user.availableBalance.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-900/70 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Pending</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-amber-300 mt-0.5 numeral-bold">
                  KES {user.pendingBalance.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-900/70 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-700/40">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>Streak</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-orange-400 mt-0.5">
                  {user.streakDays} Days
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Network Indicator */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Safaricom Daraja B2C Verified Payouts</span>
        </div>
        <Link
          href="/earn"
          className="text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
        >
          <span>All Tasks</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Ten Earning Cards Vertical Stack */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
            Earning Categories
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {EARNING_CARDS.length} Active Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <EarningCard
              key={card.id}
              card={card}
              userEarnedKes={categoryEarnings[card.id] || 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
