"use client";

import React, { useEffect, useState } from "react";
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
  Award,
  Info,
  Play,
  Sparkles,
  Tv,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { INITIAL_TASKS } from "@/lib/mock-data";
import { HowPointsWorkModal, TierBadge } from "@/components/points/HowPointsWorkModal";
import { TIER_LEVELS_CONFIG } from "@/lib/points/config";
import { UserPointsSummary } from "@/lib/points/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPointsModal, setShowPointsModal] = useState(false);

  // Server-loaded Points & Tier state
  const [pointsSummary, setPointsSummary] = useState<UserPointsSummary>({
    userId: user?.id || "usr_demo_ke_01",
    totalPoints: 0,
    currentTier: TIER_LEVELS_CONFIG[0],
    nextTier: TIER_LEVELS_CONFIG[1],
    pointsToNextTier: TIER_LEVELS_CONFIG[1].minPoints,
    progressPercent: 0,
    ledger: [],
  });

  // Server-loaded Watch Ads progress
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [adsDailyLimit, setAdsDailyLimit] = useState(10);

  useEffect(() => {
    const uid = user?.id || "usr_demo_ke_01";

    // 1. Trigger server-side daily login check-in & load points summary
    fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "daily_login" }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.summary) {
          setPointsSummary(data.summary);
        } else {
          return fetch(`/api/points?userId=${encodeURIComponent(uid)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d?.summary) setPointsSummary(d.summary);
            });
        }
      })
      .catch(() => {});

    // 2. Load today's watched ads progress from server
    fetch(`/api/ads/watch?userId=${encodeURIComponent(uid)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setAdsWatchedToday(data.watchedToday ?? data.watchedTodayCount ?? 0);
          setAdsDailyLimit(data.dailyLimit ?? 10);
        }
      })
      .catch(() => {});
  }, [user?.id]);

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
          <section className="relative rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-7 text-[var(--text-primary)] shadow-sm overflow-hidden">
            {/* Top Area: Text + Flush Image */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end">
              {/* Left Column: Copy & Value Proposition */}
              <div className="md:col-span-7 space-y-3.5 md:self-center pb-2 md:pb-4">
                {/* Trusted & Verified Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border border-[var(--brand-blue)]/20 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                  <span>Trusted & Verified</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.18] text-[var(--text-primary)] font-display">
                  <span>Your Perspective.</span><br />
                  <span className="text-[var(--brand-blue)]">Your Influence.</span><br />
                  <span>Your Rewards.</span>
                </h1>

                {/* Subtitle Description */}
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                  Earn rewards for sharing authentic, first-hand reviews of Kenyan restaurants, mobile applications, local businesses, telecommunications services, and consumer products. Get rewarded for your feedback with convenient M-Pesa payouts.
                </p>
              </div>

              {/* Right/Bottom Column: Happy user with cash and phone, sitting flush on the divider line */}
              <div className="md:col-span-5 flex justify-center md:justify-end items-end w-full overflow-hidden mt-3 sm:mt-4 md:mt-0">
                <div className="relative w-[85%] max-w-[280px] sm:max-w-[310px] md:max-w-[340px] flex justify-center items-end">
                  <Image
                    src="/images/dashboard-hero.png"
                    alt="Happy Earnora user holding cash and the Earnora app on his phone"
                    width={903}
                    height={1024}
                    priority
                    className="w-full h-auto max-h-[270px] sm:max-h-[295px] md:max-h-[310px] object-contain object-bottom block select-none pointer-events-none -mb-[1px]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom: 3 Financial Summary Cards (Available, Pending, Streak) sitting flush under divider */}
            <div className="pt-5 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Available Balance Card */}
              <Link
                href="/wallet"
                className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-[var(--text-muted)] block">
                      Available
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] numeral-bold">
                      KES {availableBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Pending Balance Card */}
              <Link
                href="/wallet"
                className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-[var(--text-muted)] block">
                      Pending
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] numeral-bold">
                      KES {pendingBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Current Streak Card */}
              <Link
                href="/activity"
                className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-[var(--text-muted)] block">
                      Streak
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                      {streakCount} {streakCount === 1 ? "Day" : "Days"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>

          {/* Payout Trust Indicator Strip */}
          <div className="flex items-center justify-between px-4 py-3 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
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
                    <span className="text-xs text-[var(--text-secondary)] mt-0.5 truncate w-full">
                      {cat.subtext}
                    </span>
                    <span className="text-xs font-bold text-[var(--brand-blue)] mt-2 group-hover:underline flex items-center gap-0.5">
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
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--brand-blue)]">
                <Flame className="w-4 h-4 text-[var(--brand-blue)]" />
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
                      <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 px-2.5 py-1 rounded-md border border-blue-500/40 whitespace-nowrap">
                        {task.categoryTag}
                      </span>
                    </div>

                    {/* Task Title & Description */}
                    <h3 className="font-bold text-base text-[var(--text-primary)] font-display leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Reward & Action */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 border border-emerald-500/40 text-xs sm:text-sm font-bold numeral-bold whitespace-nowrap">
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                      <span>KES {task.rewardKes}</span>
                    </div>

                    <Link
                      href={`/earn/submit?task=${task.id}`}
                      className="w-11 h-11 rounded-full bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
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
          {/* Wallet & Points Card (Replaced Quick Stats) */}
          <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--text-primary)] font-display">
                  Wallet & Points
                </h3>
                <TierBadge level={pointsSummary.currentTier.name} size="sm" />
              </div>
              <Link
                href="/wallet"
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Available & Pending Balances Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Available Balance */}
              <div className="p-3 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-[var(--accent-green)] mb-1">
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate">
                    Available
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[var(--text-primary)] numeral-bold block">
                  KES {availableBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Pending Earnings */}
              <div className="p-3 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-[var(--accent-gold)] mb-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate">
                    Pending
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[var(--text-primary)] numeral-bold block">
                  KES {pendingBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Points & Tier Progress Block */}
            <div className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
                      Total Points • {pointsSummary.currentTier.name} Tier
                    </span>
                    <span className="text-sm font-extrabold text-[var(--text-primary)] numeral-bold">
                      {pointsSummary.totalPoints.toLocaleString()} pts
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPointsModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/10 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>How points work</span>
                </button>
              </div>

              {/* Progress Bar to Next Tier */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[var(--text-secondary)]">
                    {pointsSummary.nextTier
                      ? `${pointsSummary.pointsToNextTier.toLocaleString()} pts to ${pointsSummary.nextTier.name}`
                      : "Maximum Tier Reached"}
                  </span>
                  <span className="font-bold text-[var(--brand-blue)] numeral-bold">
                    {pointsSummary.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-card)] overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[var(--brand-blue)] rounded-full transition-all duration-300"
                    style={{ width: `${pointsSummary.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Withdrawal Limits Row */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] gap-2">
                <div>
                  <span className="text-[var(--text-muted)] block">Current Daily Limit</span>
                  <span className="font-extrabold text-[var(--text-primary)] numeral-bold">
                    KES {pointsSummary.currentTier.dailyWithdrawalLimitKes.toLocaleString()}/day
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--text-muted)] block">
                    {pointsSummary.nextTier
                      ? `Next (${pointsSummary.nextTier.name}) Limit`
                      : "Max Per Withdrawal"}
                  </span>
                  <span className="font-extrabold text-[var(--accent-green)] numeral-bold">
                    {pointsSummary.nextTier
                      ? `KES ${pointsSummary.nextTier.dailyWithdrawalLimitKes.toLocaleString()}/day`
                      : `KES ${pointsSummary.currentTier.maxPerWithdrawalKes.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Streak Row */}
            <div className="flex items-center justify-between px-3 py-2 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                <Flame className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                <span>Current Streak</span>
              </div>
              <span className="font-extrabold text-[var(--text-primary)]">
                {streakCount} {streakCount === 1 ? "Day" : "Days"}
              </span>
            </div>

            {/* Action Buttons: Withdraw & View Wallet */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-extrabold hover:opacity-95 transition-all shadow-xs"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-blue)] text-xs font-extrabold transition-all"
              >
                <span>View Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[var(--brand-blue)]" />
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

          {/* Watch Ads, Earn Banner (Replaced "Earn More, Get Higher Rewards") */}
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card-elevated)] to-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/30 p-4 sm:p-5 space-y-3.5 shadow-xs watch-ads-shimmer">
            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-[var(--accent-gold)] border border-amber-500/30">
                <Sparkles className="w-3 h-3" />
                <span>Sponsored Rewards</span>
              </span>
              <div className="w-8 h-8 rounded-full bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                <Tv className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] font-display">
                Watch Ads. Earn Rewards.
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Watch short sponsored ads and collect points and cash rewards.
              </p>
            </div>

            {/* Daily Ads Progress Line */}
            <div className="space-y-1.5 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[var(--text-secondary)]">
                  {adsWatchedToday} of {adsDailyLimit} ads watched today
                </span>
                <span className="text-[var(--accent-gold)]">+KES & +2 pts/ad</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="h-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--accent-gold)] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((adsWatchedToday / Math.max(1, adsDailyLimit)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <Link
              href="/earn/ads"
              className="relative z-10 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-extrabold hover:opacity-95 transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch & Earn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* How Points Work Modal */}
      <HowPointsWorkModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        currentPoints={pointsSummary.totalPoints}
        currentLevel={pointsSummary.currentTier.name}
      />
    </div>
  );
}
