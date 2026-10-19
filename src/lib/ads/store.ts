import { DEFAULT_PLATFORM_SETTINGS } from "./config";
import {
  approveSubmissionAndCreditUserAtomic,
  creditWalletTopUpAtomic,
  holdCampaignBudgetAtomic,
  refundCampaignUnusedBudgetAtomic,
} from "./ledger";
import {
  AdvertiserLedgerEntry,
  AdvertiserProfile,
  AdvertiserStatus,
  AdvertiserWallet,
  AuditLogEntry,
  CampaignStatus,
  CampaignSubmission,
  PaymentGatewayProvider,
  PaymentRecord,
  PlatformSettings,
  SponsoredCampaign,
} from "./types";
import {
  checkSubmissionEligibility,
  computeDeterministicHash,
  getCampaignTypeTag,
  mapCampaignTypeToCategoryId,
  sanitizeText,
  validateCampaignInput,
} from "./validation";
import { ReviewTask } from "@/lib/types";
import { getStoredUser, updateStoredUser } from "@/lib/auth-service";
import {
  awardPointsServerSide,
  revokePointsForReferenceServerSide,
} from "@/lib/points/service";

const STORAGE_KEY_ADS_STATE = "earnora_ads_portal_state_v1";

export interface AdsPortalState {
  settings: PlatformSettings;
  advertisers: AdvertiserProfile[];
  wallets: AdvertiserWallet[];
  ledger: AdvertiserLedgerEntry[];
  campaigns: SponsoredCampaign[];
  submissions: CampaignSubmission[];
  payments: PaymentRecord[];
  auditLogs: AuditLogEntry[];
}

const SEED_ADVERTISER_ID = "adv_ke_savannah_01";
const SEED_WALLET_ID = "wal_adv_savannah_01";
const SEED_OWNER_PROFILE_ID = "usr_adv_savannah_01";

