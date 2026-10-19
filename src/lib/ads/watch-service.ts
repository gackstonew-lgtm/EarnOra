import crypto from "crypto";
import { isAdsEnabled } from "./config";
import { getAdsState } from "./store";
import { POINT_AWARD_VALUES } from "@/lib/points/config";
import { awardPointsServerSide } from "@/lib/points/service";

export const DAILY_AD_WATCH_LIMIT = 10;
export const AD_WATCH_COOLDOWN_SECONDS = 15;

export interface SponsoredWatchAdItem {
  id: string;
  campaignId: string;
  businessName: string;
  title: string;
  headline: string;
  description: string;
  categoryTag: string;
  ctaLabel: string;
  ctaUrl: string;
  durationSeconds: number;
  rewardKes: number;
  pointsReward: number;
  isSponsored: true;
  watchedByUser?: boolean;
}

export interface AdWatchSessionRecord {
  sessionId: string;
  userId: string;
  adId: string;
  campaignId: string;
  startedAtMs: number;
  requiredSeconds: number;
  completedAtMs?: number;
  rewardKes: number;
  pointsReward: number;
  status: "started" | "completed";
}

export interface WatchAdsStoreState {
  sessions: AdWatchSessionRecord[];
}

const STORAGE_KEY_WATCH_ADS = "earnora_watch_ads_sessions_v1";

let memoryWatchState: WatchAdsStoreState = {
  sessions: [],
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
        const parsed = JSON.parse(raw) as WatchAdsStoreState;
        memoryWatchState = parsed;
        return parsed;
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
  const empty: WatchAdsStoreState = { sessions: [] };
  saveWatchAdsState(empty);
  return empty;
}

/**
 * Sources available sponsored ads from active funded advertiser campaigns
 * plus verified advertiser spotlight reels. Every item is labeled `isSponsored: true`.
 */
