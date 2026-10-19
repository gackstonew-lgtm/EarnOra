import { NextRequest, NextResponse } from "next/server";
import { isAdsEnabled } from "@/lib/ads/config";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { confirmTopUpPaymentCallback } from "@/lib/ads/store";
import { MpesaStkPushAdapter } from "@/lib/payments/mpesa-stk";

export async function POST(req: NextRequest) {
  if (!isAdsEnabled()) {
    return NextResponse.json({ error: "Disabled" }, { status: 403 });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`webhook_mpesa_${clientIp}`, 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const rawBody = await req.text();
    const adapter = new MpesaStkPushAdapter();
    const event = adapter.verifyWebhookSignature(rawBody, {
      "x-daraja-signature": req.headers.get("x-daraja-signature"),
      "x-webhook-signature": req.headers.get("x-webhook-signature"),
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
    const message = err instanceof Error ? err.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
