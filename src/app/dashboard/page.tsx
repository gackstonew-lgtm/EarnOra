"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EARNING_CARDS, BRAND_TAGLINE, BRAND_HERO_HEADLINE } from "@/lib/constants";
import { EarningCard } from "@/components/cards/EarningCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Wallet, Clock, Flame, ShieldCheck, Sparkles, Search } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [filterQuery, setFilterQuery] = useState("");

  const isMockAllowed = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  // Use dynamic user category breakdown if available, or zero for new users
  const categoryEarnings: Record<string, number> = isMockAllowed && user?.id === "usr_demo_ke_01"
    ? {
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
      }
    : {
        hotels_restaurants: 0.0,
        apps_websites: 0.0,
        local_services: 0.0,
        telco_fintech: 0.0,
        public_services: 0.0,
        paid_surveys: 0.0,
        product_testing: 0.0,
        watch_answer: 0.0,
        daily_checkin: 0.0,
        refer_earn: 0.0,
      };

  const isDarajaProduction = process.env.NEXT_PUBLIC_DARAJA_ENV === "production" || process.env.DARAJA_ENV === "production";

  const filteredCards = EARNING_CARDS.filter(
    (card) =>
      card.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      card.tag.toLowerCase().includes(filterQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Branding Header (Royal Blue Gradient) */}
      <section className="relative rounded-[24px] bg-gradient-to-br from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] p-6 sm:p-8 text-white shadow-[0_12px_36px_rgba(11,79,179,0.22)] overflow-hidden">
        {/* Decorative blur glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-sky-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            <span>{BRAND_TAGLINE}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
            {BRAND_HERO_HEADLINE}
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-lg leading-relaxed">
            Get rewarded for genuine, first-hand reviews of Kenyan restaurants, mobile apps, local businesses, telcos, and products. Verified payouts directly to your M-Pesa.
          </p>

          {/* Quick User Balance Cards */}
          {user && (
            <div className="mt-6 grid grid-cols-3 gap-2.5 pt-5 border-t border-white/20">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-[16px] border border-white/15">
                <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-semibold">
                  <Wallet className="w-3 h-3 text-emerald-300" />
                  <span>Available</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 numeral-bold">
                  KES {(user.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-[16px] border border-white/15">
                <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-semibold">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>Pending</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-amber-300 mt-0.5 numeral-bold">
                  KES {(user.pendingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-[16px] border border-white/15">
                <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-semibold">
                  <Flame className="w-3 h-3 text-orange-300" />
                  <span>Streak</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-orange-300 mt-0.5">
                  {user.streakDays ?? 0} Days
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Network Indicator */}
      <div className="flex items-center justify-between px-2 text-xs text-[#6B7A99]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>
            {isDarajaProduction
              ? "Safaricom Daraja B2C Verified Payouts"
              : "Payouts enabled via Safaricom M-Pesa"}
          </span>
        </div>
        <Link
          href="/earn"
          className="text-[#1E6FD9] font-bold hover:underline"
        >
          View all tasks →
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7A99]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Search categories (e.g. Restaurants, Apps, Telco)..."
          className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] placeholder-[#6B7A99] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
        />
      </div>

      {/* Categories Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card) => (
          <EarningCard
            key={card.id}
            card={card}
            userEarnedKes={categoryEarnings[card.id] || 0}
          />
        ))}
      </section>
    </div>
  );
}
