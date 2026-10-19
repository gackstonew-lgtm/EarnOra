import {
  DAILY_SOURCE_MAX_COUNT,
  POINT_AWARD_VALUES,
  POINT_REASON_LABELS,
  TIER_LEVELS_CONFIG,
} from "./config";
import {
  PointAwardReason,
  PointsLedgerEntry,
  TierLevelConfig,
  UserPointsRecord,
  UserPointsSummary,
  WithdrawalLimitCheckResult,
} from "./types";

const STORAGE_KEY_POINTS_STATE = "earnora_points_system_state_v1";

export interface PointsStoreState {
  levels: TierLevelConfig[];
  userPoints: Record<string, UserPointsRecord>;
  ledger: PointsLedgerEntry[];
  dailyWithdrawals: Array<{
    id: string;
    userId: string;
    amountKes: number;
    createdAt: string;
  }>;
}

const SEED_DEMO_USER_ID = "usr_demo_ke_01";

function createInitialPointsState(): PointsStoreState {
  const isMockAllowed =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (isMockAllowed) {
    return {
      levels: [...TIER_LEVELS_CONFIG],
      userPoints: {
        [SEED_DEMO_USER_ID]: {
          userId: SEED_DEMO_USER_ID,
          totalPoints: 215,
          level: "Bronze",
          updatedAt: "2026-10-19T08:00:00Z",
        },
      },
      ledger: [
        {
          id: "ptx_seed_1",
          userId: SEED_DEMO_USER_ID,
          points: 15,
          reason: "approved_review",
          referenceId: "SEED_REVIEW_JAVA_01",
          description: "Approved First-Hand Review: Java House Westlands",
          createdAt: "2026-10-18T14:20:00Z",
        },
        {
          id: "ptx_seed_2",
          userId: SEED_DEMO_USER_ID,
          points: 200,
          reason: "approved_task",
          referenceId: "SEED_INITIAL_TIER_BONUS",
          description: "Verified Reviewer Milestone Points",
          createdAt: "2026-10-15T10:00:00Z",
        },
      ],
      dailyWithdrawals: [],
    };
  }

  return {
    levels: [...TIER_LEVELS_CONFIG],
    userPoints: {},
    ledger: [],
    dailyWithdrawals: [],
  };
}

let memoryPointsState: PointsStoreState = createInitialPointsState();

export function getPointsState(): PointsStoreState {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_POINTS_STATE);
      if (raw) {
        const parsed = JSON.parse(raw) as PointsStoreState;
        memoryPointsState = parsed;
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
  }
  return memoryPointsState;
}

export function savePointsState(nextState: PointsStoreState): void {
  memoryPointsState = nextState;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_POINTS_STATE, JSON.stringify(nextState));
    } catch {
      // ignore storage errors
    }
  }
}

export function resetPointsStateForTesting(customLevels?: TierLevelConfig[]): PointsStoreState {
  const fresh: PointsStoreState = {
    levels: customLevels ? [...customLevels] : [...TIER_LEVELS_CONFIG],
    userPoints: {},
    ledger: [],
    dailyWithdrawals: [],
  };
  savePointsState(fresh);
  return fresh;
}

/**
 * Pure level calculation based on totalPoints and sorted TierLevelConfig[].
 */
export function calculateLevelForPoints(
  totalPoints: number,
  levels: TierLevelConfig[] = TIER_LEVELS_CONFIG
): {
  currentTier: TierLevelConfig;
  nextTier: TierLevelConfig | null;
  pointsToNextTier: number;
  progressPercent: number;
} {
  const safePoints = Math.max(0, Math.trunc(Number(totalPoints) || 0));
  const sorted = [...levels].sort((a, b) => a.minPoints - b.minPoints);

  let currentTier = sorted[0];
  let nextTier: TierLevelConfig | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (safePoints >= sorted[i].minPoints) {
      currentTier = sorted[i];
      nextTier = sorted[i + 1] ?? null;
    } else {
      if (!nextTier) {
        nextTier = sorted[i];
      }
      break;
    }
  }

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      pointsToNextTier: 0,
      progressPercent: 100,
    };
  }

  const pointsToNextTier = Math.max(0, nextTier.minPoints - safePoints);
  const tierSpan = Math.max(1, nextTier.minPoints - currentTier.minPoints);
  const earnedInTier = Math.max(0, safePoints - currentTier.minPoints);
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInTier / tierSpan) * 100)));

  return {
    currentTier,
    nextTier,
    pointsToNextTier,
    progressPercent,
  };
}