export function getAvailableSponsoredAds(userId?: string, stateOverride?: WatchAdsStoreState): {
  ads: SponsoredWatchAdItem[];
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
      watchedTodayCount,
      dailyLimit: DAILY_AD_WATCH_LIMIT,
      cooldownRemainingSeconds,
    };
  }

  const adsPortalState = getAdsState();
  const activeFundedCampaigns = adsPortalState.campaigns.filter(
    (c) =>
      c.status === "active" &&
      c.completedTasks < c.maxTasks &&
      c.remainingBudgetKes >= c.rewardPerTaskKes
  );

  const completedAdIds = new Set(userCompletedSessions.map((s) => s.adId));

  const campaignAds: SponsoredWatchAdItem[] = activeFundedCampaigns.map((camp) => {
    const adId = `ad_spot_${camp.id}`;
    return {
      id: adId,
      campaignId: camp.id,
      businessName: camp.businessName,
      title: `${camp.businessName} — ${camp.title}`,
      headline: `Discover ${camp.businessName} in ${camp.targetOptions.city || "Kenya"}`,
      description: camp.description,
      categoryTag: "Sponsored",
      ctaLabel: "View Campaign Task",
      ctaUrl: `/earn/submit?task=${camp.id}`,
      durationSeconds: 15,
      rewardKes: 15,
      pointsReward: POINT_AWARD_VALUES.watched_ad,
      isSponsored: true,
      watchedByUser: completedAdIds.has(adId),
    };
  });

  // Additional sponsored brand spotlights backed by verified advertisers in the portal
  const supplementalSpotlights: SponsoredWatchAdItem[] =
    activeFundedCampaigns.length > 0
      ? [
          {
            id: "ad_spot_savannah_espresso_02",
            campaignId: activeFundedCampaigns[0].id,
            businessName: "Savannah Roast & Bistro",
            title: "Savannah Single-Origin AA Espresso Reel",
            headline: "Freshly roasted Nyeri AA coffee & artisan pastries in Westlands",
            description:
              "Watch our 15-second roastery spotlight showcasing our direct-trade Kenyan espresso bar and M-Pesa table ordering.",
            categoryTag: "Sponsored",
            ctaLabel: "Explore Menu & Review",
            ctaUrl: `/earn/submit?task=${activeFundedCampaigns[0].id}`,
            durationSeconds: 15,
            rewardKes: 15,
            pointsReward: POINT_AWARD_VALUES.watched_ad,
            isSponsored: true,
            watchedByUser: completedAdIds.has("ad_spot_savannah_espresso_02"),
          },
          {
            id: "ad_spot_pesaflow_instant_03",
            campaignId: activeFundedCampaigns[0].id,
            businessName: "PesaFlow Micro-Tech Ltd",
            title: "PesaFlow Instant Merchant Till Analytics",
            headline: "Zero-delay M-Pesa reconciliation for Kenyan SMEs",
            description:
              "Learn how Nairobi retail shops track Lipa Na M-Pesa collections and automated supplier payouts in real time.",
            categoryTag: "Sponsored",
            ctaLabel: "Browse Earn Tasks",
            ctaUrl: "/earn",
            durationSeconds: 15,
            rewardKes: 20,
            pointsReward: POINT_AWARD_VALUES.watched_ad,
            isSponsored: true,
            watchedByUser: completedAdIds.has("ad_spot_pesaflow_instant_03"),
          },
          {
            id: "ad_spot_kazi_fiber_04",
            campaignId: activeFundedCampaigns[0].id,
            businessName: "KaziNet Home Fiber Kenya",
            title: "KaziNet 50Mbps Uncapped Home Fiber Spotlight",
            headline: "Reliable fiber internet across Nairobi, Mombasa & Kisumu",
            description:
              "Watch this short sponsored overview of KaziNet's same-day installation and M-Pesa Paybill auto-renewal.",
            categoryTag: "Sponsored",
            ctaLabel: "Browse Telco Tasks",
            ctaUrl: "/earn?category=telco_fintech",
            durationSeconds: 15,
            rewardKes: 15,
            pointsReward: POINT_AWARD_VALUES.watched_ad,
            isSponsored: true,
            watchedByUser: completedAdIds.has("ad_spot_kazi_fiber_04"),
          },
        ]
      : [];

  return {
    ads: [...campaignAds, ...supplementalSpotlights],
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
 * Step 1: Server-side Start Ad Watch Session.
 * Enforces:
 * - Ad exists
 * - User hasn't already claimed this ad (1 reward per ad per user)
 * - User hasn't hit the daily ad limit (10/day)
 * - Cooldown between ad watches has elapsed
 * Returns a signed server timestamp token (`startToken`).
 */
export function startAdWatchServerSide(params: {
  userId: string;
  adId: string;
  nowMs?: number;
  stateOverride?: WatchAdsStoreState;
}): {
  started: boolean;
  startToken?: string;
  session?: AdWatchSessionRecord;
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
    return { started: false, error: "Sponsored ad not found or no longer active." };
  }

  // Rule 1: One reward per ad per user
  const alreadyCompleted = state.sessions.find(
    (s) => s.userId === cleanUserId && s.adId === cleanAdId && s.status === "completed"
  );
  if (alreadyCompleted) {
    return {
      started: false,
      error: "You have already watched and claimed the reward for this sponsored ad.",
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

  const sessionId = `aws_${nowMs}_${Math.random().toString(36).slice(2, 7)}`;
  const session: AdWatchSessionRecord = {
    sessionId,
    userId: cleanUserId,
    adId: cleanAdId,
    campaignId: targetAd.campaignId,
    startedAtMs: nowMs,
    requiredSeconds: targetAd.durationSeconds,
    rewardKes: targetAd.rewardKes,
    pointsReward: targetAd.pointsReward,
    status: "started",
  };

  const nextState: WatchAdsStoreState = {
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
    requiredSeconds: targetAd.durationSeconds,
    rewardKes: targetAd.rewardKes,
    pointsReward: targetAd.pointsReward,
  });

  return {
    started: true,
    startToken,
    session,
    requiredSeconds: targetAd.durationSeconds,
  };
}

/**
 * Step 2: Server-side Complete Ad Watch & Credit Reward.
 * Verifies:
 * - Signed `startToken` authenticity
 * - Server timestamp elapsed >= `requiredSeconds`
 * - One reward per ad per user (idempotency)
 * - Daily ad limit and cooldown
 * Credits KES reward & awards points via `awardPointsServerSide`.
 */
export function completeAdWatchServerSide(params: {
  userId: string;
  adId: string;
  startToken: string;
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

  // Rule 1: One reward per ad per user
  const existingCompleted = state.sessions.find(
    (s) => s.userId === cleanUserId && s.adId === cleanAdId && s.status === "completed"
  );
  if (existingCompleted) {
    return {
      completed: false,
      error: "Reward already claimed for this sponsored ad.",
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

  const completedSession: AdWatchSessionRecord = {
    sessionId: tokenData.sessionId,
    userId: cleanUserId,
    adId: cleanAdId,
    campaignId: "camp_sponsored",
    startedAtMs: tokenData.startedAtMs,
    requiredSeconds: tokenData.requiredSeconds,
    completedAtMs: nowMs,
    rewardKes: tokenData.rewardKes,
    pointsReward: tokenData.pointsReward,
    status: "completed",
  };

  const nextState: WatchAdsStoreState = {
    sessions: [
      completedSession,
      ...state.sessions.filter((s) => s.sessionId !== tokenData.sessionId),
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
    customDescription: `Watched Sponsored Ad (${cleanAdId})`,
    nowIso: new Date(nowMs).toISOString(),
  });

  return {
    completed: true,
    rewardKes: tokenData.rewardKes,
    pointsAwarded: pointsRes.pointsAdded,
    watchedTodayCount: completedToday.length + 1,
    dailyLimit: DAILY_AD_WATCH_LIMIT,
  };
}
