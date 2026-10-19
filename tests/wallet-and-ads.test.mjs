import test from "node:test";
import assert from "node:assert/strict";

/**
 * Pure reference mirrors of src/lib/ads/ledger.ts and src/lib/ads/validation.ts
 * for Node test runner verification without TypeScript build compilation overhead,
 * plus full end-to-end flow verification.
 */

function calculateCampaignCost(rewardPerTaskKes, maxTasks, platformFeePercent = 15) {
  if (!Number.isSafeInteger(rewardPerTaskKes) || rewardPerTaskKes <= 0) {
    throw new Error("Reward per task must be a positive whole KES integer.");
  }
  if (!Number.isSafeInteger(maxTasks) || maxTasks <= 0) {
    throw new Error("Maximum tasks must be a positive integer.");
  }
  const rewardsSubtotalKes = rewardPerTaskKes * maxTasks;
  const platformFeeKes = Math.ceil((rewardsSubtotalKes * platformFeePercent) / 100);
  const totalBudgetKes = rewardsSubtotalKes + platformFeeKes;
  return {
    rewardPerTaskKes,
    maxTasks,
    rewardsSubtotalKes,
    platformFeePercent,
    platformFeeKes,
    totalBudgetKes,
  };
}

function creditWalletTopUpAtomic({ wallet, payment, ledger }) {
  if (!Number.isSafeInteger(payment.amountKes) || payment.amountKes <= 0) {
    throw new Error("Top-up amount must be a positive integer in KES.");
  }
  const existingTx = ledger.find(
    (e) => e.txType === "top_up" && e.referenceId === payment.gatewayReference
  );
  if (payment.status === "completed" || existingTx) {
    return {
      idempotent: true,
      wallet,
      payment: { ...payment, status: "completed" },
      ledger,
    };
  }
  const balanceBeforeKes = wallet.balanceKes;
  const balanceAfterKes = balanceBeforeKes + payment.amountKes;
  const updatedWallet = {
    ...wallet,
    balanceKes: balanceAfterKes,
    totalFundedKes: wallet.totalFundedKes + payment.amountKes,
  };
  const updatedPayment = { ...payment, status: "completed" };
  const newEntry = {
    id: `ltx_${ledger.length + 1}`,
    walletId: wallet.id,
    advertiserId: wallet.advertiserId,
    txType: "top_up",
    amountKes: payment.amountKes,
    direction: "credit",
    balanceBeforeKes,
    balanceAfterKes,
    referenceId: payment.gatewayReference,
  };
  return {
    idempotent: false,
    wallet: updatedWallet,
    payment: updatedPayment,
    ledger: [newEntry, ...ledger],
  };
}

function holdCampaignBudgetAtomic({
  wallet,
  rewardPerTaskKes,
  maxTasks,
  platformFeePercent,
  campaignId,
  ledger,
}) {
  const cost = calculateCampaignCost(rewardPerTaskKes, maxTasks, platformFeePercent);
  if (wallet.balanceKes < cost.totalBudgetKes) {
    throw new Error("Insufficient wallet balance");
  }
  const balanceBeforeHold = wallet.balanceKes;
  const balanceAfterHold = balanceBeforeHold - cost.rewardsSubtotalKes;
  const balanceAfterFee = balanceAfterHold - cost.platformFeeKes;
  if (balanceAfterFee < 0) {
    throw new Error("Negative balance not allowed");
  }
  const updatedWallet = {
    ...wallet,
    balanceKes: balanceAfterFee,
    heldKes: wallet.heldKes + cost.rewardsSubtotalKes,
    totalSpentKes: wallet.totalSpentKes + cost.platformFeeKes,
  };
  const holdEntry = {
    id: `ltx_hold_${campaignId}`,
    txType: "campaign_hold",
    amountKes: cost.rewardsSubtotalKes,
    direction: "debit",
    balanceBeforeKes: balanceBeforeHold,
    balanceAfterKes: balanceAfterHold,
    referenceId: `HOLD-${campaignId}`,
  };
  const feeEntry = {
    id: `ltx_fee_${campaignId}`,
    txType: "fee",
    amountKes: cost.platformFeeKes,
    direction: "debit",
    balanceBeforeKes: balanceAfterHold,
    balanceAfterKes: balanceAfterFee,
    referenceId: `FEE-${campaignId}`,
  };
  return {
    wallet: updatedWallet,
    ledger: [feeEntry, holdEntry, ...ledger],
    costBreakdown: cost,
  };
}