const INITIAL_ADS_STATE: AdsPortalState = {
  settings: {
    platformFeePercent: DEFAULT_PLATFORM_SETTINGS.platformFeePercent,
    dailyUserSubmissionLimit: DEFAULT_PLATFORM_SETTINGS.dailyUserSubmissionLimit,
    minRewardPerTaskKes: DEFAULT_PLATFORM_SETTINGS.minRewardPerTaskKes,
    minCampaignTasks: DEFAULT_PLATFORM_SETTINGS.minCampaignTasks,
    updatedAt: "2026-10-18T08:00:00Z",
  },
  advertisers: [
    {
      id: SEED_ADVERTISER_ID,
      profileId: SEED_OWNER_PROFILE_ID,
      businessName: "Savannah Roast & Bistro",
      contactPerson: "Wanjiru Kamau",
      phone: "+254722987654",
      email: "marketing@savannahroast.co.ke",
      businessType: "restaurant_hospitality",
      website: "https://savannahroast.co.ke",
      status: "verified",
      createdAt: "2026-10-10T09:00:00Z",
      updatedAt: "2026-10-12T11:30:00Z",
    },
    {
      id: "adv_ke_pesaflow_02",
      profileId: "usr_adv_pesaflow_02",
      businessName: "PesaFlow Micro-Tech Ltd",
      contactPerson: "David Omondi",
      phone: "+254733112233",
      email: "growth@pesaflow.co.ke",
      businessType: "telco_fintech",
      website: "https://pesaflow.co.ke",
      status: "pending",
      createdAt: "2026-10-18T14:00:00Z",
      updatedAt: "2026-10-18T14:00:00Z",
    },
  ],
  wallets: [
    {
      id: SEED_WALLET_ID,
      advertiserId: SEED_ADVERTISER_ID,
      profileId: SEED_OWNER_PROFILE_ID,
      balanceKes: 28250,
      heldKes: 14700,
      totalFundedKes: 50000,
      totalSpentKes: 7050,
      updatedAt: "2026-10-18T12:00:00Z",
    },
    {
      id: "wal_adv_pesaflow_02",
      advertiserId: "adv_ke_pesaflow_02",
      profileId: "usr_adv_pesaflow_02",
      balanceKes: 12000,
      heldKes: 0,
      totalFundedKes: 12000,
      totalSpentKes: 0,
      updatedAt: "2026-10-18T14:10:00Z",
    },
  ],
  ledger: [
    {
      id: "ltx_seed_payout_1",
      walletId: SEED_WALLET_ID,
      advertiserId: SEED_ADVERTISER_ID,
      profileId: "usr_ke_98721",
      txType: "user_payout",
      amountKes: 300,
      direction: "debit",
      balanceBeforeKes: 28250,
      balanceAfterKes: 28250,
      referenceId: "PAYOUT-sub_seed_01",
      campaignId: "camp_adv_savannah_01",
      description: 'Escrow payout to @Mwangi_Tech for "Savannah Roast Westlands Dining Review"',
      createdAt: "2026-10-18T15:20:00Z",
    },
    {
      id: "ltx_seed_fee_1",
      walletId: SEED_WALLET_ID,
      advertiserId: SEED_ADVERTISER_ID,
      profileId: SEED_OWNER_PROFILE_ID,
      txType: "fee",
      amountKes: 2250,
      direction: "debit",
      balanceBeforeKes: 30500,
      balanceAfterKes: 28250,
      referenceId: "FEE-camp_adv_savannah_01",
      campaignId: "camp_adv_savannah_01",
      description: 'Earnora platform fee (15%) for "Savannah Roast Westlands Dining Review"',
      createdAt: "2026-10-15T10:05:00Z",
    },
    {
      id: "ltx_seed_hold_1",
      walletId: SEED_WALLET_ID,
      advertiserId: SEED_ADVERTISER_ID,
      profileId: SEED_OWNER_PROFILE_ID,
      txType: "campaign_hold",
      amountKes: 15000,
      direction: "debit",
      balanceBeforeKes: 45500,
      balanceAfterKes: 30500,
      referenceId: "HOLD-camp_adv_savannah_01",
      campaignId: "camp_adv_savannah_01",
      description: 'Escrow hold for "Savannah Roast Westlands Dining Review" (50 tasks × KES 300)',
      createdAt: "2026-10-15T10:05:00Z",
    },
    {
      id: "ltx_seed_topup_1",
      walletId: SEED_WALLET_ID,
      advertiserId: SEED_ADVERTISER_ID,
      profileId: SEED_OWNER_PROFILE_ID,
      txType: "top_up",
      amountKes: 50000,
      direction: "credit",
      balanceBeforeKes: 0,
      balanceAfterKes: 50000,
      referenceId: "MPESA_SANDBOX_SEED_001",
      invoiceNumber: "INV-2026-1001",
      description: "Wallet top-up via MPESA_STK (INV-2026-1001)",
      createdAt: "2026-10-15T09:45:00Z",
    },
  ],
  campaigns: [
    {
      id: "camp_adv_savannah_01",
      advertiserId: SEED_ADVERTISER_ID,
      ownerProfileId: SEED_OWNER_PROFILE_ID,
      businessName: "Savannah Roast & Bistro",
      title: "Savannah Roast Westlands Dining Review",
      campaignType: "restaurant_review",
      categoryId: "hotels_restaurants",
      description:
        "Share your honest first-hand feedback on our single-origin espresso menu, brunch service speed, and outdoor terrace seating in Westlands.",
      instructions:
        "Describe your beverage or meal order and service wait time.\nInclude honest pros and cons about seating and ambiance.\nAttach a photo of your receipt or table order if available.",
      proofRequirements: {
        requireText: true,
        minWords: 35,
        requireScreenshot: false,
        requireReceipt: true,
        guidelines: [
          "Describe your beverage or meal order and service wait time.",
          "Include honest pros and cons about seating and ambiance.",
          "Attach a photo of your receipt or table order if available.",
        ],
      },
      rewardPerTaskKes: 300,
      platformFeeKes: 2250,
      rewardsSubtotalKes: 15000,
      totalBudgetKes: 17250,
      remainingBudgetKes: 14700,
      maxTasks: 50,
      completedTasks: 1,
      status: "active",
      startDate: "2026-10-15T10:00:00Z",
      endDate: "2026-11-30T23:59:59Z",
      targetOptions: {
        country: "Kenya",
        city: "Nairobi",
        deviceType: "all",
        verifiedPhoneOnly: true,
      },
      createdAt: "2026-10-15T10:05:00Z",
      updatedAt: "2026-10-18T15:20:00Z",
    },
    {
      id: "camp_adv_savannah_02",
      advertiserId: SEED_ADVERTISER_ID,
      ownerProfileId: SEED_OWNER_PROFILE_ID,
      businessName: "Savannah Roast & Bistro",
      title: "Savannah Mobile Ordering Web-App Beta Test",
      campaignType: "app_testing",
      categoryId: "apps_websites",
      description:
        "Test our new table QR ordering flow and M-Pesa Express checkout experience on Android or iOS browsers.",
      instructions:
        "Navigate the menu and test item customization.\nEvaluate page load speed on mobile data.\nReport any UI glitches or unclear buttons.",
      proofRequirements: {
        requireText: true,
        minWords: 30,
        requireScreenshot: true,
        requireReceipt: false,
        guidelines: [
          "Navigate the menu and test item customization.",
          "Evaluate page load speed on mobile data.",
          "Report any UI glitches or unclear buttons.",
        ],
      },
      rewardPerTaskKes: 200,
      platformFeeKes: 600,
      rewardsSubtotalKes: 4000,
      totalBudgetKes: 4600,
      remainingBudgetKes: 4000,
      maxTasks: 20,
      completedTasks: 0,
      status: "pending_approval",
      startDate: "2026-10-19T08:00:00Z",
      endDate: "2026-11-19T23:59:59Z",
      targetOptions: {
        country: "Kenya",
        city: "All Kenya",
        deviceType: "all",
        verifiedPhoneOnly: true,
      },
      createdAt: "2026-10-18T16:30:00Z",
      updatedAt: "2026-10-18T16:30:00Z",
    },
  ],
  submissions: [
    {
      id: "sub_seed_01",
      campaignId: "camp_adv_savannah_01",
      campaignTitle: "Savannah Roast Westlands Dining Review",
      advertiserId: SEED_ADVERTISER_ID,
      businessName: "Savannah Roast & Bistro",
      userProfileId: "usr_mwangi_01",
      username: "Mwangi_Tech",
      userPhone: "+254711223344",
      rating: 4,
      headline: "Rich AA pour-over coffee and calm terrace, slightly busy at noon",
      reviewText:
        "Visited Savannah Roast in Westlands on Thursday morning. Ordered the Nyeri AA V60 pour-over and avocado toast. Coffee aroma and temperature were spot on, and the outdoor seating had reliable power sockets. Lunch hour got crowded and billing took about 10 minutes.",
      pros: "Authentic Kenyan single-origin coffee, fast Wi-Fi, clean terrace",
      cons: "Wait time for the bill around 1 PM lunch rush",
      proofFileName: "savannah_receipt_oct18.jpg",
      proofMimeType: "image/jpeg",
      proofSizeBytes: 245000,
      proofHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00",
      rewardKes: 300,
      status: "approved",
      isFlagged: false,
      reviewerNotes: "Verified receipt and balanced feedback.",
      reviewedBy: SEED_OWNER_PROFILE_ID,
      reviewedAt: "2026-10-18T15:20:00Z",
      createdAt: "2026-10-18T13:10:00Z",
    },
    {
      id: "sub_seed_02",
      campaignId: "camp_adv_savannah_01",
      campaignTitle: "Savannah Roast Westlands Dining Review",
      advertiserId: SEED_ADVERTISER_ID,
      businessName: "Savannah Roast & Bistro",
      userProfileId: "usr_amina_02",
      username: "Amina_Reviews",
      userPhone: "+254722556677",
      rating: 5,
      headline: "Great cinnamon rolls and attentive barista team",
      reviewText:
        "Stopped by for breakfast before a client meeting. The warm cinnamon roll and flat white were served in under 6 minutes. Staff were polite and helped us find a quiet corner table. Parking space outside was a bit tight at 9 AM.",
      pros: "Fast service, fresh pastries, welcoming staff",
      cons: "Parking lot fills up early in the morning",
      proofFileName: "savannah_order_photo.png",
      proofMimeType: "image/png",
      proofSizeBytes: 312000,
      proofHash: "f0e1d2c3b4a5968778695a4b3c2d1e0f99887766554433221100ffeeddccbbaa",
      rewardKes: 300,
      status: "pending",
      isFlagged: false,
      createdAt: "2026-10-19T07:45:00Z",
    },
    {
      id: "sub_seed_03",
      campaignId: "camp_adv_savannah_01",
      campaignTitle: "Savannah Roast Westlands Dining Review",
      advertiserId: SEED_ADVERTISER_ID,
      businessName: "Savannah Roast & Bistro",
      userProfileId: "usr_bot_99",
      username: "QuickSpammer99",
      userPhone: "+254700000099",
      rating: 5,
      headline: "Good place very nice place best food in town",
      reviewText:
        "Very good restaurant I like it so much best coffee in Nairobi very good restaurant I like it so much best coffee in Nairobi.",
      pros: "Everything good",
      cons: "Nothing bad",
      rewardKes: 300,
      status: "pending",
      isFlagged: true,
      flagReason: "Repetitive low-effort text pattern detected (high duplicate score)",
      createdAt: "2026-10-19T08:15:00Z",
    },
  ],
  payments: [
    {
      id: "pay_seed_01",
      advertiserId: SEED_ADVERTISER_ID,
      walletId: SEED_WALLET_ID,
      provider: "mpesa_stk",
      gatewayReference: "MPESA_SANDBOX_SEED_001",
      checkoutRequestId: "ws_CO_15102026094500",
      amountKes: 50000,
      status: "completed",
      invoiceNumber: "INV-2026-1001",
      phoneOrEmail: "+254722987654",
      createdAt: "2026-10-15T09:44:00Z",
      completedAt: "2026-10-15T09:45:00Z",
    },
  ],
  auditLogs: [
    {
      id: "aud_seed_01",
      actorId: SEED_OWNER_PROFILE_ID,
      actorName: "Savannah Roast & Bistro",
      actorRole: "advertiser",
      action: "WALLET_TOP_UP_CREDITED",
      targetType: "payment",
      targetId: "pay_seed_01",
      details: { amountKes: 50000, provider: "mpesa_stk", ref: "MPESA_SANDBOX_SEED_001" },
      createdAt: "2026-10-15T09:45:00Z",
    },
    {
      id: "aud_seed_02",
      actorId: "admin_ke_01",
      actorName: "Earnora Compliance Admin",
      actorRole: "admin",
      action: "CAMPAIGN_APPROVED",
      targetType: "campaign",
      targetId: "camp_adv_savannah_01",
      details: { title: "Savannah Roast Westlands Dining Review", totalBudgetKes: 17250 },
      createdAt: "2026-10-15T11:00:00Z",
    },
    {
      id: "aud_seed_03",
      actorId: SEED_OWNER_PROFILE_ID,
      actorName: "Savannah Roast & Bistro",
      actorRole: "advertiser",
      action: "SUBMISSION_APPROVED_AND_PAID",
      targetType: "campaign_submission",
      targetId: "sub_seed_01",
      details: { username: "Mwangi_Tech", rewardKes: 300 },
      createdAt: "2026-10-18T15:20:00Z",
    },
  ],
};

