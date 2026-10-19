import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import { verifyWithdrawalAgainstTierLimits } from "@/lib/points/service";

export async function POST(req: NextRequest) {
  try {
    const cookieVal = req.cookies.get("earnora_user_ctx")?.value;
    const sessionUser = getServerSessionUserFromCookie(cookieVal);
    const body = (await req.json()) as {
      amountKes?: number;
      commit?: boolean;
      userId?: string;
    };

    const userId = sessionUser?.id || body.userId || "usr_demo_ke_01";
    const amountKes = Math.trunc(Number(body.amountKes) || 0);

    const checkResult = verifyWithdrawalAgainstTierLimits({
      userId,
      amountKes,
      commitWithdrawal: Boolean(body.commit),
    });

    if (!checkResult.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          error: checkResult.message,
          check: checkResult,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      check: checkResult,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Withdrawal limit check failed.";
    return NextResponse.json({ allowed: false, error: message }, { status: 400 });
  }
}
