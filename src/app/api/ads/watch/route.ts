import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUserFromCookie } from "@/lib/auth-service";
import {
  completeAdWatchServerSide,
  createVideoAdServerSide,
  deleteVideoAdServerSide,
  getAllVideoAdsForAdmin,
  getAvailableSponsoredAds,
  recordAdHeartbeatServerSide,
  startAdWatchServerSide,
  updateVideoAdStatusServerSide,
  VideoSourceType,
} from "@/lib/ads/watch-service";

function resolveUserId(req: NextRequest, fallbackUserId?: string): string {
  const cookieVal = req.cookies.get("earnora_user_ctx")?.value;
  const sessionUser = getServerSessionUserFromCookie(cookieVal);
  if (sessionUser?.id) return sessionUser.id;
  return fallbackUserId || req.nextUrl.searchParams.get("userId") || "usr_demo_ke_01";
}

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");
  if (scope === "admin") {
    return NextResponse.json({ ads: getAllVideoAdsForAdmin() });
  }
  const userId = resolveUserId(req);
  const data = getAvailableSponsoredAds(userId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      action?:
        | "start"
        | "heartbeat"
        | "complete"
        | "create_ad"
        | "update_status"
        | "delete_ad";
      adId?: string;
      startToken?: string;
      userId?: string;
      isPlaying?: boolean;
      isTabVisible?: boolean;
      isMuted?: boolean;
      currentTimeSeconds?: number;
      requireHeartbeats?: boolean;
      title?: string;
      advertiserName?: string;
      description?: string;
      category?: string;
      videoUrl?: string;
      videoType?: VideoSourceType;
      thumbnailUrl?: string;
      durationSeconds?: number;
      minWatchSeconds?: number;
      rewardKes?: number;
      rewardPoints?: number;
      ctaLabel?: string;
      ctaUrl?: string;
      ownsVideoRights?: boolean;
      autoApprove?: boolean;
      status?: "active" | "rejected" | "paused";
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

    if (body.action === "heartbeat") {
      const isTabVisible = Boolean(body.isTabVisible);
      const isMuted = Boolean(body.isMuted);
      const res = recordAdHeartbeatServerSide({
        userId,
        adId,
        startToken: String(body.startToken || ""),
        isPlaying: Boolean(body.isPlaying),
        isTabVisible,
        isMutedAndHidden: isMuted && !isTabVisible,
      });
      if (!res.recorded) {
        return NextResponse.json({ error: res.error, ...res }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (body.action === "complete") {
      const res = completeAdWatchServerSide({
        userId,
        adId,
        startToken: String(body.startToken || ""),
        requireHeartbeats: Boolean(body.requireHeartbeats),
      });
      if (!res.completed) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (body.action === "create_ad") {
      const created = createVideoAdServerSide({
        businessName: String(body.advertiserName || "Verified Advertiser"),
        title: String(body.title || ""),
        headline: String(body.title || ""),
        description: String(body.description || ""),
        videoUrl: String(body.videoUrl || ""),
        videoType: body.videoType === "embedded" ? "embedded" : "hosted",
        thumbnailUrl: body.thumbnailUrl,
        advertiserUrl: body.ctaUrl,
        durationSeconds: Number(body.durationSeconds || 15),
        minWatchSeconds: Number(body.minWatchSeconds || body.durationSeconds || 12),
        rewardKes: Number(body.rewardKes || 10),
        pointsReward: Number(body.rewardPoints || 2),
        rightsAttested: Boolean(body.ownsVideoRights),
        isAdmin: Boolean(body.autoApprove),
      });
      if (!created.created) {
        return NextResponse.json({ error: created.error }, { status: 400 });
      }
      return NextResponse.json({ ad: created.ad });
    }

    if (body.action === "update_status") {
      if (!body.status) {
        return NextResponse.json({ error: "Missing status." }, { status: 400 });
      }
      const updated = updateVideoAdStatusServerSide({
        adId,
        status: body.status,
      });
      return NextResponse.json({ ad: updated.ad });
    }

    if (body.action === "delete_ad") {
      const res = deleteVideoAdServerSide({ adId });
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'start', 'heartbeat', 'complete', 'create_ad', 'update_status', or 'delete_ad'." },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to process ad watch request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
