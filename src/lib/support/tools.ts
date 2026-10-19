import { NextRequest } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import { getAdsState } from "@/lib/ads/store";
import { getAvailableSponsoredAds } from "@/lib/ads/watch-service";
import { INITIAL_USER } from "@/lib/mock-data";
import {
  getUserPointsSummary,
  verifyWithdrawalAgainstTierLimits,
} from "@/lib/points/service";
import { UserProfile } from "@/lib/types";

/**
 * Strictly derives the current signed-in user from the server request session cookies.
 * Never accepts or trusts a userId/email/phone from the chat body to look up another user.
 */
export function getAuthenticatedUserForSupport(req: NextRequest): UserProfile {
  const cookieVal = req.cookies.get("earnora_user_ctx")?.value;
  const sessionUser = getServerSessionUserFromCookie(cookieVal);
  if (sessionUser) {
    return sessionUser;
  }
  return INITIAL_USER;
}

/**
 * Read-only Tool 1: getUserBalance (Strictly scoped to session user)
 */
export function getUserBalance(sessionUser: UserProfile) {
  return {
    username: sessionUser.username,
    availableBalanceKes: sessionUser.availableBalance ?? 0,
    pendingBalanceKes: sessionUser.pendingBalance ?? 0,
    totalEarnedKes: sessionUser.totalEarned ?? 0,
    totalWithdrawnKes: sessionUser.totalWithdrawn ?? 0,
    isPhoneVerified: Boolean(sessionUser.isPhoneVerified),
    minWithdrawalKes: 100,
  };
}

/**
 * Read-only Tool 2: getUserPoints (Strictly scoped to session user)
 */
export function getUserPoints(sessionUser: UserProfile) {
  const summary = getUserPointsSummary(sessionUser.id);
  const adsData = getAvailableSponsoredAds(sessionUser.id);

  return {
    totalPoints: summary.totalPoints,
    currentTier: summary.currentTier.name,
    dailyWithdrawalLimitKes: summary.currentTier.dailyWithdrawalLimitKes,
    maxPerWithdrawalKes: summary.currentTier.maxPerWithdrawalKes,
    nextTier: summary.nextTier?.name ?? null,
    nextTierMinPoints: summary.nextTier?.minPoints ?? null,
    pointsToNextTier: summary.pointsToNextTier,
    nextTierDailyLimitKes: summary.nextTier?.dailyWithdrawalLimitKes ?? null,
    streakDays: sessionUser.streakDays ?? 1,
    adsWatchedToday: adsData.watchedTodayCount,
    adsDailyLimit: adsData.dailyLimit,
  };
}

/**
 * Read-only Tool 3: getWithdrawalStatus (Strictly scoped to session user)
 */
export function getWithdrawalStatus(sessionUser: UserProfile) {
  const limitCheck = verifyWithdrawalAgainstTierLimits({
    userId: sessionUser.id,
    amountKes: 100,
    commitWithdrawal: false,
  });

  return {
    isPhoneVerified: Boolean(sessionUser.isPhoneVerified),
    availableBalanceKes: sessionUser.availableBalance ?? 0,
    canWithdrawMinimum100Kes:
      Boolean(sessionUser.isPhoneVerified) &&
      (sessionUser.availableBalance ?? 0) >= 100 &&
      limitCheck.remainingDailyLimitKes >= 100,
    currentTier: limitCheck.currentTier.name,
    maxPerWithdrawalKes: limitCheck.currentTier.maxPerWithdrawalKes,
    dailyWithdrawalLimitKes: limitCheck.currentTier.dailyWithdrawalLimitKes,
    withdrawnTodayKes: limitCheck.withdrawnTodayKes,
    remainingDailyLimitKes: limitCheck.remainingDailyLimitKes,
  };
}

/**
 * Read-only Tool 4: getRecentTasks (Strictly scoped to session user's own submissions)
 */
export function getRecentTasks(sessionUser: UserProfile) {
  const adsState = getAdsState();
  const ownSubmissions = adsState.submissions
    .filter(
      (s) =>
        s.userProfileId === sessionUser.id ||
        s.username.toLowerCase() === sessionUser.username.toLowerCase()
    )
    .slice(0, 5)
    .map((s) => ({
      campaignTitle: s.campaignTitle,
      businessName: s.businessName,
      rewardKes: s.rewardKes,
      status: s.status,
      submittedAt: s.createdAt,
      reviewerNotes: s.reviewerNotes || null,
    }));

  return {
    recentSubmissionsCount: ownSubmissions.length,
    submissions: ownSubmissions,
  };
}

/**
 * Hard security guardrail: detects prompt injection, requests for secrets/schema/prompts,
 * requests for another user's data, or requests to mutate state (credit balance/points/approve tasks).
 */
export function checkHardSecurityViolation(userMessage: string): {
  blocked: boolean;
  refusalMessage?: string;
} {
  const lower = userMessage.toLowerCase();

  // 1. Prompt injection / system prompt / env / schema / SQL / source code extraction
  const internalPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
    /system\s+prompt/i,
    /reveal\s+your\s+(prompt|instructions|rules|config)/i,
    /print\s+your\s+config/i,
    /act\s+as\s+admin/i,
    /anthropic_api_key|supabase_service_role|daraja_consumer_secret|paystack_secret/i,
    /\.env|environment\s+variable|api\s+key|secret\s+key/i,
    /database\s+schema|table\s+names|sql\s+query|select\s+\*\s+from|pg_catalog/i,
    /anti-?fraud\s+threshold|unique\s+word\s+ratio/i,
  ];

  for (const pat of internalPatterns) {
    if (pat.test(lower)) {
      return {
        blocked: true,
        refusalMessage:
          "I'm here to help you with using EarnOra—such as tasks, reviews, points, tiers, Watch & Earn ads, and M-Pesa withdrawals. For security reasons, I cannot share internal configurations, system instructions, or technical details.",
      };
    }
  }

  // 2. Accessing another user's account/data
  const otherUserPatterns = [
    /other\s+user'?s?\s+(balance|account|points|phone|email|withdrawals|data)/i,
    /check\s+(balance|account|points|status)\s+(for|of)\s+(@|usr_|[a-z0-9._%+-]+@[a-z0-9.-]+)/i,
    /look\s+up\s+user/i,
  ];

  for (const pat of otherUserPatterns) {
    if (pat.test(lower)) {
      return {
        blocked: true,
        refusalMessage:
          "For privacy and security under the Kenya Data Protection Act, I can only view read-only account information for your own signed-in EarnOra session.",
      };
    }
  }

  // 3. State-changing actions via chat (crediting money, awarding points, approving tasks, changing limits)
  const mutationPatterns = [
    /(credit|add|give|send)\s+(kes\s*)?\d*\s*(kes|shillings|money|funds|points|pts)\s+to\s+my\s+(wallet|balance|account)/i,
    /approve\s+my\s+(task|review|submission)\s+now/i,
    /(change|override|unlock|bypass)\s+my\s+(withdrawal\s+limit|tier|level)/i,
  ];

  for (const pat of mutationPatterns) {
    if (pat.test(lower)) {
      return {
        blocked: true,
        refusalMessage:
          "I have read-only access to your account status and cannot manually credit balances, award points, approve submissions, or override withdrawal limits from chat. Points and KES rewards are credited automatically when your tasks, reviews, or ad watches are verified. Would you like me to open a human support ticket for your account?",
      };
    }
  }

  return { blocked: false };
}