let serverMemoryState: AdsPortalState = structuredClone(INITIAL_ADS_STATE);

export function getAdsState(): AdsPortalState {
  if (typeof window === "undefined") {
    return serverMemoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADS_STATE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ADS_STATE, JSON.stringify(INITIAL_ADS_STATE));
      return structuredClone(INITIAL_ADS_STATE);
    }
    return JSON.parse(raw) as AdsPortalState;
  } catch {
    return structuredClone(INITIAL_ADS_STATE);
  }
}

export function saveAdsState(nextState: AdsPortalState): AdsPortalState {
  serverMemoryState = nextState;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ADS_STATE, JSON.stringify(nextState));
      window.dispatchEvent(new Event("earnora_ads_state_updated"));
    } catch {
      // Ignore storage quota errors
    }
  }
  return nextState;
}

/**
 * Resolves the active advertiser profile and wallet for the current logged-in user
 * (or falls back to the demo advertiser in sandbox mode).
 */
export function getActiveAdvertiserAndWallet(profileId?: string): {
  advertiser: AdvertiserProfile;
  wallet: AdvertiserWallet;
} {
  const state = getAdsState();
  const currentUser = getStoredUser();
  const effectiveProfileId = profileId || currentUser?.id;

  let advertiser = state.advertisers.find((a) => a.profileId === effectiveProfileId);
  if (!advertiser) {
    advertiser = state.advertisers[0];
  }

  let wallet = state.wallets.find((w) => w.advertiserId === advertiser.id);
  if (!wallet) {
    wallet = {
      id: `wal_${advertiser.id}`,
      advertiserId: advertiser.id,
      profileId: advertiser.profileId,
      balanceKes: 0,
      heldKes: 0,
      totalFundedKes: 0,
      totalSpentKes: 0,
      updatedAt: new Date().toISOString(),
    };
    state.wallets.push(wallet);
    saveAdsState(state);
  }

  return { advertiser, wallet };
}

