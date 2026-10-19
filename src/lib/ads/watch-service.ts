import crypto from "crypto";
import { isAdsEnabled } from "./config";
import { POINT_AWARD_VALUES } from "@/lib/points/config";
import { awardPointsServerSide } from "@/lib/points/service";

export const DAILY_AD_WATCH_LIMIT = 10;
export const AD_WATCH_COOLDOWN_SECONDS = 15;
export const HEARTBEAT_INTERVAL_SECONDS = 5;

export type VideoAdSourceType = "hosted" | "embedded";
export type VideoSourceType = VideoAdSourceType;
export type VideoAdStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "paused"
  | "rejected";

export interface SponsoredWatchAdItem {
  id: string;
  campaignId: string;
  advertiserId?: string;
  businessName: string;
  advertiserName?: string;
  title: string;
  headline: string;
  description: string;
  categoryTag: string;
  category?: string;
  videoUrl: string;
  videoType: VideoAdSourceType;
  thumbnailUrl: string;
  advertiserUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
  durationSeconds: number;
  minWatchSeconds: number;
  rewardKes: number;
  pointsReward: number;
  rewardPoints?: number;
  status: VideoAdStatus;
  rightsAttested: boolean;
  isDemoData: boolean;
  isSponsored: true;
  watchedByUser?: boolean;
  watchedByCurrentUser?: boolean;
  createdAt?: string;
}

export type SponsoredAd = SponsoredWatchAdItem;

/**
 * Mirrors the `ad_views` table in `20261019000003_video_ads_and_views.sql`:
 * (user_id, ad_id, started_at, last_heartbeat_at, watched_seconds, completed_at, rewarded_at)
 */
export interface AdViewRecord {
  sessionId: string;
  userId: string;
  adId: string;
  campaignId: string;
  startedAtMs: number;
  lastHeartbeatAtMs?: number;
  watchedSeconds: number;
  heartbeatCount: number;
  requiredSeconds: number;
  completedAtMs?: number;
  rewardedAtMs?: number;
  rewardKes: number;
  pointsReward: number;
  status: "started" | "completed";
}

export type AdWatchSessionRecord = AdViewRecord;

export interface WatchAdsStoreState {
  sessions: AdViewRecord[];
  customAds: SponsoredWatchAdItem[];
  deletedAdIds: string[];
}

const STORAGE_KEY_WATCH_ADS = "earnora_watch_ads_sessions_v2";

/**
 * 3 clearly labeled sample demo ads using self-hosted royalty-free CC0 videos in /public/videos/.
 * Marked with `isDemoData: true` so admins can delete them with one click.
 */