/**
 * Returns full points summary, current/next tier, and append-only ledger for a user.
 */
export function getUserPointsSummary(
  userId: string,
  stateOverride?: PointsStoreState
): UserPointsSummary {
  const state = stateOverride || getPointsState();
  const cleanUserId = (userId || "usr_guest").trim();
  const record = state.userPoints[cleanUserId] || {
    userId: cleanUserId,
    totalPoints: 0,
    level: "Starter",
    updatedAt: new Date().toISOString(),
  };

  const calc = calculateLevelForPoints(record.totalPoints, state.levels);
  const userLedger = state.ledger.filter((entry) => entry.userId === cleanUserId);

  return {
    userId: cleanUserId,
    totalPoints: record.totalPoints,
    currentTier: calc.currentTier,
    nextTier: calc.nextTier,
    pointsToNextTier: calc.pointsToNextTier,
    progressPercent: calc.progressPercent,
    ledger: userLedger,
  };
}

/**
 * Server-side atomic point award function.
 * - Idempotent: same (userId, referenceId) never awards twice.
 * - Enforces daily caps per point source.
 * - Uses server-side configured point values (or explicit integer override for custom server events).
 */
export function awardPointsServerSide(params: {
  userId: string;
  reason: Exclude<PointAwardReason, "revoked_submission">;
  referenceId: string;
  customDescription?: string;
  pointsOverride?: number;
  nowIso?: string;
  stateOverride?: PointsStoreState;
}): {
  awarded: boolean;
  idempotent: boolean;
  dailyCapReached: boolean;
  pointsAdded: number;
  summary: UserPointsSummary;
  entry?: PointsLedgerEntry;
  error?: string;
} {
  const state = params.stateOverride || getPointsState();
  const cleanUserId = (params.userId || "").trim();
  const cleanRef = (params.referenceId || "").trim();
  const nowIso = params.nowIso || new Date().toISOString();

  if (!cleanUserId || !cleanRef) {
    throw new Error("userId and referenceId are required to award points.");
  }

  // 1. Idempotency check: never award twice for the same (userId, referenceId)
  const existing = state.ledger.find(
    (e) => e.userId === cleanUserId && e.referenceId === cleanRef
  );
  if (existing) {
    return {
      awarded: false,
      idempotent: true,
      dailyCapReached: false,
      pointsAdded: 0,
      summary: getUserPointsSummary(cleanUserId, state),
      entry: existing,
    };
  }

  // 2. Daily source cap check (UTC day prefix YYYY-MM-DD)
  const dayPrefix = nowIso.slice(0, 10);
  const maxDailyCount = DAILY_SOURCE_MAX_COUNT[params.reason] ?? 10;
  const todaySourceEntries = state.ledger.filter(
    (e) =>
      e.userId === cleanUserId &&
      e.reason === params.reason &&
      e.points > 0 &&
      e.createdAt.startsWith(dayPrefix)
  );

  if (todaySourceEntries.length >= maxDailyCount) {
    return {
      awarded: false,
      idempotent: false,
      dailyCapReached: true,
      pointsAdded: 0,
      summary: getUserPointsSummary(cleanUserId, state),
      error: `Daily cap reached for ${POINT_REASON_LABELS[params.reason] || params.reason} (${maxDailyCount}/day).`,
    };
  }

  const configuredPoints =
    params.pointsOverride !== undefined
      ? Math.trunc(params.pointsOverride)
      : POINT_AWARD_VALUES[params.reason];

  if (!Number.isSafeInteger(configuredPoints) || configuredPoints <= 0) {
    throw new Error("Awarded points must be a positive integer.");
  }

  const existingRecord = state.userPoints[cleanUserId] || {
    userId: cleanUserId,
    totalPoints: 0,
    level: "Starter",
    updatedAt: nowIso,
  };

  const newTotalPoints = existingRecord.totalPoints + configuredPoints;
  const levelCalc = calculateLevelForPoints(newTotalPoints, state.levels);

  const newEntry: PointsLedgerEntry = {
    id: `ptx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: cleanUserId,
    points: configuredPoints,
    reason: params.reason,
    referenceId: cleanRef,
    description:
      params.customDescription ||
      `${POINT_REASON_LABELS[params.reason] || params.reason} (+${configuredPoints} pts)`,
    createdAt: nowIso,
  };

  const updatedRecord: UserPointsRecord = {
    userId: cleanUserId,
    totalPoints: newTotalPoints,
    level: levelCalc.currentTier.name,
    updatedAt: nowIso,
  };

  const nextState: PointsStoreState = {
    ...state,
    userPoints: {
      ...state.userPoints,
      [cleanUserId]: updatedRecord,
    },
    ledger: [newEntry, ...state.ledger],
  };

  if (!params.stateOverride) {
    savePointsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  return {
    awarded: true,
    idempotent: false,
    dailyCapReached: false,
    pointsAdded: configuredPoints,
    summary: getUserPointsSummary(cleanUserId, nextState),
    entry: newEntry,
  };
}

/**
 * Revokes previously awarded points when a submission is later rejected or flagged.
 * Appends a negative entry to points_ledger (never mutating or deleting existing rows).
 */
export function revokePointsForReferenceServerSide(params: {
  userId: string;
  originalReferenceId: string;
  reasonDescription?: string;
  nowIso?: string;
  stateOverride?: PointsStoreState;
}): {
  revoked: boolean;
  pointsDeducted: number;
  summary: UserPointsSummary;
  entry?: PointsLedgerEntry;
} {
  const state = params.stateOverride || getPointsState();
  const cleanUserId = (params.userId || "").trim();
  const origRef = (params.originalReferenceId || "").trim();
  const revokeRef = `REVOKE:${origRef}`;
  const nowIso = params.nowIso || new Date().toISOString();

  // Check if original award exists
  const originalAward = state.ledger.find(
    (e) => e.userId === cleanUserId && e.referenceId === origRef && e.points > 0
  );

  if (!originalAward) {
    return {
      revoked: false,
      pointsDeducted: 0,
      summary: getUserPointsSummary(cleanUserId, state),
    };
  }

  // Idempotency: check if already revoked
  const alreadyRevoked = state.ledger.find(
    (e) => e.userId === cleanUserId && e.referenceId === revokeRef
  );

  if (alreadyRevoked) {
    return {
      revoked: false,
      pointsDeducted: 0,
      summary: getUserPointsSummary(cleanUserId, state),
      entry: alreadyRevoked,
    };
  }

  const currentRecord = state.userPoints[cleanUserId] || {
    userId: cleanUserId,
    totalPoints: 0,
    level: "Starter",
    updatedAt: nowIso,
  };

  const newTotalPoints = Math.max(0, currentRecord.totalPoints - originalAward.points);
  const levelCalc = calculateLevelForPoints(newTotalPoints, state.levels);

  const revokeEntry: PointsLedgerEntry = {
    id: `ptx_rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: cleanUserId,
    points: -originalAward.points,
    reason: "revoked_submission",
    referenceId: revokeRef,
    description:
      params.reasonDescription ||
      `Points revoked for rejected/flagged submission (${origRef})`,
    createdAt: nowIso,
  };

  const updatedRecord: UserPointsRecord = {
    userId: cleanUserId,
    totalPoints: newTotalPoints,
    level: levelCalc.currentTier.name,
    updatedAt: nowIso,
  };

  const nextState: PointsStoreState = {
    ...state,
    userPoints: {
      ...state.userPoints,
      [cleanUserId]: updatedRecord,
    },
    ledger: [revokeEntry, ...state.ledger],
  };

  if (!params.stateOverride) {
    savePointsState(nextState);
  } else {
    Object.assign(params.stateOverride, nextState);
  }

  return {
    revoked: true,
    pointsDeducted: originalAward.points,
    summary: getUserPointsSummary(cleanUserId, nextState),
    entry: revokeEntry,
  };
}