/**
 * Registers a new Advertiser account & initializes its KES wallet with 0 balance.
 */
export function registerAdvertiserAccount(input: {
  profileId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: AdvertiserProfile["businessType"];
  website?: string;
}): { advertiser: AdvertiserProfile; wallet: AdvertiserWallet } {
  const state = getAdsState();
  const nowIso = new Date().toISOString();

  const advertiserId = `adv_${Date.now()}`;
  const walletId = `wal_${Date.now()}`;

  const newAdvertiser: AdvertiserProfile = {
    id: advertiserId,
    profileId: input.profileId,
    businessName: sanitizeText(input.businessName, 150),
    contactPerson: sanitizeText(input.contactPerson, 120),
    phone: sanitizeText(input.phone, 30),
    email: sanitizeText(input.email, 150).toLowerCase(),
    businessType: input.businessType,
    website: input.website ? sanitizeText(input.website, 250) : undefined,
    status: "pending",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const newWallet: AdvertiserWallet = {
    id: walletId,
    advertiserId,
    profileId: input.profileId,
    balanceKes: 0,
    heldKes: 0,
    totalFundedKes: 0,
    totalSpentKes: 0,
    updatedAt: nowIso,
  };

  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    actorId: input.profileId,
    actorName: newAdvertiser.businessName,
    actorRole: "advertiser",
    action: "ADVERTISER_REGISTERED",
    targetType: "advertiser",
    targetId: advertiserId,
    details: {
      businessName: newAdvertiser.businessName,
      businessType: newAdvertiser.businessType,
      email: newAdvertiser.email,
    },
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    advertisers: [newAdvertiser, ...state.advertisers],
    wallets: [newWallet, ...state.wallets],
    auditLogs: [auditEntry, ...state.auditLogs],
  });

  return { advertiser: newAdvertiser, wallet: newWallet };
}

/**
 * Updates Advertiser business profile settings.
 */
