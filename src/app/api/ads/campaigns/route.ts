import { NextRequest, NextResponse } from "next/server";
import { isAdsEnabled } from "@/lib/ads/config";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { createAndFundCampaign, getAdsState } from "@/lib/ads/store";
import { validateCampaignInput } from "@/lib/ads/validation";

export async function POST(req: NextRequest) {
  if (!isAdsEnabled()) {
    return NextResponse.json({ error: "Advertiser feature is disabled." }, { status: 403 });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`campaign_create_${clientIp}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rate.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const advertiserId = String(body.advertiserId || "");
    const state = getAdsState();

    // Server-side validation and cost recalculation
    const validation = validateCampaignInput(body, state.settings);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = createAndFundCampaign(advertiserId, body);
    return NextResponse.json({
      success: true,
      campaign: result.campaign,
      wallet: result.wallet,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Campaign creation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