/**
 * Checks a withdrawal request against the user's current tier limits (per-withdrawal and daily total).
 * Optionally records the withdrawal toward today's total when `commitWithdrawal` is true.
 */
export function verifyWithdrawalAgainstTierLimits(params: {
  userId: string;
  amountKes: number;
  commitWithdrawal?: boolean;
  nowIso?: string;
  stateOverride?: PointsStoreState;
}): WithdrawalLimitCheckResult {
  const state = params.stateOverride || getPointsState();
  const cleanUserId = (params.userId || "usr_guest").trim();
  const amountKes = Math.trunc(Number(params.amountKes) || 0);
  const nowIso = params.nowIso || new Date().toISOString();
  const dayPrefix = nowIso.slice(0, 10);

  const summary = getUserPointsSummary(cleanUserId, state);
  const { currentTier, nextTier } = summary;
  const sortedLevels = [...state.levels].sort((a, b) => a.minPoints - b.minPoints);

  const withdrawnTodayKes = state.dailyWithdrawals
    .filter((w) => w.userId === cleanUserId && w.createdAt.startsWith(dayPrefix))
    .reduce((sum, w) => sum + w.amountKes, 0);

  const remainingDailyLimitKes = Math.max(
    0,
    currentTier.dailyWithdrawalLimitKes - withdrawnTodayKes
  );

  if (amountKes < 100) {
    return {
      allowed: false,
      requestedAmountKes: amountKes,
      withdrawnTodayKes,
      remainingDailyLimitKes,
      currentTier,
      nextTier,
      recommendedTier: nextTier,
      reasonCode: "INVALID_AMOUNT",
      message: "Minimum withdrawal amount is KES 100.",
    };
  }

  // 1. Check per-transaction withdrawal limit for current tier
  if (amountKes > currentTier.maxPerWithdrawalKes) {
    const tierForTx =
      sortedLevels.find((lvl) => lvl.maxPerWithdrawalKes >= amountKes) ||
      sortedLevels[sortedLevels.length - 1];

    const upgradeHint =
      tierForTx && tierForTx.minPoints > summary.totalPoints
        ? `Reach ${tierForTx.name} (${tierForTx.minPoints.toLocaleString()} pts) to withdraw up to KES ${tierForTx.maxPerWithdrawalKes.toLocaleString()} per transaction (KES ${tierForTx.dailyWithdrawalLimitKes.toLocaleString()} per day).`
        : nextTier
        ? `Reach ${nextTier.name} (${nextTier.minPoints.toLocaleString()} pts) to withdraw up to KES ${nextTier.dailyWithdrawalLimitKes.toLocaleString()} per day.`
        : "You are at the maximum tier limit.";

    return {
      allowed: false,
      requestedAmountKes: amountKes,
      withdrawnTodayKes,
      remainingDailyLimitKes,
      currentTier,
      nextTier,
      recommendedTier: tierForTx,
      reasonCode: "EXCEEDS_PER_TX_LIMIT",
      message: `Your ${currentTier.name} tier allows up to KES ${currentTier.maxPerWithdrawalKes.toLocaleString()} per withdrawal. ${upgradeHint}`,
    };
  }

  // 2. Check daily total withdrawal limit for current tier
  if (withdrawnTodayKes + amountKes > currentTier.dailyWithdrawalLimitKes) {
    const neededDaily = withdrawnTodayKes + amountKes;
    const tierForDaily =
      sortedLevels.find((lvl) => lvl.dailyWithdrawalLimitKes >= neededDaily) ||
      sortedLevels[sortedLevels.length - 1];

    const upgradeHint =
      tierForDaily && tierForDaily.minPoints > summary.totalPoints
        ? `Reach ${tierForDaily.name} (${tierForDaily.minPoints.toLocaleString()} pts) to withdraw up to KES ${tierForDaily.dailyWithdrawalLimitKes.toLocaleString()} per day.`
        : nextTier
        ? `Reach ${nextTier.name} (${nextTier.minPoints.toLocaleString()} pts) to withdraw up to KES ${nextTier.dailyWithdrawalLimitKes.toLocaleString()} per day.`
        : "Please try again tomorrow when your daily limit resets.";

    return {
      allowed: false,
      requestedAmountKes: amountKes,
      withdrawnTodayKes,
      remainingDailyLimitKes,
      currentTier,
      nextTier,
      recommendedTier: tierForDaily,
      reasonCode: "EXCEEDS_DAILY_LIMIT",
      message: `Daily withdrawal limit reached for ${currentTier.name} tier (KES ${currentTier.dailyWithdrawalLimitKes.toLocaleString()}/day; KES ${remainingDailyLimitKes.toLocaleString()} remaining today). ${upgradeHint}`,
    };
  }

  if (params.commitWithdrawal) {
    const nextState: PointsStoreState = {
      ...state,
      dailyWithdrawals: [
        {
          id: `wd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: cleanUserId,
          amountKes,
          createdAt: nowIso,
        },
        ...state.dailyWithdrawals,
      ],
    };

    if (!params.stateOverride) {
      savePointsState(nextState);
    } else {
      Object.assign(params.stateOverride, nextState);
    }
  }

  return {
    allowed: true,
    requestedAmountKes: amountKes,
    withdrawnTodayKes: params.commitWithdrawal
      ? withdrawnTodayKes + amountKes
      : withdrawnTodayKes,
    remainingDailyLimitKes: params.commitWithdrawal
      ? Math.max(0, remainingDailyLimitKes - amountKes)
      : remainingDailyLimitKes,
    currentTier,
    nextTier,
    recommendedTier: nextTier,
  };
}