export const SEED_DEMO_VIDEO_ADS: SponsoredWatchAdItem[] = [
  {
    id: "ad_demo_savannah_mp4_01",
    campaignId: "camp_adv_savannah_01",
    advertiserId: "adv_ke_savannah_01",
    businessName: "Savannah Roast & Bistro",
    title: "Savannah Single-Origin Nyeri AA Espresso Reel (Demo)",
    headline: "Direct-trade Kenyan coffee & artisan brunch in Westlands, Nairobi",
    description:
      "Watch this 15-second self-hosted MP4 spotlight from Savannah Roast & Bistro showcasing our espresso bar and instant M-Pesa table ordering.",
    categoryTag: "Sponsored",
    videoUrl: "/videos/earnora-promo-1.mp4",
    videoType: "hosted",
    thumbnailUrl: "/videos/thumb-1.svg",
    advertiserUrl: "https://savannahroast.co.ke",
    ctaLabel: "Visit Savannah Roast",
    ctaUrl: "/earn/submit?task=camp_adv_savannah_01",
    durationSeconds: 15,
    minWatchSeconds: 15,
    rewardKes: 15,
    pointsReward: POINT_AWARD_VALUES.watched_ad,
    status: "active",
    rightsAttested: true,
    isDemoData: true,
    isSponsored: true,
    createdAt: "2026-10-19T08:00:00Z",
  },
  {
    id: "ad_demo_pesaflow_webm_02",
    campaignId: "camp_adv_savannah_01",
    advertiserId: "adv_ke_pesaflow_02",
    businessName: "PesaFlow Micro-Tech Ltd",
    title: "PesaFlow Instant M-Pesa Merchant Till Spotlight (Demo)",
    headline: "Zero-delay Lipa Na M-Pesa reconciliation for Kenyan SMEs",
    description:
      "Watch this 15-second self-hosted WebM video demonstrating how Kenyan retail shops reconcile M-Pesa Till payments and automated supplier payouts.",
    categoryTag: "Sponsored",
    videoUrl: "/videos/earnora-promo-2.webm",
    videoType: "hosted",
    thumbnailUrl: "/videos/thumb-2.svg",
    advertiserUrl: "https://pesaflow.co.ke",
    ctaLabel: "Visit PesaFlow Kenya",
    ctaUrl: "/earn",
    durationSeconds: 15,
    minWatchSeconds: 15,
    rewardKes: 20,
    pointsReward: POINT_AWARD_VALUES.watched_ad,
    status: "active",
    rightsAttested: true,
    isDemoData: true,
    isSponsored: true,
    createdAt: "2026-10-19T08:30:00Z",
  },
  {
    id: "ad_demo_earnora_promo_03",
    campaignId: "camp_adv_savannah_01",
    advertiserId: "adv_ke_savannah_01",
    businessName: "EarnOra Official Kenya",
    title: "How EarnOra Points, Tiers & Instant M-Pesa Payouts Work (Demo)",
    headline: "Review. Earn. Grow. — Raise your daily M-Pesa withdrawal limits",
    description:
      "Watch this official EarnOra promo video explaining how verified tasks, reviews, and video ads build your tier from Starter up to Platinum.",
    categoryTag: "Sponsored",
    videoUrl: "/videos/earnora-promo-3.mp4",
    videoType: "hosted",
    thumbnailUrl: "/videos/thumb-3.svg",
    advertiserUrl: "https://earnora.co.ke/for-businesses",
    ctaLabel: "Explore EarnOra Tasks",
    ctaUrl: "/earn",
    durationSeconds: 15,
    minWatchSeconds: 15,
    rewardKes: 15,
    pointsReward: POINT_AWARD_VALUES.watched_ad,
    status: "active",
    rightsAttested: true,
    isDemoData: true,
    isSponsored: true,
    createdAt: "2026-10-19T09:00:00Z",
  },
];

let memoryWatchState: WatchAdsStoreState = {
  sessions: [],
  customAds: [],
  deletedAdIds: [],
};

function getWatchSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    "earnora-watch-ad-hmac-secret-2026"
  );
}

export function getWatchAdsState(): WatchAdsStoreState {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WATCH_ADS);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WatchAdsStoreState>;
        memoryWatchState = {
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
          customAds: Array.isArray(parsed.customAds) ? parsed.customAds : [],
          deletedAdIds: Array.isArray(parsed.deletedAdIds) ? parsed.deletedAdIds : [],
        };
        return memoryWatchState;
      }
    } catch {
      // ignore
    }
  }
  return memoryWatchState;
}

export function saveWatchAdsState(next: WatchAdsStoreState): void {
  memoryWatchState = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_WATCH_ADS, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
}

export function resetWatchAdsStateForTesting(): WatchAdsStoreState {
  const empty: WatchAdsStoreState = {
    sessions: [],
    customAds: [],
    deletedAdIds: [],
  };
  saveWatchAdsState(empty);
  return empty;
}

