export type TierLevelName = "Starter" | "Bronze" | "Silver" | "Gold" | "Platinum";

export type PointAwardReason =
  | "approved_task"
  | "approved_review"
  | "watched_ad"
  | "daily_login"
  | "streak_3d"
  | "streak_7d"
  | "streak_30d"
  | "revoked_submission";

export interface TierLevelConfig {
  name: TierLevelName;
  tierOrder: number;
  minPoints: number;
  dailyWithdrawalLimitKes: number;
  maxPerWithdrawalKes: number;
  badgeColor: string;
  description: string;
}

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  points: number;
  reason: PointAwardReason | string;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface UserPointsRecord {
  userId: string;
  totalPoints: number;
  level: TierLevelName;
  updatedAt: string;
}

export interface UserPointsSummary {
  userId: string;
  totalPoints: number;
  currentTier: TierLevelConfig;
  nextTier: TierLevelConfig | null;
  pointsToNextTier: number;
  progressPercent: number;
  ledger: PointsLedgerEntry[];
}

export interface WithdrawalLimitCheckResult {
  allowed: boolean;
  requestedAmountKes: number;
  withdrawnTodayKes: number;
  remainingDailyLimitKes: number;
  currentTier: TierLevelConfig;
  nextTier: TierLevelConfig | null;
  recommendedTier: TierLevelConfig | null;
  reasonCode?: "EXCEEDS_PER_TX_LIMIT" | "EXCEEDS_DAILY_LIMIT" | "INVALID_AMOUNT";
  message?: string;
}
