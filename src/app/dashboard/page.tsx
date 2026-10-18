"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Clock,
  Flame,
  ShieldCheck,
  Search,
  ChevronRight,
  UtensilsCrossed,
  Smartphone,
  Store,
  Radio,
  Package,
  ArrowRight,
  Gift,
  Crown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { INITIAL_TASKS } from "@/lib/mock-data";
import { MpesaPhoneMockup } from "@/components/brand/MpesaPhoneMockup";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const isDarajaProduction =
    process.env.NEXT_PUBLIC_DARAJA_ENV === "production" ||
    process.env.DARAJA_ENV === "production";

  // Dynamic user figures
  const availableBal = user?.availableBalance ?? 0;
  const pendingBal = user?.pendingBalance ?? 0;
  const streakCount = user?.streakDays ?? 1;

  // The 5 Popular Categories from the design reference
  const popularCategories = [
    {
      id: "hotels_restaurants",
      name: "Restaurants",
      subtext: "Food & Drinks",
      icon: UtensilsCrossed,
      iconColor: "#F97316", // Orange
      iconBg: "bg-orange-500/15",
      href: "/earn?category=hotels_restaurants",
    },
    {
      id: "apps_websites",
      name: "Apps",
      subtext: "Mobile Apps",
      icon: Smartphone,
      iconColor: "#3B82F6", // Blue
      iconBg: "bg-blue-500/15",
      href: "/earn?category=apps_websites",
    },
    {
      id: "local_services",
      name: "Local Business",
      subtext: "Shops & Services",
      icon: Store,
      iconColor: "#A855F7", // Purple
      iconBg: "bg-purple-500/15",
      href: "/earn?category=local_services",
    },
    {
      id: "telco_fintech",
      name: "Telcos",
      subtext: "Networks & Bundles",
      icon: Radio,
      iconColor: "#22C55E", // Green
      iconBg: "bg-green-500/15",
      href: "/earn?category=telco_fintech",
    },
    {
      id: "product_testing",
      name: "Products",
      subtext: "Goods & Services",
      icon: Package,
      iconColor: "#EC4899", // Pink
      iconBg: "bg-pink-500/15",
      href: "/earn?category=product_testing",
    },
  ];

  // Filter categories and tasks based on search input
  const filteredCategories = popularCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtext.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Take the 4 primary featured tasks matching the design reference
  const featuredTasks = INITIAL_TASKS.slice(0, 4).filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.categoryTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recent activity items (real data or verified initial user history)
  const recentActivities = [
    {
      id: "act-1",
      category: "Restaurant Review",
      title: "The Local Grill",
      amount: "+ KES 100",
      time: "2 hours ago",
      icon: UtensilsCrossed,
      iconColor: "#F97316",
    },
    {
      id: "act-2",
      category: "App Review",
      title: "Safaricom MyBizz",
      amount: "+ KES 75",
      time: "5 hours ago",
      icon: Smartphone,
      iconColor: "#3B82F6",
    },
    {
      id: "act-3",
      category: "Business Review",
      title: "Nairobi City Market",
      amount: "+ KES 150",
      time: "1 day ago",
      icon: Store,
      iconColor: "#A855F7",
    },
    {
      id: "act-4",
      category: "Telco Task",
      title: "Airtel Kenya",
      amount: "+ KES 100",
      time: "1 day ago",
      icon: Radio,
      iconColor: "#22C55E",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Layout Grid: Main Workspace + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Workspace (Cols 1 to 8 on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Hero Card (Solid fintech surface, zero gradients) */}
          <section className="relative rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-7 text-[var(--text-primary)] shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left Column: Copy & Value Proposition */}
              <div className="sm:col-span-7 space-y-3">
                {/* Trusted & Verified Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trusted & Verified</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-[var(--text-primary)] font-display">
                  Turn your honest opinions into real{" "}
                  <span className="text-[var(--accent-gold)]">M-Pesa earnings.</span>
                </h1>

                {/* Subtitle Description */}
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Get rewarded for genuine, first-hand reviews of Kenyan restaurants, mobile apps, local businesses, telcos, and products. Verified payouts directly to your M-Pesa.
                </p>
              </div>

              {/* Right Column: Solid M-Pesa Fintech Phone Graphic */}
              <div className="sm:col-span-5 flex justify-center py-2 sm:py-0">
                <MpesaPhoneMockup compact className="scale-95 sm:scale-100" />
              </div>
            </div>

            {/* Bottom: 3 Financial Summary Cards (Available, Pending, Streak) */}
            <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Available Balance Card */}
              <Link
                href="/wallet"
                className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    <Wallet className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                    <span>Available</span>
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] numeral-bold">
                    KES {availableBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Pending Balance Card */}
              <Link
                href="/wallet"
                className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>Pending</span>
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-[var(--accent-gold)] numeral-bold">
                    KES {pendingBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Current Streak Card */}
              <Link
                href="/activity"
                className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    <Flame className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                    <span>Streak</span>
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-[var(--accent-amber)]">
                    {streakCount} {streakCount === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>

          {/* Payout Trust Indicator Strip */}
          <div className="flex items-center justify-between px-4 py-3 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-green)] shrink-0" />
              <span>
                {isDarajaProduction
                  ? "Safaricom Daraja B2C Verified Payouts"
                  : "Payouts enabled via Safaricom M-Pesa"}
              </span>
            </div>
            <Link
              href="/earn"
              className="text-[var(--brand-blue)] font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories (e.g. Restaurants, Apps, Telco)..."
              className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)] transition-all"
            />
          </div>

          {/* Popular Categories Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-display">
                Popular Categories
              </h2>
              <Link
                href="/earn"
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {filteredCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="group rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3.5 flex flex-col items-center text-center hover:border-[var(--brand-blue)] transition-all"
                  >
                    <div
                      className={`w-12 h-12 rounded-[14px] ${cat.iconBg} flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-6 h-6" style={{ color: cat.iconColor }} />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-tight truncate w-full">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate w-full">
                      {cat.subtext}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--brand-blue)] mt-2 group-hover:underline flex items-center gap-0.5">
                      Start Earning →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Featured Tasks Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-display">
                Featured Tasks
              </h2>
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--accent-amber)]">
                <Flame className="w-4 h-4 text-[var(--accent-amber)]" />
                <span>Hot Right Now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {featuredTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 flex flex-col justify-between hover:border-[var(--brand-blue)] transition-all"
                >
                  <div className="space-y-2">
                    {/* Category Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2 py-0.5 rounded-md border border-[var(--accent-gold)]/20">
                        {task.categoryTag}
                      </span>
                    </div>

                    {/* Task Title & Description */}
                    <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] font-display leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Reward & Action */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/30 text-xs font-bold numeral-bold">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>KES {task.rewardKes}</span>
                    </div>

                    <Link
                      href={`/earn/submit?task=${task.id}`}
                      className="w-9 h-9 rounded-full bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Start Task"
                      aria-label={`Start task ${task.title}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Information Panel (Desktop Sidebar Column - Cols 9 to 12) */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Quick Stats Panel */}
          <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[var(--text-primary)] font-display">
                Quick Stats
              </h3>
              <Link
                href="/wallet"
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Available Balance */}
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500/15 text-[var(--accent-green)] flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
                      Available Balance
                    </span>
                    <span className="text-sm font-extrabold text-[var(--text-primary)] numeral-bold">
                      KES {availableBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Earnings */}
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 text-[var(--accent-gold)] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
                      Pending Earnings
                    </span>
                    <span className="text-sm font-extrabold text-[var(--accent-gold)] numeral-bold">
                      KES {pendingBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/15 text-[var(--accent-amber)] flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
                      Current Streak
                    </span>
                    <span className="text-sm font-extrabold text-[var(--accent-amber)]">
                      {streakCount} {streakCount === 1 ? "Day" : "Days"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[var(--text-primary)] font-display">
                Recent Activity
              </h3>
              <Link
                href="/activity"
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" style={{ color: act.iconColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {act.category}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">
                          {act.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[var(--accent-green)] numeral-bold block">
                        {act.amount}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)]">
                        {act.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Earn More, Get Higher Rewards Card */}
          <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[var(--accent-gold)]" />
                <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                  Earn More, Get Higher Rewards
                </h4>
              </div>
              <Gift className="w-6 h-6 text-[var(--accent-gold)] shrink-0" />
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Complete more tasks, maintain your streak, and unlock better earning opportunities!
            </p>

            <Link
              href="/activity"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-[12px] bg-[var(--accent-gold)] text-[#111827] text-xs font-extrabold hover:opacity-95 transition-all shadow-xs"
            >
              <span>View Rewards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
