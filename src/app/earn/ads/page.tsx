"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Play,
  ShieldCheck,
  Sparkles,
  Tv,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { SponsoredWatchAdItem } from "@/lib/ads/watch-service";

export default function WatchAdsPage() {
  const { user, updateProfile } = useAuth();
  const [ads, setAds] = useState<SponsoredWatchAdItem[]>([]);
  const [watchedToday, setWatchedToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active ad player modal state
  const [activeAd, setActiveAd] = useState<SponsoredWatchAdItem | null>(null);
  const [startToken, setStartToken] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadAdsData = async () => {
    try {
      const uid = user?.id || "usr_demo_ke_01";
      const res = await fetch(`/api/ads/watch?userId=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
        setWatchedToday(data.watchedTodayCount ?? 0);
        setDailyLimit(data.dailyLimit ?? 10);
        setCooldownSec(data.cooldownRemainingSeconds ?? 0);
      }
    } catch {
      // ignore network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdsData();
  }, [user?.id]);

  // Cooldown countdown ticker
  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setInterval(() => {
      setCooldownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSec]);

  // Active ad watch timer
  useEffect(() => {
    if (!activeAd || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAd, secondsLeft]);

  const handleStartWatching = async (ad: SponsoredWatchAdItem) => {
    setFeedbackMsg(null);
    const uid = user?.id || "usr_demo_ke_01";

    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          adId: ad.id,
          userId: uid,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.started) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Unable to start ad watch session.",
        });
        return;
      }

      setActiveAd(ad);
      setStartToken(data.startToken);
      setSecondsLeft(data.requiredSeconds || ad.durationSeconds || 15);
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Network error while starting ad session. Please try again.",
      });
    }
  };

  const handleCompleteWatch = async () => {
    if (!activeAd || !startToken || secondsLeft > 0) return;
    setIsCompleting(true);
    setFeedbackMsg(null);
    const uid = user?.id || "usr_demo_ke_01";

    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          adId: activeAd.id,
          startToken,
          userId: uid,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.completed) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Could not verify ad watch duration.",
        });
        setIsCompleting(false);
        return;
      }

      const earnedKes = Number(data.rewardKes || activeAd.rewardKes);
      const earnedPts = Number(data.pointsAwarded ?? activeAd.pointsReward);

      if (user) {
        updateProfile({
          availableBalance: (user.availableBalance || 0) + earnedKes,
          totalEarned: (user.totalEarned || 0) + earnedKes,
        });
      }

      setFeedbackMsg({
        type: "success",
        text: `Reward credited! +KES ${earnedKes} added to your available balance and +${earnedPts} Points awarded.`,
      });
      setActiveAd(null);
      setStartToken("");
      await loadAdsData();
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Failed to complete ad reward verification.",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPct = Math.min(100, Math.round((watchedToday / Math.max(1, dailyLimit)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-blue)] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Watch Ads. Earn Rewards.
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Watch short sponsored spotlights from verified Kenyan businesses to collect points and instant KES rewards.
          </p>
        </div>

        {/* Daily Progress Pill Card */}
        <div className="rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:min-w-[260px] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-[var(--brand-blue)]" />
              <span>Daily Watch Progress</span>
            </span>
            <span className="text-[var(--brand-blue)] numeral-bold">
              {watchedToday} of {dailyLimit} ads watched today
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-card-elevated)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--brand-blue)] transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {cooldownSec > 0 && (
            <p className="text-[11px] font-semibold text-[var(--accent-gold)] mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Next ad available in {cooldownSec}s cooldown</span>
            </p>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-[16px] border text-xs font-semibold flex items-start gap-2.5 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-[var(--accent-green)]"
              : "bg-red-500/10 border-red-500/30 text-[var(--accent-red)]"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Server Rules Strip */}
      <div className="p-3.5 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
          <span>
            Server-verified watch duration • 1 reward per ad per user • Up to {dailyLimit} ads/day
          </span>
        </div>
        <Link
          href="/earn"
          className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-1"
        >
          <span>Explore full review tasks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Ads Grid or Clean Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 animate-pulse"
            />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-[22px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center mx-auto">
            <Tv className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-display">
            No ads available right now, check back soon
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
            New sponsored spotlights from verified Kenyan businesses appear here as soon as campaigns are funded. In the meantime, you can earn from review tasks!
          </p>
          <div className="pt-2">
            <Link
              href="/earn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-extrabold hover:opacity-95 transition-all"
            >
              <span>Browse Review Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => {
            const isWatched = Boolean(ad.watchedByUser);
            const isLimitReached = watchedToday >= dailyLimit;

            return (
              <div
                key={ad.id}
                className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 flex flex-col justify-between hover:border-[var(--brand-blue)] transition-all shadow-xs"
              >
                <div className="space-y-3">
                  {/* Top Badges: Sponsored + Duration */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-[var(--accent-gold)] border border-amber-500/30">
                      <Sparkles className="w-3 h-3" />
                      <span>Sponsored</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ad.durationSeconds}s watch</span>
                    </span>
                  </div>

                  {/* Title & Business */}
                  <div>
                    <p className="text-[11px] font-bold text-[var(--brand-blue)] uppercase tracking-wider">
                      {ad.businessName}
                    </p>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] font-display mt-0.5">
                      {ad.title}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">
                      {ad.headline}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Rewards & Watch Trigger */}
                <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/30 text-xs font-extrabold numeral-bold">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>+KES {ad.rewardKes}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] border border-[var(--brand-blue)]/30 text-xs font-extrabold numeral-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{ad.pointsReward} pts</span>
                    </span>
                  </div>

                  {isWatched ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--accent-green)]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Watched</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLimitReached || cooldownSec > 0}
                      onClick={() => handleStartWatching(ad)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-extrabold hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {cooldownSec > 0
                          ? `Wait ${cooldownSec}s`
                          : isLimitReached
                          ? "Daily Limit Hit"
                          : "Watch & Earn"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Sponsored Ad Watch Player Modal */}
      {activeAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-[var(--accent-gold)] border border-amber-500/30">
                  Sponsored
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  {activeAd.businessName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveAd(null);
                  setStartToken("");
                }}
                aria-label="Close ad viewer"
                className="w-8 h-8 rounded-full bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Spotlight Frame */}
            <div className="rounded-[18px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[var(--brand-blue)] uppercase tracking-wider">
                  Verified Brand Spotlight
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-extrabold text-[var(--text-primary)] numeral-bold">
                  {secondsLeft > 0 ? `${secondsLeft}s remaining` : "Complete!"}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] font-display">
                {activeAd.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[var(--brand-blue)]">
                {activeAd.headline}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {activeAd.description}
              </p>

              {/* Progress Bar */}
              <div className="pt-3">
                <div className="w-full h-2 rounded-full bg-[var(--bg-card)] overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[var(--accent-green)] transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((activeAd.durationSeconds - secondsLeft) /
                            Math.max(1, activeAd.durationSeconds)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href={activeAd.ctaUrl}
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline"
              >
                {activeAd.ctaLabel} →
              </Link>

              <button
                type="button"
                disabled={secondsLeft > 0 || isCompleting}
                onClick={handleCompleteWatch}
                className="w-full sm:w-auto px-5 py-2.5 rounded-[12px] bg-[var(--accent-green)] text-white text-xs font-extrabold hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
              >
                {secondsLeft > 0
                  ? `Keep Watching (${secondsLeft}s)...`
                  : isCompleting
                  ? "Verifying on Server..."
                  : `Claim +KES ${activeAd.rewardKes} & +${activeAd.pointsReward} Pts`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