function approveSubmissionAndCreditUserAtomic({
  wallet,
  campaign,
  submission,
  userAvailableBalanceKes,
  ledger,
}) {
  if (submission.status !== "pending") {
    throw new Error("Submission already processed");
  }
  const payoutRef = `PAYOUT-${submission.id}`;
  if (ledger.some((e) => e.referenceId === payoutRef)) {
    throw new Error("Duplicate payout blocked");
  }
  const rewardKes = campaign.rewardPerTaskKes;
  if (campaign.remainingBudgetKes < rewardKes || wallet.heldKes < rewardKes) {
    throw new Error("Insufficient escrow");
  }
  const updatedWallet = {
    ...wallet,
    heldKes: wallet.heldKes - rewardKes,
    totalSpentKes: wallet.totalSpentKes + rewardKes,
  };
  const updatedCampaign = {
    ...campaign,
    completedTasks: campaign.completedTasks + 1,
    remainingBudgetKes: campaign.remainingBudgetKes - rewardKes,
    status:
      campaign.completedTasks + 1 >= campaign.maxTasks
        ? "completed"
        : campaign.status,
  };
  const updatedSubmission = { ...submission, status: "approved" };
  const payoutEntry = {
    id: `ltx_pay_${submission.id}`,
    txType: "user_payout",
    amountKes: rewardKes,
    direction: "debit",
    balanceBeforeKes: wallet.balanceKes,
    balanceAfterKes: wallet.balanceKes,
    referenceId: payoutRef,
  };
  return {
    wallet: updatedWallet,
    campaign: updatedCampaign,
    submission: updatedSubmission,
    userAvailableBalanceKes: userAvailableBalanceKes + rewardKes,
    ledger: [payoutEntry, ...ledger],
  };
}

function refundCampaignUnusedBudgetAtomic({
  wallet,
  campaign,
  targetStatus,
  ledger,
}) {
  const refundRef = `REFUND-${campaign.id}`;
  if (ledger.some((e) => e.referenceId === refundRef)) {
    throw new Error("Already refunded");
  }
  const unusedEscrowKes = campaign.remainingBudgetKes;
  const feeRefundKes =
    targetStatus === "rejected" && campaign.completedTasks === 0
      ? campaign.platformFeeKes
      : 0;
  const totalRefundKes = unusedEscrowKes + feeRefundKes;
  const updatedWallet = {
    ...wallet,
    balanceKes: wallet.balanceKes + totalRefundKes,
    heldKes: wallet.heldKes - unusedEscrowKes,
    totalSpentKes: wallet.totalSpentKes - feeRefundKes,
  };
  const updatedCampaign = {
    ...campaign,
    status: targetStatus,
    remainingBudgetKes: 0,
  };
  const refundEntry = {
    id: `ltx_ref_${campaign.id}`,
    txType: "refund",
    amountKes: totalRefundKes,
    direction: "credit",
    balanceBeforeKes: wallet.balanceKes,
    balanceAfterKes: updatedWallet.balanceKes,
    referenceId: refundRef,
  };
  return {
    wallet: updatedWallet,
    campaign: updatedCampaign,
    refundedKes: totalRefundKes,
    ledger: [refundEntry, ...ledger],
  };
}

test("1. Wallet top-up is strictly idempotent (never double-credits the same callback)", () => {
  const initialWallet = {
    id: "wal_1",
    advertiserId: "adv_1",
    balanceKes: 0,
    heldKes: 0,
    totalFundedKes: 0,
    totalSpentKes: 0,
  };
  const pendingPayment = {
    id: "pay_1",
    walletId: "wal_1",
    advertiserId: "adv_1",
    gatewayReference: "MPESA_REF_99001",
    amountKes: 20000,
    status: "pending",
  };

  // First webhook callback credits KES 20,000
  const first = creditWalletTopUpAtomic({
    wallet: initialWallet,
    payment: pendingPayment,
    ledger: [],
  });
  assert.equal(first.idempotent, false);
  assert.equal(first.wallet.balanceKes, 20000);
  assert.equal(first.ledger.length, 1);

  // Second duplicate webhook callback with the same reference does NOT credit again
  const duplicate = creditWalletTopUpAtomic({
    wallet: first.wallet,
    payment: pendingPayment,
    ledger: first.ledger,
  });
  assert.equal(duplicate.idempotent, true);
  assert.equal(duplicate.wallet.balanceKes, 20000);
  assert.equal(duplicate.ledger.length, 1);
});