export function getAllCatalogVideoAds(stateOverride?: WatchAdsStoreState): SponsoredWatchAdItem[] {
  const state = stateOverride || getWatchAdsState();
  const deletedSet = new Set(state.deletedAdIds || []);
  const combined = [...(state.customAds || []), ...SEED_DEMO_VIDEO_ADS];
  return combined
    .filter((ad) => !deletedSet.has(ad.id))
    .map((ad) => ({
      ...ad,
      advertiserName: ad.advertiserName || ad.businessName,
      category: ad.category || ad.categoryTag,
      rewardPoints: ad.rewardPoints ?? ad.pointsReward,
    }));
}

export function getAllVideoAdsForAdmin(stateOverride?: WatchAdsStoreState): SponsoredWatchAdItem[] {
  return getAllCatalogVideoAds(stateOverride);
}

/**
 * Returns active video ads for `/earn/ads` along with daily progress and cooldown.
 */
export function getAvailableSponsoredAds(
  userId?: string,
  stateOverride?: WatchAdsStoreState,
  includeAllStatusesForAdmin = false
): {
  ads: SponsoredWatchAdItem[];
  allAdsForAdmin?: SponsoredWatchAdItem[];
  watchedToday: number;
  watchedTodayCount: number;
  dailyLimit: number;
  cooldownRemainingSeconds: number;
} {
  const watchState = stateOverride || getWatchAdsState();
  const cleanUserId = (userId || "usr_demo_ke_01").trim();
  const nowMs = Date.now();
  const todayPrefix = new Date(nowMs).toISOString().slice(0, 10);

  const userCompletedSessions = watchState.sessions.filter(
    (s) => s.userId === cleanUserId && s.status === "completed"
  );

  const watchedTodayCount = userCompletedSessions.filter((s) =>
    new Date(s.completedAtMs || s.startedAtMs).toISOString().startsWith(todayPrefix)
  ).length;

  const lastCompletedMs = userCompletedSessions.reduce(
    (max, s) => Math.max(max, s.completedAtMs || 0),
    0
  );

  const elapsedSinceLastSec =
    lastCompletedMs > 0 ? Math.floor((nowMs - lastCompletedMs) / 1000) : 999999;
  const cooldownRemainingSeconds = Math.max(
    0,
    AD_WATCH_COOLDOWN_SECONDS - elapsedSinceLastSec
  );

  if (!isAdsEnabled()) {
    return {
      ads: [],
      allAdsForAdmin: [],
      watchedToday: watchedTodayCount,
      watchedTodayCount,
      dailyLimit: DAILY_AD_WATCH_LIMIT,
      cooldownRemainingSeconds,
    };
  }

  const completedAdIds = new Set(userCompletedSessions.map((s) => s.adId));
  const catalog = getAllCatalogVideoAds(watchState).map((ad) => {
    const isWatched = completedAdIds.has(ad.id);
    return {
      ...ad,
      watchedByUser: isWatched,
      watchedByCurrentUser: isWatched,
    };
  });

  const activeAds = catalog.filter((ad) => ad.status === "active");

  return {
    ads: activeAds,
    allAdsForAdmin: includeAllStatusesForAdmin ? catalog : undefined,
    watchedToday: watchedTodayCount,
    watchedTodayCount,
    dailyLimit: DAILY_AD_WATCH_LIMIT,
    cooldownRemainingSeconds,
  };
}

function signWatchTokenPayload(payloadStr: string): string {
  return crypto
    .createHmac("sha256", getWatchSecret())
    .update(payloadStr)
    .digest("hex");
}

export function createSignedStartToken(params: {
  sessionId: string;
  userId: string;
  adId: string;
  startedAtMs: number;
  requiredSeconds: number;
  rewardKes: number;
  pointsReward: number;
}): string {
  const payload = JSON.stringify(params);
  const b64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = signWatchTokenPayload(b64);
  return `${b64}.${sig}`;
}

