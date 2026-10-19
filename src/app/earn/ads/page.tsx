"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Film,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Tv,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import type { SponsoredAd } from "@/lib/ads/watch-service";

interface AdsResponse {
  ads: SponsoredAd[];
  watchedToday: number;
  dailyLimit: number;
  cooldownRemainingSeconds: number;
}

function getEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) {
        return `https://www.youtube.com/embed/${v}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1`;
      }
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (id) {
        return `https://www.youtube.com/embed/${id}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1`;
      }
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id) {
        return `https://player.vimeo.com/video/${id}?playsinline=1`;
      }
    }
  } catch {
    // Fallback to raw url
  }
  return url;
}

export default function WatchAdsEarnPage() {
  const { user, updateProfile } = useAuth();
  const userId = user?.id || "usr_demo_ke_01";
  const [data, setData] = useState<AdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAd, setActiveAd] = useState<SponsoredAd | null>(null);
  const [startToken, setStartToken] = useState<string | null>(null);
  const [minWatchSeconds, setMinWatchSeconds] = useState<number>(12);
  const [watchedSeconds, setWatchedSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pausedReason, setPausedReason] = useState<string | null>(null);
  const [rewardedResult, setRewardedResult] = useState<{
    adId: string;
    rewardKes: number;
    rewardPoints: number;
    advertiserName: string;
    ctaLabel?: string;
    ctaUrl?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maxPlayedTimeRef = useRef<number>(0);
  const heartbeatBusyRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (conn?.saveData) {
        setIsDataSaver(true);
      }
    }
  }, []);

  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch(`/api/ads/watch?userId=${encodeURIComponent(userId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as AdsResponse;
        setData(json);
      }
    } catch {
      // Ignore transient errors
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Cooldown countdown ticker
  useEffect(() => {
    if (!data || data.cooldownRemainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              cooldownRemainingSeconds: Math.max(0, prev.cooldownRemainingSeconds - 1),
            }
          : prev,
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [data]);

  // Track tab visibility and auto-pause video when hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsTabVisible(visible);
      if (!visible && activeAd) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
        setIsPlaying(false);
        setPausedReason("Timer paused while tab is in the background.");
      } else if (visible) {
        setPausedReason(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeAd]);

  // Local 1-second progress tick while video is actively playing & tab is visible
  useEffect(() => {
    if (!activeAd || !startToken || !isPlaying || !isTabVisible || rewardedResult) return;

    const interval = setInterval(() => {
      setWatchedSeconds((prev) => Math.min(minWatchSeconds, prev + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAd, startToken, isPlaying, isTabVisible, minWatchSeconds, rewardedResult]);

  // Server heartbeat every 5 seconds ONLY while video is playing and tab is visible
  useEffect(() => {
    if (!activeAd || !startToken || !isPlaying || !isTabVisible || rewardedResult) return;

    const sendHeartbeat = async () => {
      if (heartbeatBusyRef.current) return;
      heartbeatBusyRef.current = true;
      try {
        const currentSec = videoRef.current
          ? Math.floor(videoRef.current.currentTime)
          : watchedSeconds;
        const res = await fetch("/api/ads/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adId: activeAd.id,
            startToken,
            userId,
            isPlaying: true,
            isTabVisible: document.visibilityState === "visible",
            isMuted,
            currentTimeSeconds: currentSec,
          }),
        });
        if (res.ok) {
          const json = (await res.json()) as {
            watchedSeconds: number;
            remainingSeconds: number;
          };
          setWatchedSeconds((prev) => Math.max(prev, json.watchedSeconds));
        }
      } catch {
        // Keep local state on transient network glitch
      } finally {
        heartbeatBusyRef.current = false;
      }
    };

    const hbTimer = setInterval(sendHeartbeat, 5000);
    return () => clearInterval(hbTimer);
  }, [activeAd, startToken, isPlaying, isTabVisible, isMuted, watchedSeconds, rewardedResult, userId]);

  const handleStartWatch = async (ad: SponsoredAd) => {
    setErrorMessage(null);
    setRewardedResult(null);
    setVideoError(null);
    setPausedReason(null);
    maxPlayedTimeRef.current = 0;

    try {
      const res = await fetch("/api/ads/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: ad.id,
          userId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Unable to start ad watch session.");
        return;
      }

      const requiredSec = Number(json.minWatchSeconds || ad.minWatchSeconds || ad.durationSeconds || 12);
      setActiveAd(ad);
      setStartToken(json.startToken);
      setMinWatchSeconds(requiredSec);
      setWatchedSeconds(0);
      setIsMuted(true);
      setIsBuffering(ad.videoType === "hosted");
      setIsPlaying(ad.videoType === "embedded");
    } catch {
      setErrorMessage("Network error while starting ad session. Check your connection and retry.");
    }
  };

  const handleCompleteWatch = async () => {
    if (!activeAd || !startToken || claiming) return;
    setClaiming(true);
    setErrorMessage(null);

    try {
      // Send one final heartbeat if needed so server has latest watchedSeconds
      await fetch("/api/ads/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: activeAd.id,
          startToken,
          userId,
          isPlaying: true,
          isTabVisible: document.visibilityState === "visible",
          isMuted,
          currentTimeSeconds: minWatchSeconds,
        }),
      }).catch(() => null);

      const res = await fetch("/api/ads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: activeAd.id,
          startToken,
          userId,
          requireHeartbeats: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Could not verify ad watch duration yet.");
        setClaiming(false);
        return;
      }

      const rewardKesNum = Number(json.rewardKes || activeAd.rewardKes || 0);
      setRewardedResult({
        adId: activeAd.id,
        rewardKes: rewardKesNum,
        rewardPoints: Number(
          json.rewardPoints || json.pointsAwarded || activeAd.rewardPoints || activeAd.pointsReward || 2
        ),
        advertiserName: activeAd.advertiserName || activeAd.businessName,
        ctaLabel: activeAd.ctaLabel,
        ctaUrl: activeAd.ctaUrl,
      });
      if (user && rewardKesNum > 0) {
        updateProfile({
          availableBalance: (user.availableBalance ?? 0) + rewardKesNum,
          totalEarned: (user.totalEarned ?? 0) + rewardKesNum,
        });
      }
      setIsPlaying(false);
      await fetchAds();
    } catch {
      setErrorMessage("Network error while claiming ad reward. Please retry.");
    } finally {
      setClaiming(false);
    }
  };

  const handleCloseModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveAd(null);
    setStartToken(null);
    setWatchedSeconds(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setVideoError(null);
    setPausedReason(null);
    setRewardedResult(null);
  };

  const handleRetryVideo = () => {
    setVideoError(null);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        setIsBuffering(false);
      });
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        setVideoError("Playback could not start. Tap retry to reload video.");
      });
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const watchedToday = data?.watchedToday ?? 0;
  const dailyLimit = data?.dailyLimit ?? 10;
  const cooldown = data?.cooldownRemainingSeconds ?? 0;
  const remainingSeconds = Math.max(0, minWatchSeconds - watchedSeconds);
  const progressPct = Math.min(100, Math.round((watchedSeconds / Math.max(1, minWatchSeconds)) * 100));
  const ringCircumference = 2 * Math.PI * 18;
  const ringOffset = ringCircumference - (progressPct / 100) * ringCircumference;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Watch Video Ads &amp; Earn
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-200 border border-amber-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sponsored
              </span>
            </div>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Watch short sponsored videos to the end and collect instant cash rewards and tier points.
            </p>
          </div>

          {/* Daily Watch Progress Card */}
          <div className="surface-card p-4 sm:min-w-[250px] border border-[var(--border-color)]">
            <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
              <span className="text-[var(--text-secondary)]">Watched Today</span>
              <span className="font-bold text-[var(--text-primary)]">
                {watchedToday} of {dailyLimit} ads
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border-color)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-blue)] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((watchedToday / dailyLimit) * 100))}%` }}
              />
            </div>
            {cooldown > 0 && (
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Cooldown active: {cooldown}s remaining
              </p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && !activeAd && (
          <div className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/60 p-4 text-sm font-semibold text-red-800 dark:text-red-200 flex items-center justify-between gap-3">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline shrink-0 min-h-[44px] px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Ads List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="surface-card p-5 h-80 animate-pulse bg-[var(--bg-elevated)]" />
            ))}
          </div>
        ) : !data || data.ads.length === 0 ? (
          <div className="surface-card p-10 text-center space-y-3">
            <Tv className="h-10 w-10 text-[var(--text-secondary)] mx-auto" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              No ads available right now, check back soon
            </h2>
            <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              New sponsored video campaigns from verified partners are added throughout the day.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.ads.map((ad) => {
              const isDisabled =
                ad.watchedByCurrentUser ||
                watchedToday >= dailyLimit ||
                cooldown > 0;

              return (
                <div
                  key={ad.id}
                  className="surface-card overflow-hidden flex flex-col justify-between border border-[var(--border-color)] hover:border-[var(--brand-gold)]/50 transition-all"
                >
                  {/* Video Poster Thumbnail Preview */}
                  <div>
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-[var(--border-color)]">
                      {ad.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ad.thumbnailUrl}
                          alt={ad.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-300">
                          <Film className="h-10 w-10" />
                        </div>
                      )}

                      {/* Top badges on thumbnail */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/85 text-amber-300 border border-amber-400/40 px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                          Sponsored
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ad.isDemoData && (
                            <span className="inline-flex items-center rounded-md bg-purple-950/90 text-purple-200 border border-purple-400/40 px-2 py-1 text-xs font-semibold whitespace-nowrap">
                              Sample Ad
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/85 text-white px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            {ad.minWatchSeconds}s
                          </span>
                        </div>
                      </div>

                      {/* Play overlay button */}
                      {!ad.watchedByCurrentUser && (
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleStartWatch(ad)}
                          aria-label={`Play ${ad.title}`}
                          className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/40 transition-colors disabled:cursor-not-allowed"
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-gold)] text-slate-950 shadow-lg">
                            <Play className="h-6 w-6 fill-current ml-0.5" />
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">
                        {ad.advertiserName} • {ad.category}
                      </p>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
                        {ad.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {ad.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with High-Contrast Reward Pills & Action Button */}
                  <div className="px-5 pb-5 pt-3 border-t border-[var(--border-color)] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Green Cash Reward Pill - High Contrast in Light & Dark Mode */}
                        <span className="inline-flex items-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 border border-emerald-500/40 px-3 py-1 text-xs sm:text-sm font-bold whitespace-nowrap shadow-xs">
                          +KES {ad.rewardKes}
                        </span>
                        {/* Blue Points Reward Pill - High Contrast in Light & Dark Mode */}
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-500/40 px-3 py-1 text-xs sm:text-sm font-bold whitespace-nowrap shadow-xs">
                          <Award className="h-3.5 w-3.5 shrink-0" />
                          +{ad.rewardPoints} pts
                        </span>
                      </div>

                      {ad.watchedByCurrentUser && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Rewarded
                        </span>
                      )}
                    </div>

                    {ad.watchedByCurrentUser ? (
                      <div className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/50 border border-emerald-500/30 px-4 py-2.5 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        Watched &amp; Credited
                      </div>
                    ) : (
                      <Button
                        size="md"
                        variant="primary"
                        disabled={isDisabled}
                        onClick={() => handleStartWatch(ad)}
                        className="w-full min-h-[44px] text-sm font-bold"
                      >
                        <Play className="h-4 w-4 mr-1.5 fill-current" />
                        {cooldown > 0
                          ? `Wait ${cooldown}s`
                          : watchedToday >= dailyLimit
                            ? "Daily Limit Reached"
                            : "Watch & Earn"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full-screen Video Player Modal */}
        {activeAd && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Sponsored video: ${activeAd.title}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4"
          >
            <div className="relative w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
              {/* Top Bar: Sponsored Badge, Advertiser Name, Progress Ring & Close Button */}
              <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex items-center rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 text-xs font-bold uppercase tracking-wider shrink-0">
                    Sponsored
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate">
                      {activeAd.advertiserName}
                    </p>
                    <p className="text-xs text-slate-300 truncate">{activeAd.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Circular Progress Ring + Countdown */}
                  {!rewardedResult && (
                    <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-3 py-1">
                      <svg className="h-7 w-7 -rotate-90" viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="4"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xs font-bold text-amber-300 whitespace-nowrap">
                        {remainingSeconds > 0
                          ? `Reward unlocks in ${remainingSeconds}s`
                          : "Reward unlocked!"}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    aria-label="Close video player"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Center Video Viewport */}
              <div className="relative bg-black flex-1 flex items-center justify-center min-h-[260px] sm:aspect-video">
                {activeAd.videoType === "hosted" ? (
                  <>
                    <video
                      ref={videoRef}
                      src={activeAd.videoUrl}
                      poster={activeAd.thumbnailUrl}
                      playsInline
                      autoPlay
                      muted={isMuted}
                      preload={isDataSaver ? "none" : "metadata"}
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      onPlay={() => {
                        setIsPlaying(true);
                        setIsBuffering(false);
                        setPausedReason(null);
                      }}
                      onPlaying={() => {
                        setIsPlaying(true);
                        setIsBuffering(false);
                      }}
                      onPause={() => {
                        setIsPlaying(false);
                      }}
                      onWaiting={() => {
                        setIsBuffering(true);
                      }}
                      onCanPlay={() => {
                        setIsBuffering(false);
                      }}
                      onTimeUpdate={(e) => {
                        const el = e.currentTarget;
                        if (el.currentTime > maxPlayedTimeRef.current + 1.5) {
                          // Prevent forward seeking
                          el.currentTime = maxPlayedTimeRef.current;
                        } else {
                          maxPlayedTimeRef.current = Math.max(
                            maxPlayedTimeRef.current,
                            el.currentTime,
                          );
                        }
                      }}
                      onSeeking={(e) => {
                        const el = e.currentTarget;
                        if (el.currentTime > maxPlayedTimeRef.current + 1.2) {
                          el.currentTime = maxPlayedTimeRef.current;
                        }
                      }}
                      onEnded={() => {
                        // Loop if minWatchSeconds hasn't finished yet
                        if (watchedSeconds < minWatchSeconds && videoRef.current) {
                          maxPlayedTimeRef.current = 0;
                          videoRef.current.currentTime = 0;
                          videoRef.current.play().catch(() => null);
                        } else {
                          setIsPlaying(false);
                        }
                      }}
                      onError={() => {
                        setIsBuffering(false);
                        setIsPlaying(false);
                        setVideoError(
                          "Video stream interrupted or offline. Check your connection and tap Retry.",
                        );
                      }}
                      className="w-full h-full max-h-[65vh] object-contain"
                    />

                    {/* Buffering Spinner Overlay */}
                    {isBuffering && !videoError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2 pointer-events-none">
                        <Loader2 className="h-9 w-9 animate-spin text-amber-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          Buffering video...
                        </span>
                      </div>
                    )}

                    {/* Offline / Network Error Retry State */}
                    {videoError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center space-y-3">
                        <WifiOff className="h-10 w-10 text-red-400" />
                        <p className="text-sm font-semibold text-white max-w-sm">
                          {videoError}
                        </p>
                        <Button
                          size="md"
                          variant="primary"
                          onClick={handleRetryVideo}
                          className="min-h-[44px]"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry Video
                        </Button>
                      </div>
                    )}

                    {/* Floating Play/Pause and Mute Controls */}
                    {!videoError && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                        <button
                          type="button"
                          onClick={togglePlayPause}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-slate-700 px-3.5 py-2 text-xs font-bold min-h-[44px]"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 fill-current" />
                              Play
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={toggleMute}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-slate-700 px-3.5 py-2 text-xs font-bold min-h-[44px]"
                        >
                          {isMuted ? (
                            <>
                              <VolumeX className="h-4 w-4 text-amber-400" />
                              Tap for Sound
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-4 w-4 text-emerald-400" />
                              Sound On
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <iframe
                    src={getEmbedUrl(activeAd.videoUrl)}
                    title={activeAd.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full min-h-[280px] sm:aspect-video border-0"
                  />
                )}
              </div>

              {/* Bottom Bar: Linear Progress, Anti-cheat Status & Claim/Visit CTA */}
              <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>
                      Watched: {watchedSeconds}s / {minWatchSeconds}s
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold">
                        +KES {activeAd.rewardKes}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-blue-950 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 text-xs font-bold">
                        +{activeAd.rewardPoints} pts
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {pausedReason && !rewardedResult && (
                  <div className="rounded-lg bg-amber-950/80 border border-amber-500/40 px-3 py-2 text-xs font-semibold text-amber-200">
                    {pausedReason}
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-lg bg-red-950/90 border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-200">
                    {errorMessage}
                  </div>
                )}

                {rewardedResult ? (
                  <div className="rounded-xl bg-emerald-950/90 border border-emerald-500/40 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-base font-bold text-white">
                          +KES {rewardedResult.rewardKes} &amp; +{rewardedResult.rewardPoints} Points Credited!
                        </p>
                        <p className="text-xs text-emerald-200">
                          Verified by server anti-cheat ledger.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                      {rewardedResult.ctaUrl && (
                        <a
                          href={rewardedResult.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm px-4 py-2.5 transition-colors"
                        >
                          <span>{rewardedResult.ctaLabel || "Visit Advertiser"}</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={handleCloseModal}
                        className="min-h-[44px] bg-slate-800 text-white hover:bg-slate-700 border-slate-700"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        Keep video playing and tab open. Seeking forward is disabled.
                      </span>
                    </div>

                    <Button
                      size="md"
                      variant="primary"
                      disabled={remainingSeconds > 0 || claiming}
                      isLoading={claiming}
                      onClick={handleCompleteWatch}
                      className="min-h-[44px] sm:min-w-[210px] font-bold text-sm"
                    >
                      {remainingSeconds > 0
                        ? `Reward unlocks in ${remainingSeconds}s`
                        : `Claim KES ${activeAd.rewardKes} + ${activeAd.rewardPoints} pts`}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
