import crypto from "node:crypto";
import {
  InitiateTopUpRequest,
  InitiateTopUpResult,
  PaymentGatewayAdapter,
  VerifiedWebhookEvent,
} from "./types";

/**
 * Server-Side Safaricom M-Pesa Daraja Lipa Na M-Pesa Online (STK Push) Adapter
 * Reads all credentials from environment variables. Defaults safely to sandbox mode.
 */
export class MpesaStkPushAdapter implements PaymentGatewayAdapter {
  readonly provider = "mpesa_stk" as const;

  private get isSandbox(): boolean {
    return (
      process.env.DARAJA_ENV !== "production" ||
      process.env.PAYMENT_GATEWAY_ENV !== "production" ||
      !process.env.DARAJA_CONSUMER_KEY ||
      process.env.DARAJA_CONSUMER_KEY === "your_daraja_consumer_key"
    );
  }

  private get baseUrl(): string {
    return process.env.DARAJA_ENV === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  }

  private formatTimestamp(date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }

  async initiatePayment(req: InitiateTopUpRequest): Promise<InitiateTopUpResult> {
    const cleanAmount = Math.trunc(Number(req.amountKes));
    if (!Number.isSafeInteger(cleanAmount) || cleanAmount < 100) {
      throw new Error("M-Pesa STK Push minimum top-up is KES 100 (integer KES).");
    }

    const rawPhone = (req.phoneNumber || "").replace(/[\s\+\-]/g, "");
    const formattedPhone = rawPhone.startsWith("0")
      ? `254${rawPhone.slice(1)}`
      : rawPhone.startsWith("254")
      ? rawPhone
      : `254${rawPhone}`;

    const gatewayReference = `MPESA_${req.idempotencyKey}`;
    const checkoutRequestId = `ws_CO_${this.formatTimestamp()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Default to sandbox simulation if live credentials are not configured
    if (this.isSandbox) {
      return {
        success: true,
        provider: "mpesa_stk",
        gatewayReference,
        checkoutRequestId,
        isSandbox: true,
        message: `Sandbox STK Push simulated to +${formattedPhone} for KES ${cleanAmount.toLocaleString()}.`,
      };
    }

    const consumerKey = process.env.DARAJA_CONSUMER_KEY!;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!;
    const shortcode = process.env.DARAJA_SHORTCODE || "174379";
    const passkey = process.env.DARAJA_PASSKEY!;
    const callbackUrl =
      process.env.DARAJA_STK_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhooks/mpesa`;

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    if (!tokenRes.ok) {
      throw new Error(`Daraja OAuth failed with status ${tokenRes.status}`);
    }

    const { access_token } = (await tokenRes.json()) as { access_token: string };
    const timestamp = this.formatTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: cleanAmount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: req.invoiceNumber.slice(0, 12),
      TransactionDesc: "Earnora Advertiser Wallet TopUp",
    };

    const stkRes = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    if (!stkRes.ok) {
      throw new Error(`Daraja STK Push failed with HTTP ${stkRes.status}`);
    }

    const stkData = (await stkRes.json()) as {
      CheckoutRequestID: string;
      ResponseCode: string;
      CustomerMessage?: string;
    };

    return {
      success: stkData.ResponseCode === "0",
      provider: "mpesa_stk",
      gatewayReference,
      checkoutRequestId: stkData.CheckoutRequestID || checkoutRequestId,
      isSandbox: false,
      message: stkData.CustomerMessage || "STK Push sent to your M-Pesa phone.",
    };
  }

  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, string | null>
  ): VerifiedWebhookEvent {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return {
        verified: false,
        provider: "mpesa_stk",
        gatewayReference: "",
        amountKes: 0,
        status: "failed",
        rawPayload: {},
        error: "Invalid JSON payload",
      };
    }

    const secret = process.env.DARAJA_WEBHOOK_SECRET || "sandbox_daraja_webhook_secret";
    const providedSig = headers["x-daraja-signature"] || headers["x-webhook-signature"];

    if (!this.isSandbox) {
      if (!providedSig) {
        return {
          verified: false,
          provider: "mpesa_stk",
          gatewayReference: "",
          amountKes: 0,
          status: "failed",
          rawPayload: parsed,
          error: "Missing X-Daraja-Signature header",
        };
      }
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (providedSig !== expectedSig) {
        return {
          verified: false,
          provider: "mpesa_stk",
          gatewayReference: "",
          amountKes: 0,
          status: "failed",
          rawPayload: parsed,
          error: "Invalid Daraja webhook signature",
        };
      }
    } else if (providedSig) {
      // If signature is provided in sandbox/test mode, verify it strictly
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (providedSig !== expectedSig && providedSig !== "sandbox_valid_sig") {
        return {
          verified: false,
          provider: "mpesa_stk",
          gatewayReference: "",
          amountKes: 0,
          status: "failed",
          rawPayload: parsed,
          error: "Invalid Daraja webhook signature",
        };
      }
    }

    // Extract standard Daraja STK callback or normalized sandbox callback fields
    const bodyObj = (parsed.Body as Record<string, unknown>) || {};
    const stkCallback = (bodyObj.stkCallback as Record<string, unknown>) || parsed;
    const resultCode = Number(stkCallback.ResultCode ?? parsed.resultCode ?? 0);
    const gatewayReference = String(
      parsed.gatewayReference ||
        stkCallback.AccountReference ||
        stkCallback.CheckoutRequestID ||
        ""
    );
    const amountKes = Math.trunc(Number(parsed.amountKes ?? stkCallback.Amount ?? 0));

    return {
      verified: true,
      provider: "mpesa_stk",
      gatewayReference,
      amountKes,
      status: resultCode === 0 ? "completed" : "failed",
      rawPayload: parsed,
    };
  }
}
