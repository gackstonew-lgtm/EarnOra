import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { recordAdHeartbeatServerSide } from "@/lib/ads/watch-service";

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
      isPlaying?: boolean;
      isTabVisible?: boolean;
      isMuted?: boolean;
      currentTimeSeconds?: number;
    };

    const userId = resolveUserId(req, body.userId);
    const rate = checkRateLimit(`ads_heartbeat:${userId}`, 40, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded for video heartbeats." },
        { status: 429 },
      );
    }

    const isTabVisible = Boolean(body.isTabVisible);
    const isMuted = Boolean(body.isMuted);
    const res = recordAdHeartbeatServerSide({
      userId,
      adId: String(body.adId || ""),
      startToken: String(body.startToken || ""),
      isPlaying: Boolean(body.isPlaying),
      isTabVisible,
      isMutedAndHidden: isMuted && !isTabVisible,
    });

    if (!res.recorded) {
      return NextResponse.json(
        { error: res.error, watchedSeconds: res.watchedSeconds, remainingSeconds: res.remainingSeconds },
        { status: 400 },
      );
    }

    return NextResponse.json(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record video heartbeat.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
