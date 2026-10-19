import { NextRequest, NextResponse } from "next/server";
import { isAdsEnabled } from "@/lib/ads/config";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { submitSponsoredTaskProof } from "@/lib/ads/store";
import { validateProofFile } from "@/lib/ads/validation";

export async function POST(req: NextRequest) {
  if (!isAdsEnabled()) {
    return NextResponse.json({ error: "Sponsored campaigns are disabled." }, { status: 403 });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`sub_create_${clientIp}`, 12, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rate.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;

    if (body.proofFile && typeof body.proofFile === "object") {
      const pf = body.proofFile as { name: string; type: string; size: number };
      const check = validateProofFile(pf);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
    }

    const submission = submitSponsoredTaskProof({
      campaignId: String(body.campaignId || ""),
      userProfileId: String(body.userProfileId || ""),
      username: String(body.username || ""),
      userPhone: String(body.userPhone || ""),
      rating: Number(body.rating || 5),
      headline: String(body.headline || ""),
      reviewText: String(body.reviewText || ""),
      pros: String(body.pros || ""),
      cons: String(body.cons || ""),
      proofFile: body.proofFile as
        | { name: string; type: string; size: number; dataUrlOrContent?: string }
        | undefined,
    });

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submission failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