export function updateAdvertiserProfile(
  advertiserId: string,
  updates: Partial<
    Pick<
      AdvertiserProfile,
      "businessName" | "contactPerson" | "phone" | "email" | "businessType" | "website"
    >
  >
): AdvertiserProfile | null {
  const state = getAdsState();
  const idx = state.advertisers.findIndex((a) => a.id === advertiserId);
  if (idx === -1) return null;

  const updated: AdvertiserProfile = {
    ...state.advertisers[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const nextAdvertisers = [...state.advertisers];
  nextAdvertisers[idx] = updated;

  saveAdsState({
    ...state,
    advertisers: nextAdvertisers,
  });

  return updated;
}

/**
 * Initiates a pending PaymentRecord for wallet top-up.
 */
export function createPendingTopUpPayment(params: {
  advertiserId: string;
  walletId: string;
  provider: PaymentGatewayProvider;
  amountKes: number;
  phoneOrEmail: string;
  gatewayReference?: string;
  checkoutRequestId?: string;
}): PaymentRecord {
  const cleanAmount = Math.trunc(Number(params.amountKes));
  if (!Number.isSafeInteger(cleanAmount) || cleanAmount < 100) {
    throw new Error("Minimum wallet top-up amount is KES 100 (whole integer KES).");
  }

  const state = getAdsState();
  const nowIso = new Date().toISOString();
  const invoiceNumber = `INV-2026-${1000 + state.payments.length + 1}`;
  const gatewayReference =
    params.gatewayReference ||
    `${params.provider.toUpperCase()}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const record: PaymentRecord = {
    id: `pay_${Date.now()}`,
    advertiserId: params.advertiserId,
    walletId: params.walletId,
    provider: params.provider,
    gatewayReference,
    checkoutRequestId: params.checkoutRequestId || `CHK_${Date.now()}`,
    amountKes: cleanAmount,
    status: "pending",
    invoiceNumber,
    phoneOrEmail: sanitizeText(params.phoneOrEmail, 120),
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    payments: [record, ...state.payments],
  });

  return record;
}

/**
 * Processes an idempotent payment callback and credits the advertiser wallet on success.
 */
export function confirmTopUpPaymentCallback(params: {
  gatewayReference: string;
  rawPayload?: Record<string, unknown>;
}): {
  idempotent: boolean;
  wallet: AdvertiserWallet;
  payment: PaymentRecord;
} {
  const state = getAdsState();
  const payment = state.payments.find((p) => p.gatewayReference === params.gatewayReference);
  if (!payment) {
    throw new Error(`Payment with reference ${params.gatewayReference} not found.`);
  }

  const wallet = state.wallets.find((w) => w.id === payment.walletId);
  if (!wallet) {
    throw new Error(`Wallet ${payment.walletId} not found.`);
  }

  const result = creditWalletTopUpAtomic({
    wallet,
    payment,
    ledger: state.ledger,
    rawPayload: params.rawPayload,
  });

  const nextWallets = state.wallets.map((w) =>
    w.id === result.wallet.id ? result.wallet : w
  );
  const nextPayments = state.payments.map((p) =>
    p.id === result.payment.id ? result.payment : p
  );

  const nextAuditLogs = [...state.auditLogs];
  if (!result.idempotent) {
    const adv = state.advertisers.find((a) => a.id === wallet.advertiserId);
    nextAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: wallet.profileId,
      actorName: adv?.businessName || "Advertiser",
      actorRole: "advertiser",
      action: "WALLET_TOP_UP_CREDITED",
      targetType: "payment",
      targetId: payment.id,
      details: {
        amountKes: payment.amountKes,
        gatewayReference: payment.gatewayReference,
        provider: payment.provider,
        invoiceNumber: payment.invoiceNumber,
      },
      createdAt: new Date().toISOString(),
    });
  }

  saveAdsState({
    ...state,
    wallets: nextWallets,
    payments: nextPayments,
    ledger: result.ledger,
    auditLogs: nextAuditLogs,
  });

  return {
    idempotent: result.idempotent,
    wallet: result.wallet,
    payment: result.payment,
  };
}

/**
 * Server-validated campaign creation with atomic escrow hold.
 */
export function createAndFundCampaign(
  advertiserId: string,
  rawInput: Record<string, unknown>
): {
  campaign: SponsoredCampaign;
  wallet: AdvertiserWallet;
} {
  const state = getAdsState();
  const advertiser = state.advertisers.find((a) => a.id === advertiserId);
  if (!advertiser) {
    throw new Error("Advertiser account not found.");
  }
  if (advertiser.status === "suspended") {
    throw new Error("Suspended advertiser accounts cannot create campaigns.");
  }

  const wallet = state.wallets.find((w) => w.advertiserId === advertiserId);
  if (!wallet) {
    throw new Error("Advertiser wallet not found.");
  }

  const validation = validateCampaignInput(rawInput, state.settings);
  if (!validation.valid || !validation.data) {
    throw new Error(validation.error || "Invalid campaign parameters.");
  }

  const d = validation.data;
  const campaignId = `camp_adv_${Date.now()}`;
  const nowIso = new Date().toISOString();

  // Hold funds in escrow atomically
  const holdResult = holdCampaignBudgetAtomic({
    wallet,
    rewardPerTaskKes: d.rewardPerTaskKes,
    maxTasks: d.maxTasks,
    platformFeePercent: state.settings.platformFeePercent,
    campaignId,
    campaignTitle: d.title,
    ledger: state.ledger,
    nowIso,
  });

  const newCampaign: SponsoredCampaign = {
    id: campaignId,
    advertiserId: advertiser.id,
    ownerProfileId: advertiser.profileId,
    businessName: advertiser.businessName,
    title: d.title,
    campaignType: d.campaignType,
    categoryId: mapCampaignTypeToCategoryId(d.campaignType),
    description: d.description,
    instructions: d.instructions,
    proofRequirements: {
      requireText: true,
      minWords: d.minWords,
      requireScreenshot: d.requireScreenshot,
      requireReceipt: d.requireReceipt,
      guidelines: d.guidelines,
    },
    rewardPerTaskKes: holdResult.costBreakdown.rewardPerTaskKes,
    platformFeeKes: holdResult.costBreakdown.platformFeeKes,
    rewardsSubtotalKes: holdResult.costBreakdown.rewardsSubtotalKes,
    totalBudgetKes: holdResult.costBreakdown.totalBudgetKes,
    remainingBudgetKes: holdResult.costBreakdown.rewardsSubtotalKes,
    maxTasks: holdResult.costBreakdown.maxTasks,
    completedTasks: 0,
    status: "pending_approval",
    startDate: d.startDate,
    endDate: d.endDate,
    targetOptions: {
      country: "Kenya",
      city: d.city || "All Kenya",
      deviceType: d.deviceType || "all",
      verifiedPhoneOnly: true,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    actorId: advertiser.profileId,
    actorName: advertiser.businessName,
    actorRole: "advertiser",
    action: "CAMPAIGN_CREATED_ESCROW_HELD",
    targetType: "campaign",
    targetId: campaignId,
    details: {
      title: newCampaign.title,
      rewardPerTaskKes: newCampaign.rewardPerTaskKes,
      maxTasks: newCampaign.maxTasks,
      platformFeeKes: newCampaign.platformFeeKes,
      totalBudgetKes: newCampaign.totalBudgetKes,
    },
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    wallets: state.wallets.map((w) =>
      w.id === holdResult.wallet.id ? holdResult.wallet : w
    ),
    campaigns: [newCampaign, ...state.campaigns],
    ledger: holdResult.ledger,
    auditLogs: [auditEntry, ...state.auditLogs],
  });

  return {
    campaign: newCampaign,
    wallet: holdResult.wallet,
  };
}

/**
 * Pause, resume, or end a campaign (refunding unused escrow budget on completion/rejection).
 */
export function changeCampaignStatus(params: {
  campaignId: string;
  nextStatus: CampaignStatus;
  actorId: string;
  actorName: string;
  actorRole: "advertiser" | "admin";
  reason?: string;
}): { campaign: SponsoredCampaign; refundedKes: number } {
  const state = getAdsState();
  const campaign = state.campaigns.find((c) => c.id === params.campaignId);
  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  const wallet = state.wallets.find((w) => w.advertiserId === campaign.advertiserId);
  if (!wallet) {
    throw new Error("Advertiser wallet not found.");
  }

  const nowIso = new Date().toISOString();

  // If ending (completed) or rejecting, refund unused budget atomically
  if (params.nextStatus === "completed" || params.nextStatus === "rejected") {
    const refundRes = refundCampaignUnusedBudgetAtomic({
      wallet,
      campaign,
      targetStatus: params.nextStatus,
      reason: params.reason,
      ledger: state.ledger,
      nowIso,
    });

    const auditEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action:
        params.nextStatus === "rejected"
          ? "CAMPAIGN_REJECTED_AND_REFUNDED"
          : "CAMPAIGN_ENDED_UNUSED_REFUNDED",
      targetType: "campaign",
      targetId: campaign.id,
      details: {
        title: campaign.title,
        refundedKes: refundRes.refundedKes,
        reason: params.reason || "Campaign ended",
      },
      createdAt: nowIso,
    };

    saveAdsState({
      ...state,
      wallets: state.wallets.map((w) =>
        w.id === refundRes.wallet.id ? refundRes.wallet : w
      ),
      campaigns: state.campaigns.map((c) =>
        c.id === refundRes.campaign.id ? refundRes.campaign : c
      ),
      ledger: refundRes.ledger,
      auditLogs: [auditEntry, ...state.auditLogs],
    });

    return {
      campaign: refundRes.campaign,
      refundedKes: refundRes.refundedKes,
    };
  }

  const updatedCampaign: SponsoredCampaign = {
    ...campaign,
    status: params.nextStatus,
    rejectionReason:
      params.nextStatus === "active" ? undefined : campaign.rejectionReason,
    updatedAt: nowIso,
  };

  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    action: `CAMPAIGN_STATUS_${params.nextStatus.toUpperCase()}`,
    targetType: "campaign",
    targetId: campaign.id,
    details: { title: campaign.title, status: params.nextStatus },
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === updatedCampaign.id ? updatedCampaign : c
    ),
    auditLogs: [auditEntry, ...state.auditLogs],
  });

  return { campaign: updatedCampaign, refundedKes: 0 };
}

/**
 * Submits user proof for a sponsored campaign after enforcing all anti-fraud rules.
 */
export function submitSponsoredTaskProof(params: {
  campaignId: string;
  userProfileId: string;
  username: string;
  userPhone: string;
  rating: number;
  headline: string;
  reviewText: string;
  pros: string;
  cons: string;
  proofFile?: {
    name: string;
    type: string;
    size: number;
    dataUrlOrContent?: string;
  };
}): CampaignSubmission {
  const state = getAdsState();
  const campaign = state.campaigns.find((c) => c.id === params.campaignId);
  if (!campaign) {
    throw new Error("Sponsored campaign not found.");
  }

  const cleanHeadline = sanitizeText(params.headline, 200);
  const cleanReviewText = sanitizeText(params.reviewText, 3000);
  const cleanPros = sanitizeText(params.pros, 500);
  const cleanCons = sanitizeText(params.cons, 500);

  const proofHash = params.proofFile
    ? computeDeterministicHash(
        params.proofFile.dataUrlOrContent ||
          `${params.proofFile.name}:${params.proofFile.size}:${params.proofFile.type}`
      )
    : undefined;

  const eligibility = checkSubmissionEligibility({
    campaign,
    userProfileId: params.userProfileId,
    proofHash,
    existingSubmissions: state.submissions,
    dailyLimit: state.settings.dailyUserSubmissionLimit,
  });

  if (!eligibility.eligible) {
    throw new Error(eligibility.error || "Not eligible to submit to this campaign.");
  }

  // Flag suspiciously repetitive or near-duplicate review text
  const normalizedWords = cleanReviewText.toLowerCase().split(/\s+/).filter(Boolean);
  const uniqueWordRatio =
    normalizedWords.length > 0
      ? new Set(normalizedWords).size / normalizedWords.length
      : 1;
  const isFlagged = uniqueWordRatio < 0.45;

  const nowIso = new Date().toISOString();
  const submission: CampaignSubmission = {
    id: `sub_${Date.now()}`,
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    advertiserId: campaign.advertiserId,
    businessName: campaign.businessName,
    userProfileId: params.userProfileId,
    username: params.username,
    userPhone: params.userPhone,
    rating: Math.max(1, Math.min(5, Math.trunc(Number(params.rating) || 5))),
    headline: cleanHeadline,
    reviewText: cleanReviewText,
    pros: cleanPros,
    cons: cleanCons,
    proofUrl: params.proofFile?.dataUrlOrContent,
    proofFileName: params.proofFile?.name,
    proofMimeType: params.proofFile?.type,
    proofSizeBytes: params.proofFile?.size,
    proofHash,
    rewardKes: campaign.rewardPerTaskKes,
    status: "pending",
    isFlagged,
    flagReason: isFlagged
      ? "Low unique vocabulary ratio detected — queued for manual verification"
      : undefined,
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    submissions: [submission, ...state.submissions],
  });

  return submission;
}

/**
 * Approves or rejects a campaign submission.
 * On approval, atomically credits the user's available balance from campaign escrow.
 */
export function reviewCampaignSubmission(params: {
  submissionId: string;
  decision: "approved" | "rejected";
  reviewerId: string;
  reviewerName: string;
  reviewerRole: "advertiser" | "admin";
  notes?: string;
}): CampaignSubmission {
  const state = getAdsState();
  const submission = state.submissions.find((s) => s.id === params.submissionId);
  if (!submission) {
    throw new Error("Submission not found.");
  }

  if (
    submission.status !== "pending" &&
    !(submission.status === "approved" && params.decision === "rejected")
  ) {
    throw new Error(`Submission is already ${submission.status}.`);
  }

  const nowIso = new Date().toISOString();

  if (params.decision === "rejected") {
    const currentUser = getStoredUser();
    if (currentUser && currentUser.id === submission.userProfileId) {
      updateStoredUser({
        pendingBalance: Math.max(0, currentUser.pendingBalance - submission.rewardKes),
      });
    }

    // Revoke any points that were awarded for this submission
    revokePointsForReferenceServerSide({
      userId: submission.userProfileId,
      originalReferenceId: `SUB_APPROVE:${submission.id}`,
      reasonDescription: `Points revoked for rejected submission: ${submission.campaignTitle}`,
      nowIso,
    });

    const rejectedSub: CampaignSubmission = {
      ...submission,
      status: "rejected",
      reviewerNotes: sanitizeText(params.notes || "Did not meet campaign proof guidelines.", 400),
      reviewedBy: params.reviewerId,
      reviewedAt: nowIso,
    };

    const auditEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      actorId: params.reviewerId,
      actorName: params.reviewerName,
      actorRole: params.reviewerRole,
      action: "SUBMISSION_REJECTED",
      targetType: "campaign_submission",
      targetId: submission.id,
      details: {
        campaignTitle: submission.campaignTitle,
        username: submission.username,
        notes: rejectedSub.reviewerNotes,
      },
      createdAt: nowIso,
    };

    saveAdsState({
      ...state,
      submissions: state.submissions.map((s) =>
        s.id === rejectedSub.id ? rejectedSub : s
      ),
      auditLogs: [auditEntry, ...state.auditLogs],
    });

    return rejectedSub;
  }

  // Approval: Atomic escrow release & user credit
  const campaign = state.campaigns.find((c) => c.id === submission.campaignId);
  if (!campaign) {
    throw new Error("Associated campaign not found.");
  }

  const wallet = state.wallets.find((w) => w.advertiserId === campaign.advertiserId);
  if (!wallet) {
    throw new Error("Associated advertiser wallet not found.");
  }

  const currentUser = getStoredUser();
  const isCurrentLoggedInReviewer =
    currentUser &&
    (currentUser.id === submission.userProfileId ||
      currentUser.username.toLowerCase() === submission.username.toLowerCase());

  const atomicRes = approveSubmissionAndCreditUserAtomic({
    wallet,
    campaign,
    submission,
    userAvailableBalanceKes: currentUser?.availableBalance ?? 0,
    userPendingBalanceKes: currentUser?.pendingBalance ?? submission.rewardKes,
    userTotalEarnedKes: currentUser?.totalEarned ?? 0,
    reviewerId: params.reviewerId,
    reviewerNotes: sanitizeText(params.notes || "Verified and approved.", 400),
    ledger: state.ledger,
    nowIso,
  });

  // Award configurable points (+15 for approved review, +10 for approved task) idempotently
  const pointReason =
    campaign.campaignType === "restaurant_review" ? "approved_review" : "approved_task";
  awardPointsServerSide({
    userId: submission.userProfileId,
    reason: pointReason,
    referenceId: `SUB_APPROVE:${submission.id}`,
    customDescription: `Approved ${
      pointReason === "approved_review" ? "Review" : "Task"
    }: ${campaign.title}`,
    nowIso,
  });

  if (isCurrentLoggedInReviewer && currentUser) {
    updateStoredUser({
      availableBalance: atomicRes.userBalances.availableBalance,
      pendingBalance: atomicRes.userBalances.pendingBalance,
      totalEarned: atomicRes.userBalances.totalEarned,
    });
  }

  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    actorId: params.reviewerId,
    actorName: params.reviewerName,
    actorRole: params.reviewerRole,
    action: "SUBMISSION_APPROVED_AND_PAID",
    targetType: "campaign_submission",
    targetId: submission.id,
    details: {
      campaignTitle: campaign.title,
      username: submission.username,
      rewardKes: submission.rewardKes,
    },
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    wallets: state.wallets.map((w) =>
      w.id === atomicRes.wallet.id ? atomicRes.wallet : w
    ),
    campaigns: state.campaigns.map((c) =>
      c.id === atomicRes.campaign.id ? atomicRes.campaign : c
    ),
    submissions: state.submissions.map((s) =>
      s.id === atomicRes.submission.id ? atomicRes.submission : s
    ),
    ledger: atomicRes.ledger,
    auditLogs: [auditEntry, ...state.auditLogs],
  });

  return atomicRes.submission;
}

/**
 * Admin: Verify or suspend an advertiser account.
 */
export function setAdvertiserStatusAdmin(params: {
  advertiserId: string;
  status: AdvertiserStatus;
  reason?: string;
  adminId: string;
}): AdvertiserProfile {
  const state = getAdsState();
  const adv = state.advertisers.find((a) => a.id === params.advertiserId);
  if (!adv) {
    throw new Error("Advertiser not found.");
  }

  const nowIso = new Date().toISOString();
  const updated: AdvertiserProfile = {
    ...adv,
    status: params.status,
    statusReason: params.reason ? sanitizeText(params.reason, 300) : undefined,
    updatedAt: nowIso,
  };

  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    actorId: params.adminId,
    actorName: "Earnora Admin",
    actorRole: "admin",
    action: `ADVERTISER_${params.status.toUpperCase()}`,
    targetType: "advertiser",
    targetId: adv.id,
    details: { businessName: adv.businessName, status: params.status, reason: params.reason },
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    advertisers: state.advertisers.map((a) => (a.id === updated.id ? updated : a)),
    auditLogs: [auditEntry, ...state.auditLogs],
  });

  return updated;
}

/**
 * Admin: Update platform fee percentage and limits.
 */
export function updatePlatformSettingsAdmin(
  updates: Partial<Omit<PlatformSettings, "updatedAt">>,
  adminId = "admin_ke_01"
): PlatformSettings {
  const state = getAdsState();
  const nowIso = new Date().toISOString();

  const feePct = Math.max(
    0,
    Math.min(50, Math.trunc(Number(updates.platformFeePercent ?? state.settings.platformFeePercent)))
  );
  const dailyLimit = Math.max(
    1,
    Math.min(
      100,
      Math.trunc(Number(updates.dailyUserSubmissionLimit ?? state.settings.dailyUserSubmissionLimit))
    )
  );
  const minReward = Math.max(
    10,
    Math.trunc(Number(updates.minRewardPerTaskKes ?? state.settings.minRewardPerTaskKes))
  );
  const minTasks = Math.max(
    1,
    Math.trunc(Number(updates.minCampaignTasks ?? state.settings.minCampaignTasks))
  );

  const nextSettings: PlatformSettings = {
    platformFeePercent: feePct,
    dailyUserSubmissionLimit: dailyLimit,
    minRewardPerTaskKes: minReward,
    minCampaignTasks: minTasks,
    updatedAt: nowIso,
  };

  const auditEntry: AuditLogEntry = {
    id: `aud_${Date.now()}`,
    actorId: adminId,
    actorName: "Earnora Admin",
    actorRole: "admin",
    action: "PLATFORM_SETTINGS_UPDATED",
    targetType: "platform_settings",
    targetId: "1",
    details: { ...nextSettings },
    createdAt: nowIso,
  };

  saveAdsState({
    ...state,
    settings: nextSettings,
    auditLogs: [auditEntry, ...state.auditLogs],
  });

  return nextSettings;
}

/**
 * Converts an active, funded SponsoredCampaign into the existing ReviewTask shape
 * so the Earn page renders it with the exact existing task card UI and "Sponsored" badge.
 */
export function mapCampaignToReviewTask(campaign: SponsoredCampaign): ReviewTask {
  return {
    id: campaign.id,
    categoryId: campaign.categoryId,
    title: campaign.title,
    entityName: campaign.businessName,
    rewardKes: campaign.rewardPerTaskKes,
    estimatedMinutes:
      campaign.campaignType === "product"
        ? 10
        : campaign.campaignType === "survey"
        ? 6
        : 4,
    isSponsored: true,
    categoryTag: getCampaignTypeTag(campaign.campaignType),
    deadline: campaign.endDate,
    description: campaign.description,
    instructions:
      campaign.proofRequirements.guidelines.length > 0
        ? campaign.proofRequirements.guidelines
        : [campaign.instructions],
    requirements: {
      minWords: campaign.proofRequirements.minWords ?? 30,
      requirePhoto:
        campaign.proofRequirements.requireScreenshot ||
        campaign.proofRequirements.requireReceipt,
      photoAttestationRequired:
        campaign.proofRequirements.requireScreenshot ||
        campaign.proofRequirements.requireReceipt,
    },
  };
}

/**
 * Returns active, funded sponsored campaigns mapped to ReviewTask[] for the Earn page.
 */
export function getActiveSponsoredTasksForEarnPage(): ReviewTask[] {
  const state = getAdsState();
  return state.campaigns
    .filter(
      (c) =>
        c.status === "active" &&
        c.completedTasks < c.maxTasks &&
        c.remainingBudgetKes >= c.rewardPerTaskKes
    )
    .map(mapCampaignToReviewTask);
}
