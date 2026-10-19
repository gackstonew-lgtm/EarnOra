import { NextRequest, NextResponse } from "next/server";
import { isAdsEnabled } from "@/lib/ads/config";
import { checkRateLimit } from "@/lib/ads/rate-limit";
import { createPendingTopUpPayment } from "@/lib/ads/store";
import { getPaymentAdapter, PaymentAdapterProvider } from "@/lib/payments";

export async function POST(req: NextRequest) {
  if (!isAdsEnabled()) {
    return NextResponse.json({ error: "Advertiser feature is disabled." }, { status: 403 });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`pay_init_${clientIp}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rate.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const provider = String(body.provider || "mpesa_stk") as PaymentAdapterProvider;
    const advertiserId = String(body.advertiserId || "");
    const walletId = String(body.walletId || "");
    const amountKes = Math.trunc(Number(body.amountKes));
    const phoneOrEmail = String(body.phoneOrEmail || "");

    if (!advertiserId || !walletId) {
      return NextResponse.json(
        { error: "Advertiser ID and Wallet ID are required." },
        { status: 400 }
      );
    }

    if (!Number.isSafeInteger(amountKes) || amountKes < 100) {
      return NextResponse.json(
        { error: "Minimum top-up amount is KES 100 (whole integer KES)." },
        { status: 400 }
      );
    }

    const adapter = getPaymentAdapter(provider);
    const idempotencyKey = `${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const gatewayRes = await adapter.initiatePayment({
      advertiserId,
      walletId,
      amountKes,
      phoneNumber: provider === "mpesa_stk" ? phoneOrEmail : undefined,
      email: provider !== "mpesa_stk" ? phoneOrEmail : undefined,
      invoiceNumber,
      idempotencyKey,
    });

    const paymentRecord = createPendingTopUpPayment({
      advertiserId,
      walletId,
      provider,
      amountKes,
      phoneOrEmail,
      gatewayReference: gatewayRes.gatewayReference,
      checkoutRequestId: gatewayRes.checkoutRequestId,
    });

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
      gateway: gatewayRes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initiation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