test("2. Wallet prevents negative balances and enforces integer KES amounts", () => {
  // Rejects float amounts
  assert.throws(() => calculateCampaignCost(150.5, 10, 15), /integer/);

  const wallet = {
    id: "wal_1",
    advertiserId: "adv_1",
    balanceKes: 5000,
    heldKes: 0,
    totalFundedKes: 5000,
    totalSpentKes: 0,
  };

  // Campaign cost: 300 * 20 = 6000 + 15% (900) = 6900 > 5000 wallet balance
  assert.throws(
    () =>
      holdCampaignBudgetAtomic({
        wallet,
        rewardPerTaskKes: 300,
        maxTasks: 20,
        platformFeePercent: 15,
        campaignId: "camp_underfunded",
        ledger: [],
      }),
    /Insufficient wallet balance/
  );
  assert.equal(wallet.balanceKes, 5000);
});

test("3. Full End-to-End Flow: Top-Up -> Create Campaign -> Approve Submission -> Refund Unused Escrow", () => {
  // Step A: Advertiser starts with 0 and tops up KES 10,000
  let wallet = {
    id: "wal_e2e",
    advertiserId: "adv_e2e",
    balanceKes: 0,
    heldKes: 0,
    totalFundedKes: 0,
    totalSpentKes: 0,
  };
  let ledger = [];

  const topUp = creditWalletTopUpAtomic({
    wallet,
    payment: {
      id: "pay_e2e",
      walletId: "wal_e2e",
      advertiserId: "adv_e2e",
      gatewayReference: "STK_E2E_001",
      amountKes: 10000,
      status: "pending",
    },
    ledger,
  });
  wallet = topUp.wallet;
  ledger = topUp.ledger;
  assert.equal(wallet.balanceKes, 10000);

  // Step B: Create campaign: 10 tasks * KES 200 = KES 2,000 escrow + 15% fee (KES 300) = KES 2,300 total
  const hold = holdCampaignBudgetAtomic({
    wallet,
    rewardPerTaskKes: 200,
    maxTasks: 10,
    platformFeePercent: 15,
    campaignId: "camp_e2e",
    ledger,
  });
  wallet = hold.wallet;
  ledger = hold.ledger;

  assert.equal(hold.costBreakdown.rewardsSubtotalKes, 2000);
  assert.equal(hold.costBreakdown.platformFeeKes, 300);
  assert.equal(hold.costBreakdown.totalBudgetKes, 2300);
  assert.equal(wallet.balanceKes, 7700); // 10,000 - 2,300
  assert.equal(wallet.heldKes, 2000); // Held in escrow
  assert.equal(wallet.totalSpentKes, 300); // Platform fee

  let campaign = {
    id: "camp_e2e",
    advertiserId: "adv_e2e",
    rewardPerTaskKes: 200,
    platformFeeKes: 300,
    totalBudgetKes: 2300,
    remainingBudgetKes: 2000,
    maxTasks: 10,
    completedTasks: 0,
    status: "active",
  };

  // Step C: User submits proof and advertiser/admin approves -> user balance increases by KES 200
  let userAvailableBalance = 850;
  const sub1 = {
    id: "sub_e2e_1",
    campaignId: "camp_e2e",
    status: "pending",
  };

  const approval = approveSubmissionAndCreditUserAtomic({
    wallet,
    campaign,
    submission: sub1,
    userAvailableBalanceKes: userAvailableBalance,
    ledger,
  });
  wallet = approval.wallet;
  campaign = approval.campaign;
  ledger = approval.ledger;
  userAvailableBalance = approval.userAvailableBalanceKes;

  assert.equal(userAvailableBalance, 1050); // 850 + 200
  assert.equal(wallet.heldKes, 1800); // 2000 - 200
  assert.equal(wallet.totalSpentKes, 500); // 300 fee + 200 reward
  assert.equal(campaign.completedTasks, 1);
  assert.equal(campaign.remainingBudgetKes, 1800);

  // Double-approving the same submission is rejected
  assert.throws(
    () =>
      approveSubmissionAndCreditUserAtomic({
        wallet,
        campaign,
        submission: approval.submission,
        userAvailableBalanceKes: userAvailableBalance,
        ledger,
      }),
    /already processed/
  );

  // Step D: Advertiser ends campaign early after 1/10 tasks -> unused KES 1,800 refunded to wallet
  const refund = refundCampaignUnusedBudgetAtomic({
    wallet,
    campaign,
    targetStatus: "completed",
    ledger,
  });
  wallet = refund.wallet;
  campaign = refund.campaign;
  ledger = refund.ledger;

  assert.equal(refund.refundedKes, 1800);
  assert.equal(wallet.balanceKes, 9500); // 7700 + 1800 refunded
  assert.equal(wallet.heldKes, 0);
  assert.equal(campaign.remainingBudgetKes, 0);
  assert.equal(campaign.status, "completed");
});
