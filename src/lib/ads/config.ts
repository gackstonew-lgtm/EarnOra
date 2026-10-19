/**
 * Feature flag & platform configuration for Earnora Advertiser Portal & Campaign Wallet.
 */

export function isAdsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";
}

export function isPaymentSandbox(): boolean {
  return (
    process.env.PAYMENT_GATEWAY_ENV !== "production" &&
    process.env.DARAJA_ENV !== "production"
  );
}

export const DEFAULT_PLATFORM_SETTINGS = {
  platformFeePercent: 15, // 15% integer fee
  dailyUserSubmissionLimit: 5,
  minRewardPerTaskKes: 50,
  minCampaignTasks: 5,
  maxProofFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  allowedProofMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};
