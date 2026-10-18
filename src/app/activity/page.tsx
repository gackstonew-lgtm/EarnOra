"use client";

import React, { useState } from "react";
import {
  Users,
  Flame,
  Award,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LEADERBOARD_USERS } from "@/lib/mock-data";

export default function ActivityPage() {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"referrals" | "streak" | "leaderboard">("referrals");
  const [copiedLink, setCopiedLink] = useState(false);
  const [streakClaimed, setStreakClaimed] = useState(false);

  const refCode = user?.referralCode || "EARN-KE-88";
  const shareLink = `http://localhost:3005/auth/register?ref=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join Earnora and earn real M-Pesa cash for reviewing Kenyan restaurants, mobile apps, and services! Register with my invite link: ${shareLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    const bonusAmount = 25;
    if (user) {
      updateProfile({
        streakDays: (user.streakDays || 4) + 1,
        availableBalance: user.availableBalance + bonusAmount,
        totalEarned: user.totalEarned + bonusAmount,
      });
    }
    setStreakClaimed(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Engagement & Growth
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Referrals, daily multiplier check-ins, and weekly Kenyan reviewer leaderboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-[#0F1A2E] p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("referrals")}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "referrals"
              ? "bg-white dark:bg-[#132347] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>Refer & Earn</span>
        </button>
        <button
          onClick={() => setActiveTab("streak")}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "streak"
              ? "bg-white dark:bg-[#132347] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Daily Streak</span>
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "leaderboard"
              ? "bg-white dark:bg-[#132347] text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: Referrals */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          <div className="rounded-[22px] bg-gradient-to-br from-[#09221C] via-[#0E352B] to-[#071814] border border-emerald-500/30 p-6 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                1-Level Referral Program
              </span>
            </div>
            <h2 className="text-xl font-black">Earn KES 150 for each friend</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              When someone registers with your link and their first review is verified and approved, you receive KES 150 instantly into your available wallet balance.
            </p>

            {/* Referral Link Box */}
            <div className="mt-5 p-3 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Personal Code:</span>
                <span className="font-mono font-bold text-emerald-400">{refCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="mt-4 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Directly to WhatsApp</span>
            </button>
          </div>

          {/* Referred Friends Ledger */}
          <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Referred Friends (One-Level Policy)
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">@kevin_m</p>
                  <p className="text-[10px] text-slate-400">Joined Oct 15, 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-bold">+KES 150.00</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                    Qualified & Paid
                  </span>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">@mercy_w</p>
                  <p className="text-[10px] text-slate-400">Joined Oct 17, 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-500 font-bold">Pending Review</span>
                  <span className="block text-[10px] text-slate-400">1 review submitted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Streak */}
      {activeTab === "streak" && (
        <div className="space-y-4">
          <div className="rounded-[22px] bg-gradient-to-br from-[#2D1609] via-[#381F0D] to-[#1E0D05] border border-orange-500/30 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-orange-400">
                  Streak Multipliers
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs">
                {user?.streakDays || 4} Days Active
              </span>
            </div>

            <h2 className="text-xl font-black mt-3">Earn Daily Multipliers</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Check in daily to accumulate streak bonuses and unlock reward multipliers across all review tasks.
            </p>

            {/* Streak 7-Day Matrix */}
            <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const currentStreak = user?.streakDays || 4;
                const isPassed = day < currentStreak;
                const isCurrent = day === currentStreak;

                return (
                  <div
                    key={day}
                    className={`p-2.5 rounded-xl text-center border ${
                      isPassed
                        ? "bg-orange-500/30 border-orange-400/50 text-white"
                        : isCurrent
                        ? "bg-orange-500 border-orange-300 text-slate-950 font-black animate-pulse"
                        : "bg-black/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold block">D{day}</span>
                    <span className="text-xs font-bold mt-1 block">+{day * 5}K</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleClaimStreak}
              disabled={streakClaimed}
              className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              <span>{streakClaimed ? "Today's Bonus Claimed" : "Claim Day 4 Bonus (+KES 25)"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Leaderboard */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Weekly Reviewer Hall of Fame</span>
              </h3>
              <span className="text-[10px] text-slate-400">Updates hourly</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {LEADERBOARD_USERS.map((usr) => (
                <div key={usr.rank} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-black ${
                        usr.rank === 1
                          ? "text-amber-400 text-sm"
                          : usr.rank === 2
                          ? "text-slate-300 text-sm"
                          : usr.rank === 3
                          ? "text-amber-600 text-sm"
                          : "text-slate-400"
                      }`}
                    >
                      #{usr.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#132347] text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center">
                      {usr.avatarLetter}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {usr.username}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {usr.approvedReviewsCount} approved reviews
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-emerald-500 numeral-bold">
                    KES {usr.totalEarnedKes.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
