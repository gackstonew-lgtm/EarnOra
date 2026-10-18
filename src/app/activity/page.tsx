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
  Gift,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { LEADERBOARD_USERS } from "@/lib/mock-data";
import { Button } from "@/components/ui";

export default function ActivityPage() {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"referrals" | "streak" | "leaderboard">("referrals");
  const [copiedLink, setCopiedLink] = useState(false);
  const [streakClaimed, setStreakClaimed] = useState(false);

  const refCode = user?.referralCode || "EARN-KE-88";
  const shareLink = `http://localhost:3000/auth/register?ref=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join EarnOra and earn real M-Pesa cash for reviewing Kenyan restaurants, mobile apps, and services! Register with my invite link: ${shareLink}`
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
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1F3D] tracking-tight">
          Engagement & Growth
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7A99] mt-1">
          Referrals, daily multiplier check-ins, and weekly Kenyan reviewer leaderboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-[14px] bg-[#EEF3FF] p-1 border border-blue-100 text-xs font-bold">
        <button
          onClick={() => setActiveTab("referrals")}
          className={`flex-1 py-2.5 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "referrals"
              ? "bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white shadow-blue-btn"
              : "text-[#6B7A99] hover:text-[#0F1F3D]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Refer & Earn</span>
        </button>
        <button
          onClick={() => setActiveTab("streak")}
          className={`flex-1 py-2.5 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "streak"
              ? "bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white shadow-blue-btn"
              : "text-[#6B7A99] hover:text-[#0F1F3D]"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Daily Streak</span>
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 py-2.5 rounded-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white shadow-blue-btn"
              : "text-[#6B7A99] hover:text-[#0F1F3D]"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: Referrals */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          <div className="rounded-[24px] bg-gradient-to-br from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] p-6 sm:p-8 text-white shadow-[0_12px_36px_rgba(11,79,179,0.22)] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-sky-200" />
              <span className="text-xs uppercase font-bold tracking-wider text-white">
                1-Level Referral Program
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">Earn KES 150 for each friend</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed max-w-xl">
              When someone registers with your link and their first review is verified and approved, you receive KES 150 instantly into your available wallet balance.
            </p>

            {/* Referral Link Box */}
            <div className="mt-5 p-4 rounded-[16px] bg-white text-[#0F1F3D] shadow-sm space-y-2 border border-blue-100/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7A99]">Your Personal Code:</span>
                <span className="font-mono font-bold text-[#1E6FD9]">{refCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 bg-[#EEF3FF] border border-blue-100 rounded-[10px] px-3 py-2 text-xs text-[#0F1F3D] font-mono select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-[10px] bg-[#EEF3FF] hover:bg-[#E2EDFF] text-[#1E6FD9] font-bold text-xs flex items-center gap-1 border border-blue-100 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="mt-4 w-full py-3 rounded-[12px] bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Directly to WhatsApp</span>
            </button>
          </div>

          {/* Referred Friends Ledger */}
          <div className="rounded-[20px] bg-white border border-blue-100/70 p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
            <h3 className="font-bold text-sm text-[#0F1F3D] mb-3">
              Referred Friends (One-Level Policy)
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0F1F3D]">@kevin_m</p>
                  <p className="text-[10px] text-[#6B7A99]">Joined Oct 15, 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-[#16A34A] font-bold numeral-bold">+KES 150.00</span>
                  <span className="block text-[10px] text-[#16A34A] font-semibold">
                    Qualified & Paid
                  </span>
                </div>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0F1F3D]">@mercy_w</p>
                  <p className="text-[10px] text-[#6B7A99]">Joined Oct 17, 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-600 font-bold">Pending Review</span>
                  <span className="block text-[10px] text-[#6B7A99]">1 review submitted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Streak */}
      {activeTab === "streak" && (
        <div className="space-y-4">
          <div className="rounded-[24px] bg-gradient-to-br from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] p-6 sm:p-8 text-white shadow-[0_12px_36px_rgba(11,79,179,0.22)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-300" />
                <span className="text-xs uppercase font-bold tracking-wider text-white">
                  Streak Multipliers
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white font-bold text-xs border border-white/25">
                {user?.streakDays || 4} Days Active
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black mt-3">Earn Daily Multipliers</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
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
                    className={`p-2.5 rounded-[12px] text-center border ${
                      isPassed
                        ? "bg-white/20 border-white/30 text-white"
                        : isCurrent
                        ? "bg-white border-white text-[#0A3D91] font-black shadow-md scale-105"
                        : "bg-white/10 border-white/15 text-blue-100"
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
              className="mt-6 w-full py-3.5 rounded-[12px] bg-white hover:bg-slate-50 text-[#0A3D91] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{streakClaimed ? "Today's Bonus Claimed" : "Claim Day 4 Bonus (+KES 25)"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Leaderboard */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <div className="rounded-[20px] bg-white border border-blue-100/70 p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#0F1F3D] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Weekly Kenyan Reviewer Leaderboard</span>
              </h3>
              <span className="text-[11px] text-[#6B7A99]">Resets Sunday 23:59 EAT</span>
            </div>

            <div className="divide-y divide-slate-100">
              {LEADERBOARD_USERS.map((lbUser) => {
                const rank = lbUser.rank;
                return (
                  <div
                    key={lbUser.username}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          rank === 1
                            ? "bg-amber-100 text-amber-800"
                            : rank === 2
                            ? "bg-slate-200 text-slate-700"
                            : rank === 3
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "text-[#6B7A99]"
                        }`}
                      >
                        {rank}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#0F1F3D]">
                          {lbUser.username}
                        </p>
                        <p className="text-[10px] text-[#6B7A99]">
                          {lbUser.approvedReviewsCount} approved reviews
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-[#16A34A] numeral-bold">
                        KES {lbUser.totalEarnedKes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