export function verifySignedStartToken(token: string): {
  valid: boolean;
  payload?: {
    sessionId: string;
    userId: string;
    adId: string;
    startedAtMs: number;
    requiredSeconds: number;
    rewardKes: number;
    pointsReward: number;
  };
  error?: string;
} {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Invalid watch session token format." };
  }
  const [b64, sig] = token.split(".");
  const expectedSig = signWatchTokenPayload(b64);
  if (sig !== expectedSig) {
    return { valid: false, error: "Watch session token signature verification failed." };
  }
  try {
    const decoded = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false, error: "Malformed watch session token payload." };
  }
}

/**
 * Step 1: `POST /api/ads/start`
 * Records `started_at` in `ad_views` and returns a signed `startToken`.
 */
export function startAdWatchServerSide(params: {
  userId: string;
  adId: string;
  nowMs?: number;
  stateOverride?: WatchAdsStoreState;
}): {
  started: boolean;
  startToken?: string;
  session?: AdViewRecord;
  requiredSeconds?: number;
  error?: string;
} {
  const state = params.stateOverride || getWatchAdsState();
  const cleanUserId = (params.userId || "").trim();
  const cleanAdId = (params.adId || "").trim();
  const nowMs = params.nowMs ?? Date.now();
  const todayPrefix = new Date(nowMs).toISOString().slice(0, 10);

  if (!cleanUserId || !cleanAdId) {
    return { started: false, error: "userId and adId are required." };
  }

  const { ads } = getAvailableSponsoredAds(cleanUserId, state);
  const targetAd = ads.find((a) => a.id === cleanAdId);
  if (!targetAd) {
    return { started: false, error: "Sponsored video ad not found or no longer active." };
  }

  // Rule 1: Unique (user_id, ad_id) — one reward per ad per user
  const alreadyCompleted = state.sessions.find(
    (s) => s.userId === cleanUserId && s.adId === cleanAdId && s.status === "completed"
  );
  if (alreadyCompleted) {
    return {
      started: false,
      error: "You have already watched and claimed the reward for this sponsored video ad.",
    };
  }

  // Rule 2: Daily ad limit (10 ads/day)
  const completedToday = state.sessions.filter(
    (s) =>
      s.userId === cleanUserId &&
      s.status === "completed" &&
      new Date(s.completedAtMs || s.startedAtMs).toISOString().startsWith(todayPrefix)
  );
  if (completedToday.length >= DAILY_AD_WATCH_LIMIT) {
    return {
      started: false,
      error: `Daily limit of ${DAILY_AD_WATCH_LIMIT} sponsored ads reached. Check back tomorrow!`,
    };
  }

  // Rule 3: Cooldown between ad watches
  const lastCompletedMs = state.sessions
    .filter((s) => s.userId === cleanUserId && s.status === "completed")
    .reduce((max, s) => Math.max(max, s.completedAtMs || 0), 0);

  if (lastCompletedMs > 0) {
    const elapsedSeconds = Math.floor((nowMs - lastCompletedMs) / 1000);
    if (elapsedSeconds < AD_WATCH_COOLDOWN_SECONDS) {
      const waitSec = AD_WATCH_COOLDOWN_SECONDS - elapsedSeconds;
      return {
        started: false,
        error: `Cooldown active. Please wait ${waitSec}s before watching another ad.`,
      };
    }
  }

  const requiredSec = targetAd.minWatchSeconds || targetAd.durationSeconds || 15;
  const sessionId = `av_${nowMs}_${Math.random().toString(36).slice(2, 7)}`;
  const session: AdViewRecord = {
    sessionId,
    userId: cleanUserId,
    adId: cleanAdId,
    campaignId: targetAd.campaignId,
    startedAtMs: nowMs,
    lastHeartbeatAtMs: nowMs,
    watchedSeconds: 0,
    heartbeatCount: 0,
    requiredSeconds: requiredSec,
    rewardKes: targetAd.rewardKes,
    pointsReward: targetAd.pointsReward,
    status: "started",
  };

  const nextState: WatchAdsStoreState = {
    ...state,
    sessions: [
      session,
      ...state.sessions.filter(
        (s) => !(s.userId === cleanUserId && s.adId === cleanAdId && s.status === "started")
      ),
    ],
  };

  if (!params.stateOverride) {
    saveWatchAdsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  const startToken = createSignedStartToken({
    sessionId,
    userId: cleanUserId,
    adId: cleanAdId,
    startedAtMs: nowMs,
    requiredSeconds: requiredSec,
    rewardKes: targetAd.rewardKes,
    pointsReward: targetAd.pointsReward,
  });

  return {
    started: true,
    startToken,
    session,
    requiredSeconds: requiredSec,
  };
}

/**
 * Step 1.5: `POST /api/ads/heartbeat`
 * Sent every 5 seconds ONLY while the video is actively playing and the tab is visible.
 * Increments `watched_seconds` and updates `last_heartbeat_at`.
 */
export function recordAdHeartbeatServerSide(params: {
  userId: string;
  adId: string;
  startToken: string;
  isPlaying: boolean;
  isTabVisible: boolean;
  isMutedAndHidden?: boolean;
  deltaSeconds?: number;
  nowMs?: number;
  stateOverride?: WatchAdsStoreState;
}): {
  recorded: boolean;
  watchedSeconds: number;
  requiredSeconds: number;
  remainingSeconds: number;
  error?: string;
} {
  const state = params.stateOverride || getWatchAdsState();
  const cleanUserId = (params.userId || "").trim();
  const cleanAdId = (params.adId || "").trim();
  const nowMs = params.nowMs ?? Date.now();

  const verification = verifySignedStartToken(params.startToken);
  if (!verification.valid || !verification.payload) {
    return {
      recorded: false,
      watchedSeconds: 0,
      requiredSeconds: 15,
      remainingSeconds: 15,
      error: verification.error || "Invalid start token.",
    };
  }

  const tokenData = verification.payload;
  if (tokenData.userId !== cleanUserId || tokenData.adId !== cleanAdId) {
    return {
      recorded: false,
      watchedSeconds: 0,
      requiredSeconds: tokenData.requiredSeconds,
      remainingSeconds: tokenData.requiredSeconds,
      error: "Heartbeat token mismatch.",
    };
  }

  // Find or reconstruct active view session
  let existingSession = state.sessions.find(
    (s) => s.sessionId === tokenData.sessionId || (s.userId === cleanUserId && s.adId === cleanAdId)
  );

  if (!existingSession) {
    existingSession = {
      sessionId: tokenData.sessionId,
      userId: cleanUserId,
      adId: cleanAdId,
      campaignId: "camp_sponsored",
      startedAtMs: tokenData.startedAtMs,
      lastHeartbeatAtMs: tokenData.startedAtMs,
      watchedSeconds: 0,
      heartbeatCount: 0,
      requiredSeconds: tokenData.requiredSeconds,
      rewardKes: tokenData.rewardKes,
      pointsReward: tokenData.pointsReward,
      status: "started",
    };
  }

  if (existingSession.status === "completed") {
    return {
      recorded: true,
      watchedSeconds: existingSession.requiredSeconds,
      requiredSeconds: existingSession.requiredSeconds,
      remainingSeconds: 0,
    };
  }

  // Do not count heartbeat if paused, tab is hidden, or muted & hidden
  if (!params.isPlaying || !params.isTabVisible || params.isMutedAndHidden) {
    return {
      recorded: false,
      watchedSeconds: existingSession.watchedSeconds,
      requiredSeconds: existingSession.requiredSeconds,
      remainingSeconds: Math.max(
        0,
        existingSession.requiredSeconds - existingSession.watchedSeconds
      ),
      error: "Playback paused or tab hidden — timer paused.",
    };
  }

  // Cap each heartbeat increment to at most 5 seconds (and never more than actual server wall-clock elapsed)
  const requestedDelta = Math.max(
    1,
    Math.min(HEARTBEAT_INTERVAL_SECONDS, Math.trunc(Number(params.deltaSeconds) || HEARTBEAT_INTERVAL_SECONDS))
  );
  const maxWallClockElapsedSec = Math.max(
    0,
    Math.floor((nowMs - tokenData.startedAtMs) / 1000)
  );
  const nextWatchedSeconds = Math.min(
    existingSession.requiredSeconds,
    maxWallClockElapsedSec,
    existingSession.watchedSeconds + requestedDelta
  );

  const updatedSession: AdViewRecord = {
    ...existingSession,
    lastHeartbeatAtMs: nowMs,
    watchedSeconds: nextWatchedSeconds,
    heartbeatCount: existingSession.heartbeatCount + 1,
  };

  const nextState: WatchAdsStoreState = {
    ...state,
    sessions: [
      updatedSession,
      ...state.sessions.filter(
        (s) => s.sessionId !== updatedSession.sessionId && !(s.userId === cleanUserId && s.adId === cleanAdId)
      ),
    ],
  };

  if (!params.stateOverride) {
    saveWatchAdsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  return {
    recorded: true,
    watchedSeconds: updatedSession.watchedSeconds,
    requiredSeconds: updatedSession.requiredSeconds,
    remainingSeconds: Math.max(0, updatedSession.requiredSeconds - updatedSession.watchedSeconds),
  };
}

/**
 * Step 2: `POST /api/ads/complete`
 * Verifies:
 * 1. Signed `startToken` authenticity
 * 2. Elapsed server time >= `min_watch_seconds`
 * 3. Verified `watched_seconds` from heartbeats meets `min_watch_seconds` (when `requireHeartbeats` is true)
 * 4. Unique `(user_id, ad_id)` — never rewards the same ad twice
 * 5. Daily ad limit and cooldown
 * Credits KES & points atomically and idempotently.
 */
export function completeAdWatchServerSide(params: {
  userId: string;
  adId: string;
  startToken: string;
  requireHeartbeats?: boolean;
  nowMs?: number;
  stateOverride?: WatchAdsStoreState;
}): {
  completed: boolean;
  rewardKes?: number;
  pointsAwarded?: number;
  watchedTodayCount?: number;
  dailyLimit?: number;
  error?: string;
} {
  const state = params.stateOverride || getWatchAdsState();
  const cleanUserId = (params.userId || "").trim();
  const cleanAdId = (params.adId || "").trim();
  const nowMs = params.nowMs ?? Date.now();
  const todayPrefix = new Date(nowMs).toISOString().slice(0, 10);

  const verification = verifySignedStartToken(params.startToken);
  if (!verification.valid || !verification.payload) {
    return { completed: false, error: verification.error || "Invalid start token." };
  }

  const tokenData = verification.payload;
  if (tokenData.userId !== cleanUserId || tokenData.adId !== cleanAdId) {
    return { completed: false, error: "Watch session token does not match user or ad." };
  }

  // Rule 1: Unique (user_id, ad_id) — one reward per ad per user
  const existingCompleted = state.sessions.find(
    (s) => s.userId === cleanUserId && s.adId === cleanAdId && s.status === "completed"
  );
  if (existingCompleted) {
    return {
      completed: false,
      error: "Reward already claimed for this sponsored video ad.",
    };
  }

  // Rule 2: Daily limit check
  const completedToday = state.sessions.filter(
    (s) =>
      s.userId === cleanUserId &&
      s.status === "completed" &&
      new Date(s.completedAtMs || s.startedAtMs).toISOString().startsWith(todayPrefix)
  );
  if (completedToday.length >= DAILY_AD_WATCH_LIMIT) {
    return {
      completed: false,
      error: `Daily limit of ${DAILY_AD_WATCH_LIMIT} sponsored ads reached.`,
    };
  }

  // Rule 3: Minimum watch duration verified strictly by server timestamps
  const elapsedMs = nowMs - tokenData.startedAtMs;
  const requiredMs = tokenData.requiredSeconds * 1000;
  if (elapsedMs < requiredMs) {
    const remainingSec = Math.ceil((requiredMs - elapsedMs) / 1000);
    return {
      completed: false,
      error: `Minimum watch duration not met. Please watch for ${remainingSec} more second${
        remainingSec === 1 ? "" : "s"
      }.`,
    };
  }

  // Rule 4: Verify active playback heartbeats recorded on server
  const activeSession = state.sessions.find(
    (s) =>
      s.sessionId === tokenData.sessionId ||
      (s.userId === cleanUserId && s.adId === cleanAdId && s.status === "started")
  );

  if (params.requireHeartbeats) {
    const verifiedWatchedSec = activeSession?.watchedSeconds ?? 0;
    const minRequiredHeartbeats = Math.max(
      1,
      Math.floor(tokenData.requiredSeconds / HEARTBEAT_INTERVAL_SECONDS) - 1
    );
    if (
      verifiedWatchedSec < tokenData.requiredSeconds - HEARTBEAT_INTERVAL_SECONDS ||
      (activeSession?.heartbeatCount ?? 0) < minRequiredHeartbeats
    ) {
      return {
        completed: false,
        error:
          "Active video playback verification incomplete. Please keep the video playing and tab visible until the timer finishes.",
      };
    }
  }

  const completedSession: AdViewRecord = {
    sessionId: tokenData.sessionId,
    userId: cleanUserId,
    adId: cleanAdId,
    campaignId: activeSession?.campaignId || "camp_sponsored",
    startedAtMs: tokenData.startedAtMs,
    lastHeartbeatAtMs: nowMs,
    watchedSeconds: tokenData.requiredSeconds,
    heartbeatCount: Math.max(activeSession?.heartbeatCount ?? 3, 3),
    requiredSeconds: tokenData.requiredSeconds,
    completedAtMs: nowMs,
    rewardedAtMs: nowMs,
    rewardKes: tokenData.rewardKes,
    pointsReward: tokenData.pointsReward,
    status: "completed",
  };

  const nextState: WatchAdsStoreState = {
    ...state,
    sessions: [
      completedSession,
      ...state.sessions.filter(
        (s) =>
          s.sessionId !== tokenData.sessionId &&
          !(s.userId === cleanUserId && s.adId === cleanAdId)
      ),
    ],
  };

  if (!params.stateOverride) {
    saveWatchAdsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  // Award points idempotently via server points engine
  const pointsRes = awardPointsServerSide({
    userId: cleanUserId,
    reason: "watched_ad",
    referenceId: `AD_WATCH:${cleanAdId}`,
    customDescription: `Watched Sponsored Video Ad (${cleanAdId})`,
    pointsOverride: tokenData.pointsReward,
    nowIso: new Date(nowMs).toISOString(),
  });

  return {
    completed: true,
    rewardKes: tokenData.rewardKes,
    pointsAwarded: pointsRes.pointsAdded || tokenData.pointsReward,
    watchedTodayCount: completedToday.length + 1,
    dailyLimit: DAILY_AD_WATCH_LIMIT,
  };
}

/**
 * Advertiser / Admin: Create a new video ad (defaults to `pending_approval` for advertisers, or `active` for admins).
 */
export function createVideoAdServerSide(params: {
  businessName: string;
  title: string;
  headline: string;
  description: string;
  videoUrl: string;
  videoType: VideoAdSourceType;
  thumbnailUrl?: string;
  advertiserUrl?: string;
  durationSeconds: number;
  minWatchSeconds?: number;
  rewardKes: number;
  pointsReward?: number;
  rightsAttested: boolean;
  isAdmin?: boolean;
  campaignId?: string;
  advertiserId?: string;
  stateOverride?: WatchAdsStoreState;
}): { created: boolean; ad?: SponsoredWatchAdItem; error?: string } {
  const state = params.stateOverride || getWatchAdsState();

  if (!params.rightsAttested) {
    return {
      created: false,
      error: "You must confirm that you own the full rights to the video before uploading.",
    };
  }

  const title = (params.title || "").trim();
  const businessName = (params.businessName || "").trim();
  const videoUrl = (params.videoUrl || "").trim();

  if (title.length < 4 || businessName.length < 2 || !videoUrl) {
    return {
      created: false,
      error: "Business name, ad title, and a valid video file or URL are required.",
    };
  }

  const durationSec = Math.max(5, Math.min(60, Math.trunc(Number(params.durationSeconds) || 15)));
  const minWatchSec = Math.max(
    5,
    Math.min(durationSec, Math.trunc(Number(params.minWatchSeconds) || durationSec))
  );
  const rewardKes = Math.max(5, Math.trunc(Number(params.rewardKes) || 15));
  const pointsReward = Math.max(1, Math.trunc(Number(params.pointsReward) || POINT_AWARD_VALUES.watched_ad));

  const newAd: SponsoredWatchAdItem = {
    id: `ad_vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    campaignId: params.campaignId || "camp_custom",
    advertiserId: params.advertiserId || "adv_custom",
    businessName,
    title,
    headline: (params.headline || title).trim(),
    description: (params.description || title).trim(),
    categoryTag: "Sponsored",
    videoUrl,
    videoType: params.videoType === "embedded" ? "embedded" : "hosted",
    thumbnailUrl: params.thumbnailUrl || "/videos/thumb-1.svg",
    advertiserUrl: params.advertiserUrl || "https://earnora.co.ke",
    ctaLabel: `Visit ${businessName}`,
    ctaUrl: params.advertiserUrl || "/earn",
    durationSeconds: durationSec,
    minWatchSeconds: minWatchSec,
    rewardKes,
    pointsReward,
    status: params.isAdmin ? "active" : "pending_approval",
    rightsAttested: true,
    isDemoData: false,
    isSponsored: true,
    createdAt: new Date().toISOString(),
  };

  const nextState: WatchAdsStoreState = {
    ...state,
    customAds: [newAd, ...(state.customAds || [])],
  };

  if (!params.stateOverride) {
    saveWatchAdsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  return { created: true, ad: newAd };
}

/**
 * Admin: Approve, pause, or reject a video ad.
 */
export function updateVideoAdStatusServerSide(params: {
  adId: string;
  status: VideoAdStatus;
  stateOverride?: WatchAdsStoreState;
}): { updated: boolean; ad?: SponsoredWatchAdItem } {
  const state = params.stateOverride || getWatchAdsState();
  const customIdx = state.customAds.findIndex((a) => a.id === params.adId);

  if (customIdx >= 0) {
    const updatedAd: SponsoredWatchAdItem = {
      ...state.customAds[customIdx],
      status: params.status,
    };
    const nextCustom = [...state.customAds];
    nextCustom[customIdx] = updatedAd;
    const nextState: WatchAdsStoreState = {
      ...state,
      customAds: nextCustom,
    };
    if (!params.stateOverride) {
      saveWatchAdsState(nextState);
    } else {
      Object.assign(params.stateOverride, nextState);
    }
    return { updated: true, ad: updatedAd };
  }

  return { updated: false };
}

/**
 * Admin: Delete a video ad (including 1-click deletion of seeded demo sample ads).
 */
export function deleteVideoAdServerSide(params: {
  adId: string;
  stateOverride?: WatchAdsStoreState;
}): { deleted: boolean } {
  const state = params.stateOverride || getWatchAdsState();
  const cleanId = (params.adId || "").trim();
  if (!cleanId) return { deleted: false };

  const nextState: WatchAdsStoreState = {
    ...state,
    customAds: (state.customAds || []).filter((a) => a.id !== cleanId),
    deletedAdIds: Array.from(new Set([...(state.deletedAdIds || []), cleanId])),
  };

  if (!params.stateOverride) {
    saveWatchAdsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  return { deleted: true };
}
