export type PaymentAdapterProvider = "mpesa_stk" | "paystack" | "flutterwave";

export interface InitiateTopUpRequest {
  advertiserId: string;
  walletId: string;
  amountKes: number; // Whole integer KES
  phoneNumber?: string; // Required for M-Pesa STK Push
  email?: string; // Required for Card gateway
  invoiceNumber: string;
  idempotencyKey: string;
}

export interface InitiateTopUpResult {
  success: boolean;
  provider: PaymentAdapterProvider;
  gatewayReference: string;
  checkoutRequestId?: string;
  authorizationUrl?: string;
  isSandbox: boolean;
  message: string;
}

export interface VerifiedWebhookEvent {
  verified: boolean;
  provider: PaymentAdapterProvider;
  gatewayReference: string;
  amountKes: number;
  status: "completed" | "failed";
  rawPayload: Record<string, unknown>;
  error?: string;
}

export interface PaymentGatewayAdapter {
  readonly provider: PaymentAdapterProvider;
  initiatePayment(req: InitiateTopUpRequest): Promise<InitiateTopUpResult>;
  verifyWebhookSignature(
    rawBody: string,
    headers: Record<string, string | null>
  ): VerifiedWebhookEvent;
}
