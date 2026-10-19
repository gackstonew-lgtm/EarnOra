import { MpesaStkPushAdapter } from "./mpesa-stk";
import { CardGatewayAdapter } from "./paystack";
import { PaymentAdapterProvider, PaymentGatewayAdapter } from "./types";

export * from "./types";
export * from "./mpesa-stk";
export * from "./paystack";

export function getPaymentAdapter(provider: PaymentAdapterProvider): PaymentGatewayAdapter {
  switch (provider) {
    case "mpesa_stk":
      return new MpesaStkPushAdapter();
    case "paystack":
      return new CardGatewayAdapter("paystack");
    case "flutterwave":
      return new CardGatewayAdapter("flutterwave");
    default:
      throw new Error(`Unsupported payment gateway provider: ${provider}`);
  }
}
