import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import { POINT_AWARD_VALUES, TIER_LEVELS_CONFIG } from "@/lib/points/config";
import {
  awardPointsServerSide,
  getUserPointsSummary,
  verifyWithdrawalAgainstTierLimits,
} from "@/lib/points/service";
import { PointAwardReason } from "@/lib/points/types";

function resolveUserIdFromRequest(req: NextRequest): {
  userId: string;
  streakDays: number;
} {
  const cookieVal = req.cookies.get("earnora_user_ctx")?.value;
  const sessionUser = getServerSessionUserFromCookie(cookieVal);
  if (sessionUser?.id) {
    return {
      userId: sessionUser.id,
      streakDays: sessionUser.streakDays || 1,
    };
  }
  const queryUserId = req.nextUrl.searchParams.get("userId");
  return {
    userId: queryUserId || "usr_demo_ke_01",
    streakDays: 1,
  };
}

export async function GET(req: NextRequest) {
  const { userId } = resolveUserIdFromRequest(req);
  const summary = getUserPointsSummary(userId);
  const limitStatus = verifyWithdrawalAgainstTierLimits({
    userId,
    amountKes: 100,
    commitWithdrawal: false,
  });

  return NextResponse.json({
    summary,
    limits: {
      dailyWithdrawalLimitKes: summary.currentTier.dailyWithdrawalLimitKes,
      maxPerWithdrawalKes: summary.currentTier.maxPerWithdrawalKes,
      withdrawnTodayKes: limitStatus.withdrawnTodayKes,
      remainingDailyLimitKes: limitStatus.remainingDailyLimitKes,
      nextTierDailyLimitKes: summary.nextTier?.dailyWithdrawalLimitKes ?? null,
      nextTierMaxPerWithdrawalKes: summary.nextTier?.maxPerWithdrawalKes ?? null,
    },
    levels: TIER_LEVELS_CONFIG,
    pointValues: POINT_AWARD_VALUES,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, streakDays } = resolveUserIdFromRequest(req);
    const body = (await req.json()) as {
      action?: "daily_login" | "claim_streak";
    };

    const todayKey = new Date().toISOString().slice(0, 10);

    if (body.action === "daily_login") {
      const loginAward = awardPointsServerSide({
        userId,
        reason: "daily_login",
        referenceId: `DAILY_LOGIN:${userId}:${todayKey}`,
        customDescription: `Daily Login Check-In (${todayKey})`,
      });

      // Also check streak milestones (3, 7, 30 days) on the server
      const bonusAwards: Array<{ reason: PointAwardReason; points: number }> = [];
      if (streakDays >= 3) {
        const res3 = awardPointsServerSide({
          userId,
          reason: "streak_3d",
          referenceId: `STREAK_3D:${userId}:${todayKey.slice(0, 7)}`,
        });
        if (res3.awarded) bonusAwards.push({ reason: "streak_3d", points: res3.pointsAdded });
      }
      if (streakDays >= 7) {
        const res7 = awardPointsServerSide({
          userId,
          reason: "streak_7d",
          referenceId: `STREAK_7D:${userId}:${todayKey.slice(0, 7)}`,
        });
        if (res7.awarded) bonusAwards.push({ reason: "streak_7d", points: res7.pointsAdded });
      }
      if (streakDays >= 30) {
        const res30 = awardPointsServerSide({
          userId,
          reason: "streak_30d",
          referenceId: `STREAK_30D:${userId}:${todayKey.slice(0, 7)}`,
        });
        if (res30.awarded) bonusAwards.push({ reason: "streak_30d", points: res30.pointsAdded });
      }

      return NextResponse.json({
        success: true,
        awarded: loginAward.awarded,
        idempotent: loginAward.idempotent,
        pointsAdded:
          loginAward.pointsAdded +
          bonusAwards.reduce((acc, b) => acc + b.points, 0),
        bonusAwards,
        summary: getUserPointsSummary(userId),
      });
    }

    return NextResponse.json(
      { error: "Unsupported point action. Points are awarded automatically by server events." },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process points request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
