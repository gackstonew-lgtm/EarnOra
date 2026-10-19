import { NextRequest, NextResponse } from "next/server";
import { isAdsEnabled } from "@/lib/ads/config";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { confirmTopUpPaymentCallback } from "@/lib/ads/store";
import { CardGatewayAdapter } from "@/lib/payments/paystack";

export async function POST(req: NextRequest) {
  if (!isAdsEnabled()) {
    return NextResponse.json({ error: "Disabled" }, { status: 403 });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`webhook_card_${clientIp}`, 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const rawBody = await req.text();
    const provider = req.headers.get("verif-hash") ? "flutterwave" : "paystack";
    const adapter = new CardGatewayAdapter(provider);

    const event = adapter.verifyWebhookSignature(rawBody, {
      "x-paystack-signature": req.headers.get("x-paystack-signature"),
      "verif-hash": req.headers.get("verif-hash"),
    });

    if (!event.verified) {
      return NextResponse.json(
        { error: event.error || "Invalid webhook signature" },
        { status: 401 }
      );
    }

    if (event.status !== "completed") {
      return NextResponse.json({
        received: true,
        credited: false,
        status: event.status,
      });
    }

    const result = confirmTopUpPaymentCallback({
      gatewayReference: event.gatewayReference,
      rawPayload: event.rawPayload,
    });

    return NextResponse.json({
      received: true,
      idempotent: result.idempotent,
      credited: !result.idempotent,
      walletBalanceKes: result.wallet.balanceKes,
      payment: result.payment,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Card webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
