import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import {
  completeAdWatchServerSide,
  getAvailableSponsoredAds,
  startAdWatchServerSide,
} from "@/lib/ads/watch-service";

function resolveUserId(req: NextRequest, fallbackUserId?: string): string {
  const cookieVal = req.cookies.get("earnora_user_ctx")?.value;
  const sessionUser = getServerSessionUserFromCookie(cookieVal);
  if (sessionUser?.id) return sessionUser.id;
  return fallbackUserId || req.nextUrl.searchParams.get("userId") || "usr_demo_ke_01";
}

export async function GET(req: NextRequest) {
  const userId = resolveUserId(req);
  const data = getAvailableSponsoredAds(userId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      action?: "start" | "complete";
      adId?: string;
      startToken?: string;
      userId?: string;
    };

    const userId = resolveUserId(req, body.userId);
    const adId = String(body.adId || "");

    if (body.action === "start") {
      const res = startAdWatchServerSide({ userId, adId });
      if (!res.started) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (body.action === "complete") {
      const res = completeAdWatchServerSide({
        userId,
        adId,
        startToken: String(body.startToken || ""),
      });
      if (!res.completed) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action. Use 'start' or 'complete'." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process ad watch request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
