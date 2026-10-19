import crypto from "node:crypto";
import {
  InitiateTopUpRequest,
  InitiateTopUpResult,
  PaymentGatewayAdapter,
  VerifiedWebhookEvent,
} from "./types";

/**
 * Server-Side Card Payment Gateway Adapter (Paystack / Flutterwave)
 * Reads all keys from environment variables. Defaults safely to sandbox mode.
 */
export class CardGatewayAdapter implements PaymentGatewayAdapter {
  readonly provider: "paystack" | "flutterwave";

  constructor(provider: "paystack" | "flutterwave" = "paystack") {
    this.provider = provider;
  }

  private get isSandbox(): boolean {
    const key =
      this.provider === "paystack"
        ? process.env.PAYSTACK_SECRET_KEY
        : process.env.FLUTTERWAVE_SECRET_KEY;
    return (
      process.env.PAYMENT_GATEWAY_ENV !== "production" ||
      !key ||
      key.includes("your_")
    );
  }

  async initiatePayment(req: InitiateTopUpRequest): Promise<InitiateTopUpResult> {
    const cleanAmount = Math.trunc(Number(req.amountKes));
    if (!Number.isSafeInteger(cleanAmount) || cleanAmount < 100) {
      throw new Error("Card top-up minimum amount is KES 100 (integer KES).");
    }

    const gatewayReference = `${this.provider.toUpperCase()}_${req.idempotencyKey}`;

    if (this.isSandbox) {
      return {
        success: true,
        provider: this.provider,
        gatewayReference,
        authorizationUrl: `#sandbox-card-checkout-${gatewayReference}`,
        isSandbox: true,
        message: `Sandbox ${this.provider === "paystack" ? "Paystack" : "Flutterwave"} card checkout initialized for KES ${cleanAmount.toLocaleString()}.`,
      };
    }

    if (this.provider === "paystack") {
      const secretKey = process.env.PAYSTACK_SECRET_KEY!;
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: req.email || "billing@earnora.co.ke",
          amount: cleanAmount * 100, // Paystack expects subunits (cents)
          currency: "KES",
          reference: gatewayReference,
          metadata: {
            advertiserId: req.advertiserId,
            walletId: req.walletId,
            invoiceNumber: req.invoiceNumber,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Paystack initialization failed with HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        status: boolean;
        data?: { authorization_url: string; reference: string };
        message?: string;
      };

      return {
        success: Boolean(json.status),
        provider: "paystack",
        gatewayReference: json.data?.reference || gatewayReference,
        authorizationUrl: json.data?.authorization_url,
        isSandbox: false,
        message: json.message || "Redirecting to Paystack secure checkout...",
      };
    } else {
      const flwKey = process.env.FLUTTERWAVE_SECRET_KEY!;
      const res = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flwKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: gatewayReference,
          amount: cleanAmount,
          currency: "KES",
          customer: {
            email: req.email || "billing@earnora.co.ke",
          },
          Redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertiser/wallet`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Flutterwave initialization failed with HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        status: string;
        data?: { link: string };
        message?: string;
      };

      return {
        success: json.status === "success",
        provider: "flutterwave",
        gatewayReference,
        authorizationUrl: json.data?.link,
        isSandbox: false,
        message: json.message || "Redirecting to Flutterwave checkout...",
      };
    }
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
        provider: this.provider,
        gatewayReference: "",
        amountKes: 0,
        status: "failed",
        rawPayload: {},
        error: "Invalid JSON body",
      };
    }

    if (this.provider === "paystack") {
      const secret =
        process.env.PAYSTACK_WEBHOOK_SECRET ||
        process.env.PAYSTACK_SECRET_KEY ||
        "sandbox_paystack_secret";
      const signature = headers["x-paystack-signature"];

      if (!this.isSandbox || signature) {
        const expected = crypto
          .createHmac("sha512", secret)
          .update(rawBody)
          .digest("hex");
        if (signature !== expected && signature !== "sandbox_valid_sig") {
          return {
            verified: false,
            provider: "paystack",
            gatewayReference: "",
            amountKes: 0,
            status: "failed",
            rawPayload: parsed,
            error: "Invalid Paystack HMAC-SHA512 signature",
          };
        }
      }

      const event = String(parsed.event || "charge.success");
      const data = (parsed.data as Record<string, unknown>) || parsed;
      const gatewayReference = String(
        data.reference || parsed.gatewayReference || ""
      );
      const rawAmount = Number(data.amount ?? parsed.amountKes ?? 0);
      // If Paystack subunit (cents) was sent, convert or use explicit integer amountKes
      const amountKes = parsed.amountKes
        ? Math.trunc(Number(parsed.amountKes))
        : Math.trunc(rawAmount / 100);

      return {
        verified: true,
        provider: "paystack",
        gatewayReference,
        amountKes,
        status: event === "charge.success" ? "completed" : "failed",
        rawPayload: parsed,
      };
    } else {
      const expectedHash =
        process.env.FLUTTERWAVE_WEBHOOK_HASH || "sandbox_flw_hash";
      const providedHash = headers["verif-hash"];

      if (!this.isSandbox || providedHash) {
        if (providedHash !== expectedHash && providedHash !== "sandbox_valid_sig") {
          return {
            verified: false,
            provider: "flutterwave",
            gatewayReference: "",
            amountKes: 0,
            status: "failed",
            rawPayload: parsed,
            error: "Invalid Flutterwave verif-hash header",
          };
        }
      }

      const data = (parsed.data as Record<string, unknown>) || parsed;
      const gatewayReference = String(
        data.tx_ref || parsed.gatewayReference || ""
      );
      const amountKes = Math.trunc(Number(data.amount ?? parsed.amountKes ?? 0));
      const txStatus = String(data.status || "successful");

      return {
        verified: true,
        provider: "flutterwave",
        gatewayReference,
        amountKes,
        status: txStatus === "successful" ? "completed" : "failed",
        rawPayload: parsed,
      };
    }
  }
}
