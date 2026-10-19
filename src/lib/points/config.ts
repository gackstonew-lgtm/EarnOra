import { PointAwardReason, TierLevelConfig } from "./types";

/**
 * Configurable Tier Levels & Withdrawal Limits (KES integers).
 * Starter preserves the existing baseline withdrawal behavior for new/current users.
 */
export const TIER_LEVELS_CONFIG: TierLevelConfig[] = [
  {
    name: "Starter",
    tierOrder: 1,
    minPoints: 0,
    dailyWithdrawalLimitKes: 2500,
    maxPerWithdrawalKes: 1500,
    badgeColor: "#64748B",
    description: "Default entry tier for all verified EarnOra members.",
  },
  {
    name: "Bronze",
    tierOrder: 2,
    minPoints: 150,
    dailyWithdrawalLimitKes: 5000,
    maxPerWithdrawalKes: 3000,
    badgeColor: "#D97706",
    description: "Active contributors with consistent verified tasks and daily streaks.",
  },
  {
    name: "Silver",
    tierOrder: 3,
    minPoints: 500,
    dailyWithdrawalLimitKes: 15000,
    maxPerWithdrawalKes: 7500,
    badgeColor: "#0284C7",
    description: "Trusted reviewers with elevated daily M-Pesa B2C payout capacity.",
  },
  {
    name: "Gold",
    tierOrder: 4,
    minPoints: 1500,
    dailyWithdrawalLimitKes: 35000,
    maxPerWithdrawalKes: 15000,
    badgeColor: "#F59E0B",
    description: "High-trust reviewers with priority moderation and high daily limits.",
  },
  {
    name: "Platinum",
    tierOrder: 5,
    minPoints: 5000,
    dailyWithdrawalLimitKes: 100000,
    maxPerWithdrawalKes: 50000,
    badgeColor: "#1E6FD9",
    description: "Top-tier EarnOra contributors with maximum M-Pesa withdrawal limits.",
  },
];

/**
 * Configurable server-side point award amounts.
 * Values are read from this central config and never trusted from client requests.
 */
export const POINT_AWARD_VALUES: Record<Exclude<PointAwardReason, "revoked_submission">, number> = {
  approved_task: Number(process.env.POINTS_APPROVED_TASK || 10),
  approved_review: Number(process.env.POINTS_APPROVED_REVIEW || 15),
  watched_ad: Number(process.env.POINTS_WATCHED_AD || 2),
  daily_login: Number(process.env.POINTS_DAILY_LOGIN || 1),
  streak_3d: Number(process.env.POINTS_STREAK_3D || 5),
  streak_7d: Number(process.env.POINTS_STREAK_7D || 15),
  streak_30d: Number(process.env.POINTS_STREAK_30D || 50),
};

/**
 * Daily maximum points or occurrences allowed per point source per user (anti-abuse cap).
 */
export const DAILY_SOURCE_MAX_COUNT: Record<Exclude<PointAwardReason, "revoked_submission">, number> = {
  approved_task: 10,
  approved_review: 10,
  watched_ad: 10,
  daily_login: 1,
  streak_3d: 1,
  streak_7d: 1,
  streak_30d: 1,
};

export const POINT_REASON_LABELS: Record<string, string> = {
  approved_task: "Approved Task",
  approved_review: "Approved First-Hand Review",
  watched_ad: "Watched Sponsored Ad",
  daily_login: "Daily Login Check-In",
  streak_3d: "3-Day Streak Milestone Bonus",
  streak_7d: "7-Day Streak Milestone Bonus",
  streak_30d: "30-Day Streak Milestone Bonus",
  revoked_submission: "Submission Rejected / Flagged Revocation",
};
