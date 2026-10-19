import { EarningCategoryId } from "@/lib/types";

export type AdvertiserStatus = "pending" | "verified" | "suspended";

export type BusinessType =
  | "restaurant_hospitality"
  | "app_software"
  | "market_research"
  | "telco_fintech"
  | "consumer_product"
  | "local_service";

export interface AdvertiserProfile {
  id: string;
  profileId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: BusinessType;
  website?: string;
  status: AdvertiserStatus;
  statusReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertiserWallet {
  id: string;
  advertiserId: string;
  profileId: string;
  balanceKes: number; // Integer KES
  heldKes: number; // Integer KES held in campaign escrow
  totalFundedKes: number; // Integer KES
  totalSpentKes: number; // Integer KES
  updatedAt: string;
}

export type LedgerTxType =
  | "top_up"
  | "campaign_hold"
  | "user_payout"
  | "refund"
  | "fee";

export interface AdvertiserLedgerEntry {
  id: string;
  walletId: string;
  advertiserId: string;
  profileId?: string;
  txType: LedgerTxType;
  amountKes: number; // Integer KES
  direction: "credit" | "debit";
  balanceBeforeKes: number; // Integer KES
  balanceAfterKes: number; // Integer KES
  referenceId: string;
  campaignId?: string;
  description: string;
  invoiceNumber?: string;
  createdAt: string;
}

export type CampaignType =
  | "restaurant_review"
  | "app_testing"
  | "survey"
  | "telco"
  | "product";

export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "paused"
  | "completed"
  | "rejected";

export interface CampaignProofRequirements {
  requireText: boolean;
  minWords: number;
  requireScreenshot: boolean;
  requireReceipt: boolean;
  guidelines: string[];
}

export interface CampaignTargetOptions {
  country?: string;
  city?: string;
  deviceType?: "all" | "android" | "ios" | "desktop";
  verifiedPhoneOnly?: boolean;
}

export interface SponsoredCampaign {
  id: string;
  advertiserId: string;
  ownerProfileId: string;
  businessName: string;
  title: string;
  campaignType: CampaignType;
  categoryId: EarningCategoryId;
  description: string;
  instructions: string;
  proofRequirements: CampaignProofRequirements;
  rewardPerTaskKes: number; // Integer KES
  platformFeeKes: number; // Integer KES
  rewardsSubtotalKes: number; // Integer KES (rewardPerTaskKes * maxTasks)
  totalBudgetKes: number; // Integer KES (rewardsSubtotalKes + platformFeeKes)
  remainingBudgetKes: number; // Integer KES remaining in escrow
  maxTasks: number;
  completedTasks: number;
  status: CampaignStatus;
  rejectionReason?: string;
  startDate: string;
  endDate?: string;
  targetOptions: CampaignTargetOptions;
  createdAt: string;
  updatedAt: string;
}

export type CampaignSubmissionStatus = "pending" | "approved" | "rejected";

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  advertiserId: string;
  businessName: string;
  userProfileId: string;
  username: string;
  userPhone: string;
  rating: number;
  headline: string;
  reviewText: string;
  pros: string;
  cons: string;
  proofUrl?: string;
  proofFileName?: string;
  proofMimeType?: string;
  proofSizeBytes?: number;
  proofHash?: string; // SHA-256 hex digest for duplicate-proof detection
  rewardKes: number; // Integer KES
  status: CampaignSubmissionStatus;
  isFlagged: boolean;
  flagReason?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type PaymentGatewayProvider = "mpesa_stk" | "paystack" | "flutterwave";
export type PaymentRecordStatus = "pending" | "completed" | "failed" | "cancelled";

export interface PaymentRecord {
  id: string;
  advertiserId: string;
  walletId: string;
  provider: PaymentGatewayProvider;
  gatewayReference: string;
  checkoutRequestId?: string;
  amountKes: number; // Integer KES
  status: PaymentRecordStatus;
  invoiceNumber: string;
  phoneOrEmail: string;
  rawCallbackPayload?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: "user" | "advertiser" | "admin";
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface PlatformSettings {
  platformFeePercent: number;
  dailyUserSubmissionLimit: number;
  minRewardPerTaskKes: number;
  minCampaignTasks: number;
  updatedAt: string;
}
