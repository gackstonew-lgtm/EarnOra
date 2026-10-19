import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { completeAdWatchServerSide } from "@/lib/ads/watch-service";

function resolveUserId(req: NextRequest, fallbackUserId?: string): string {
  const cookieVal = req.cookies.get("earnora_user_ctx")?.value;
  const sessionUser = getServerSessionUserFromCookie(cookieVal);
  if (sessionUser?.id) return sessionUser.id;
  return fallbackUserId || req.nextUrl.searchParams.get("userId") || "usr_demo_ke_01";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      adId?: string;
      startToken?: string;
      userId?: string;
      requireHeartbeats?: boolean;
    };

    const userId = resolveUserId(req, body.userId);
    const rate = checkRateLimit(`ads_complete:${userId}`, 12, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many completion requests. Please wait a moment." },
        { status: 429 },
      );
    }

    const res = completeAdWatchServerSide({
      userId,
      adId: String(body.adId || ""),
      startToken: String(body.startToken || ""),
      requireHeartbeats: body.requireHeartbeats !== false,
    });

    if (!res.completed) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to complete video ad.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
