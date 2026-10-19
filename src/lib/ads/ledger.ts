import {
  AdvertiserLedgerEntry,
  AdvertiserWallet,
  CampaignSubmission,
  PaymentRecord,
  SponsoredCampaign,
} from "./types";
import { calculateCampaignCost } from "./validation";

/**
 * Pure, atomic integer-KES wallet & escrow functions.
 * Used by both server API routes / store and unit tests to guarantee:
 * 1. Integer KES amounts only (never floats).
 * 2. Wallet balance can never go negative.
 * 3. Webhook callbacks are idempotent (never double-credit).
 * 4. Campaign escrow hold, user payout credit, and unused budget refunds are exact.
 */

export function assertPositiveIntegerKes(amount: number, label = "Amount"): void {
  if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error(`${label} must be a positive integer in KES (received: ${amount}).`);
  }
}

/**
 * 1. Idempotent Top-Up Credit
 */
export function creditWalletTopUpAtomic(params: {
  wallet: AdvertiserWallet;
  payment: PaymentRecord;
  ledger: AdvertiserLedgerEntry[];
  rawPayload?: Record<string, unknown>;
  nowIso?: string;
}): {
  idempotent: boolean;
  wallet: AdvertiserWallet;
  payment: PaymentRecord;
  ledger: AdvertiserLedgerEntry[];
  newEntry?: AdvertiserLedgerEntry;
} {
  const { wallet, payment, ledger, rawPayload, nowIso = new Date().toISOString() } = params;

  assertPositiveIntegerKes(payment.amountKes, "Top-up amount");

  if (payment.walletId !== wallet.id || payment.advertiserId !== wallet.advertiserId) {
    throw new Error("Payment wallet/advertiser mismatch.");
  }

  // Idempotency check: if payment already completed OR ledger already has this gatewayReference
  const existingTx = ledger.find(
    (entry) =>
      entry.txType === "top_up" && entry.referenceId === payment.gatewayReference
  );

  if (payment.status === "completed" || existingTx) {
    return {
      idempotent: true,
      wallet,
      payment: { ...payment, status: "completed" },
      ledger,
    };
  }

  if (payment.status !== "pending") {
    throw new Error(`Cannot credit payment in status "${payment.status}".`);
  }

  const balanceBeforeKes = wallet.balanceKes;
  const balanceAfterKes = balanceBeforeKes + payment.amountKes;

  const updatedWallet: AdvertiserWallet = {
    ...wallet,
    balanceKes: balanceAfterKes,
    totalFundedKes: wallet.totalFundedKes + payment.amountKes,
    updatedAt: nowIso,
  };

  const updatedPayment: PaymentRecord = {
    ...payment,
    status: "completed",
    rawCallbackPayload: rawPayload || payment.rawCallbackPayload,
    completedAt: nowIso,
  };

  const newEntry: AdvertiserLedgerEntry = {
    id: `ltx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    walletId: wallet.id,
    advertiserId: wallet.advertiserId,
    profileId: wallet.profileId,
    txType: "top_up",
    amountKes: payment.amountKes,
    direction: "credit",
    balanceBeforeKes,
    balanceAfterKes,
    referenceId: payment.gatewayReference,
    description: `Wallet top-up via ${payment.provider.toUpperCase()} (${payment.invoiceNumber})`,
    invoiceNumber: payment.invoiceNumber,
    createdAt: nowIso,
  };

  return {
    idempotent: false,
    wallet: updatedWallet,
    payment: updatedPayment,
    ledger: [newEntry, ...ledger],
    newEntry,
  };
}

/**
 * 2. Atomic Campaign Escrow Hold + Platform Fee Deduction
 */
export function holdCampaignBudgetAtomic(params: {
  wallet: AdvertiserWallet;
  rewardPerTaskKes: number;
  maxTasks: number;
  platformFeePercent: number;
  campaignId: string;
  campaignTitle: string;
  ledger: AdvertiserLedgerEntry[];
  nowIso?: string;
}): {
  wallet: AdvertiserWallet;
  ledger: AdvertiserLedgerEntry[];
  costBreakdown: ReturnType<typeof calculateCampaignCost>;
} {
  const {
    wallet,
    rewardPerTaskKes,
    maxTasks,
    platformFeePercent,
    campaignId,
    campaignTitle,
    ledger,
    nowIso = new Date().toISOString(),
  } = params;

  const costBreakdown = calculateCampaignCost(
    rewardPerTaskKes,
    maxTasks,
    platformFeePercent
  );

  if (wallet.balanceKes < costBreakdown.totalBudgetKes) {
    throw new Error(
      `Insufficient wallet balance. Required: KES ${costBreakdown.totalBudgetKes.toLocaleString()}, Available: KES ${wallet.balanceKes.toLocaleString()}.`
    );
  }

  const balanceBeforeHold = wallet.balanceKes;
  const balanceAfterHold = balanceBeforeHold - costBreakdown.rewardsSubtotalKes;
  const balanceAfterFee = balanceAfterHold - costBreakdown.platformFeeKes;

  if (balanceAfterFee < 0) {
    throw new Error("Wallet balance cannot become negative.");
  }

  const updatedWallet: AdvertiserWallet = {
    ...wallet,
    balanceKes: balanceAfterFee,
    heldKes: wallet.heldKes + costBreakdown.rewardsSubtotalKes,
    totalSpentKes: wallet.totalSpentKes + costBreakdown.platformFeeKes,
    updatedAt: nowIso,
  };

  const holdEntry: AdvertiserLedgerEntry = {
    id: `ltx_hold_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    walletId: wallet.id,
    advertiserId: wallet.advertiserId,
    profileId: wallet.profileId,
    txType: "campaign_hold",
    amountKes: costBreakdown.rewardsSubtotalKes,
    direction: "debit",
    balanceBeforeKes: balanceBeforeHold,
    balanceAfterKes: balanceAfterHold,
    referenceId: `HOLD-${campaignId}`,
    campaignId,
    description: `Escrow hold for "${campaignTitle}" (${maxTasks} tasks × KES ${rewardPerTaskKes})`,
    createdAt: nowIso,
  };

  const newEntries: AdvertiserLedgerEntry[] = [holdEntry];

  if (costBreakdown.platformFeeKes > 0) {
    const feeEntry: AdvertiserLedgerEntry = {
      id: `ltx_fee_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      walletId: wallet.id,
      advertiserId: wallet.advertiserId,
      profileId: wallet.profileId,
      txType: "fee",
      amountKes: costBreakdown.platformFeeKes,
      direction: "debit",
      balanceBeforeKes: balanceAfterHold,
      balanceAfterKes: balanceAfterFee,
      referenceId: `FEE-${campaignId}`,
      campaignId,
      description: `Earnora platform fee (${platformFeePercent}%) for "${campaignTitle}"`,
      createdAt: nowIso,
    };
    newEntries.unshift(feeEntry);
  }

  return {
    wallet: updatedWallet,
    ledger: [...newEntries, ...ledger],
    costBreakdown,
  };
}

/**
 * 3. Atomic Submission Approval & User Reward Credit
 * Releases rewardPerTaskKes from advertiser's heldKes escrow and credits user's available balance.
 * Platform fee stays with Earnora.
 */
export function approveSubmissionAndCreditUserAtomic(params: {
  wallet: AdvertiserWallet;
  campaign: SponsoredCampaign;
  submission: CampaignSubmission;
  userAvailableBalanceKes: number;
  userPendingBalanceKes: number;
  userTotalEarnedKes: number;
  reviewerId: string;
  reviewerNotes?: string;
  ledger: AdvertiserLedgerEntry[];
  nowIso?: string;
}): {
  wallet: AdvertiserWallet;
  campaign: SponsoredCampaign;
  submission: CampaignSubmission;
  userBalances: {
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
  };
  ledger: AdvertiserLedgerEntry[];
} {
  const {
    wallet,
    campaign,
    submission,
    userAvailableBalanceKes,
    userPendingBalanceKes,
    userTotalEarnedKes,
    reviewerId,
    reviewerNotes,
    ledger,
    nowIso = new Date().toISOString(),
  } = params;

  if (submission.status !== "pending") {
    throw new Error(`Submission ${submission.id} has already been ${submission.status}.`);
  }

  if (submission.campaignId !== campaign.id) {
    throw new Error("Submission does not belong to the specified campaign.");
  }

  const rewardKes = campaign.rewardPerTaskKes;
  assertPositiveIntegerKes(rewardKes, "Task reward");

  if (campaign.completedTasks >= campaign.maxTasks) {
    throw new Error("Campaign has already reached its maximum completed tasks.");
  }

  if (campaign.remainingBudgetKes < rewardKes) {
    throw new Error("Campaign has insufficient remaining escrow budget.");
  }

  if (wallet.heldKes < rewardKes) {
    throw new Error("Advertiser wallet escrow hold is insufficient.");
  }

  // Prevent duplicate payout for the same submission in ledger
  const payoutRef = `PAYOUT-${submission.id}`;
  if (ledger.some((e) => e.referenceId === payoutRef)) {
    throw new Error("Submission payout has already been processed.");
  }

  const updatedWallet: AdvertiserWallet = {
    ...wallet,
    heldKes: wallet.heldKes - rewardKes,
    totalSpentKes: wallet.totalSpentKes + rewardKes,
    updatedAt: nowIso,
  };

  const nextCompleted = campaign.completedTasks + 1;
  const nextRemaining = campaign.remainingBudgetKes - rewardKes;
  const nextStatus =
    nextCompleted >= campaign.maxTasks ? "completed" : campaign.status;

  const updatedCampaign: SponsoredCampaign = {
    ...campaign,
    completedTasks: nextCompleted,
    remainingBudgetKes: nextRemaining,
    status: nextStatus,
    updatedAt: nowIso,
  };

  const updatedSubmission: CampaignSubmission = {
    ...submission,
    status: "approved",
    reviewerNotes: reviewerNotes || submission.reviewerNotes,
    reviewedBy: reviewerId,
    reviewedAt: nowIso,
  };

  const updatedUserBalances = {
    availableBalance: userAvailableBalanceKes + rewardKes,
    pendingBalance: Math.max(0, userPendingBalanceKes - rewardKes),
    totalEarned: userTotalEarnedKes + rewardKes,
  };

  const payoutEntry: AdvertiserLedgerEntry = {
    id: `ltx_pay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    walletId: wallet.id,
    advertiserId: wallet.advertiserId,
    profileId: submission.userProfileId,
    txType: "user_payout",
    amountKes: rewardKes,
    direction: "debit",
    balanceBeforeKes: wallet.balanceKes,
    balanceAfterKes: wallet.balanceKes,
    referenceId: payoutRef,
    campaignId: campaign.id,
    description: `Escrow payout to @${submission.username} for "${campaign.title}"`,
    createdAt: nowIso,
  };

  return {
    wallet: updatedWallet,
    campaign: updatedCampaign,
    submission: updatedSubmission,
    userBalances: updatedUserBalances,
    ledger: [payoutEntry, ...ledger],
  };
}

/**
 * 4. Atomic Campaign End / Rejection & Unused Escrow Budget Refund
 */
export function refundCampaignUnusedBudgetAtomic(params: {
  wallet: AdvertiserWallet;
  campaign: SponsoredCampaign;
  targetStatus: "completed" | "rejected";
  reason?: string;
  ledger: AdvertiserLedgerEntry[];
  nowIso?: string;
}): {
  wallet: AdvertiserWallet;
  campaign: SponsoredCampaign;
  refundedKes: number;
  ledger: AdvertiserLedgerEntry[];
} {
  const {
    wallet,
    campaign,
    targetStatus,
    reason,
    ledger,
    nowIso = new Date().toISOString(),
  } = params;

  if (campaign.status === "rejected") {
    throw new Error("Campaign is already rejected and refunded.");
  }
  if (campaign.status === "completed" && campaign.remainingBudgetKes === 0) {
    throw new Error("Campaign is already completed with zero remaining budget.");
  }

  const refundRef = `REFUND-${campaign.id}`;
  if (ledger.some((e) => e.referenceId === refundRef)) {
    throw new Error("Unused budget for this campaign has already been refunded.");
  }

  const unusedEscrowKes = campaign.remainingBudgetKes;
  // If rejected by admin before any tasks were completed, refund platform fee as well
  const feeRefundKes =
    targetStatus === "rejected" && campaign.completedTasks === 0
      ? campaign.platformFeeKes
      : 0;

  const totalRefundKes = unusedEscrowKes + feeRefundKes;

  const balanceBeforeKes = wallet.balanceKes;
  const balanceAfterKes = balanceBeforeKes + totalRefundKes;

  const updatedWallet: AdvertiserWallet = {
    ...wallet,
    balanceKes: balanceAfterKes,
    heldKes: Math.max(0, wallet.heldKes - unusedEscrowKes),
    totalSpentKes: Math.max(0, wallet.totalSpentKes - feeRefundKes),
    updatedAt: nowIso,
  };

  const updatedCampaign: SponsoredCampaign = {
    ...campaign,
    status: targetStatus,
    remainingBudgetKes: 0,
    rejectionReason: reason || campaign.rejectionReason,
    updatedAt: nowIso,
  };

  const nextLedger = [...ledger];
  if (totalRefundKes > 0) {
    const refundEntry: AdvertiserLedgerEntry = {
      id: `ltx_ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      walletId: wallet.id,
      advertiserId: wallet.advertiserId,
      profileId: wallet.profileId,
      txType: "refund",
      amountKes: totalRefundKes,
      direction: "credit",
      balanceBeforeKes,
      balanceAfterKes,
      referenceId: refundRef,
      campaignId: campaign.id,
      description:
        targetStatus === "rejected"
          ? `Full escrow & fee refund for rejected campaign "${campaign.title}"`
          : `Unused escrow budget refund for completed campaign "${campaign.title}"`,
      createdAt: nowIso,
    };
    nextLedger.unshift(refundEntry);
  }

  return {
    wallet: updatedWallet,
    campaign: updatedCampaign,
    refundedKes: totalRefundKes,
    ledger: nextLedger,
  };
}
