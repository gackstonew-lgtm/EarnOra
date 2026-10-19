import { DEFAULT_PLATFORM_SETTINGS } from "./config";
import {
  BusinessType,
  CampaignSubmission,
  CampaignType,
  PlatformSettings,
  SponsoredCampaign,
} from "./types";
import { EarningCategoryId } from "@/lib/types";

/**
 * Sanitizes user input text by stripping HTML/script tags and control characters.
 */
export function sanitizeText(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Maps CampaignType to Earnora's existing EarningCategoryId
 */
export function mapCampaignTypeToCategoryId(type: CampaignType): EarningCategoryId {
  switch (type) {
    case "restaurant_review":
      return "hotels_restaurants";
    case "app_testing":
      return "apps_websites";
    case "survey":
      return "paid_surveys";
    case "telco":
      return "telco_fintech";
    case "product":
      return "product_testing";
    default:
      return "local_services";
  }
}

export function getCampaignTypeTag(type: CampaignType): string {
  switch (type) {
    case "restaurant_review":
      return "RESTAURANT REVIEW";
    case "app_testing":
      return "APP TESTING";
    case "survey":
      return "PAID SURVEY";
    case "telco":
      return "TELCO TASK";
    case "product":
      return "PRODUCT TESTING";
    default:
      return "SPONSORED TASK";
  }
}

/**
 * Server-side integer KES cost calculator.
 * Never uses floating-point currency storage.
 * Formula: rewardPerTaskKes * maxTasks + ceil(subtotal * feePercent / 100) = totalBudgetKes
 */
export function calculateCampaignCost(
  rewardPerTaskKes: number,
  maxTasks: number,
  platformFeePercent: number = DEFAULT_PLATFORM_SETTINGS.platformFeePercent
): {
  rewardPerTaskKes: number;
  maxTasks: number;
  rewardsSubtotalKes: number;
  platformFeePercent: number;
  platformFeeKes: number;
  totalBudgetKes: number;
} {
  const cleanReward = Math.trunc(Number(rewardPerTaskKes));
  const cleanTasks = Math.trunc(Number(maxTasks));
  const cleanFeePct = Math.trunc(Number(platformFeePercent));

  if (!Number.isSafeInteger(cleanReward) || cleanReward <= 0) {
    throw new Error("Reward per task must be a positive whole KES integer.");
  }
  if (!Number.isSafeInteger(cleanTasks) || cleanTasks <= 0) {
    throw new Error("Maximum tasks must be a positive integer.");
  }
  if (!Number.isSafeInteger(cleanFeePct) || cleanFeePct < 0 || cleanFeePct > 50) {
    throw new Error("Platform fee percentage must be an integer between 0 and 50.");
  }

  const rewardsSubtotalKes = cleanReward * cleanTasks;
  const platformFeeKes = Math.ceil((rewardsSubtotalKes * cleanFeePct) / 100);
  const totalBudgetKes = rewardsSubtotalKes + platformFeeKes;

  return {
    rewardPerTaskKes: cleanReward,
    maxTasks: cleanTasks,
    rewardsSubtotalKes,
    platformFeePercent: cleanFeePct,
    platformFeeKes,
    totalBudgetKes,
  };
}

const VALID_BUSINESS_TYPES: BusinessType[] = [
  "restaurant_hospitality",
  "app_software",
  "market_research",
  "telco_fintech",
  "consumer_product",
  "local_service",
];

export function validateAdvertiserSignup(payload: Record<string, unknown>): {
  valid: boolean;
  error?: string;
  data?: {
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    businessType: BusinessType;
    website?: string;
    password: string;
  };
} {
  // Never allow admin role assignment via signup
  if (payload.role === "admin") {
    return {
      valid: false,
      error: "Admin accounts cannot be created via signup.",
    };
  }

  const businessName = sanitizeText(payload.businessName, 150);
  const contactPerson = sanitizeText(payload.contactPerson, 120);
  const phone = sanitizeText(payload.phone, 30);
  const email = sanitizeText(payload.email, 150).toLowerCase();
  const businessType = sanitizeText(payload.businessType, 60) as BusinessType;
  const websiteRaw = sanitizeText(payload.website, 250);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!businessName || businessName.length < 2) {
    return { valid: false, error: "Business name must be at least 2 characters." };
  }
  if (!contactPerson || contactPerson.length < 2) {
    return { valid: false, error: "Contact person name is required." };
  }
  if (!phone || phone.length < 9) {
    return { valid: false, error: "A valid business phone number is required." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: "A valid business email address is required." };
  }
  if (!VALID_BUSINESS_TYPES.includes(businessType)) {
    return { valid: false, error: "Please select a valid business type." };
  }
  if (websiteRaw && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(websiteRaw)) {
    return { valid: false, error: "Website URL must start with http:// or https://." };
  }
  if (!password || password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters." };
  }

  return {
    valid: true,
    data: {
      businessName,
      contactPerson,
      phone,
      email,
      businessType,
      website: websiteRaw || undefined,
      password,
    },
  };
}

const VALID_CAMPAIGN_TYPES: CampaignType[] = [
  "restaurant_review",
  "app_testing",
  "survey",
  "telco",
  "product",
];

export function validateCampaignInput(
  payload: Record<string, unknown>,
  settings: PlatformSettings
): {
  valid: boolean;
  error?: string;
  data?: {
    title: string;
    campaignType: CampaignType;
    description: string;
    instructions: string;
    rewardPerTaskKes: number;
    maxTasks: number;
    rewardsSubtotalKes: number;
    platformFeeKes: number;
    totalBudgetKes: number;
    minWords: number;
    requireScreenshot: boolean;
    requireReceipt: boolean;
    guidelines: string[];
    startDate: string;
    endDate?: string;
    city?: string;
    deviceType?: "all" | "android" | "ios" | "desktop";
  };
} {
  const title = sanitizeText(payload.title, 200);
  const campaignType = sanitizeText(payload.campaignType, 40) as CampaignType;
  const description = sanitizeText(payload.description, 1000);
  const instructions = sanitizeText(payload.instructions, 2000);
  const rewardPerTaskKes = Number(payload.rewardPerTaskKes);
  const maxTasks = Number(payload.maxTasks);

  if (!title || title.length < 5) {
    return { valid: false, error: "Campaign title must be at least 5 characters." };
  }
  if (!VALID_CAMPAIGN_TYPES.includes(campaignType)) {
    return { valid: false, error: "Invalid campaign type selected." };
  }
  if (!description || description.length < 15) {
    return { valid: false, error: "Campaign description must be at least 15 characters." };
  }
  if (!instructions || instructions.length < 10) {
    return { valid: false, error: "Clear task instructions are required." };
  }
  if (!Number.isInteger(rewardPerTaskKes) || rewardPerTaskKes < settings.minRewardPerTaskKes) {
    return {
      valid: false,
      error: `Reward per task must be a whole KES integer of at least KES ${settings.minRewardPerTaskKes}.`,
    };
  }
  if (!Number.isInteger(maxTasks) || maxTasks < settings.minCampaignTasks) {
    return {
      valid: false,
      error: `Campaign must include at least ${settings.minCampaignTasks} tasks.`,
    };
  }

  const cost = calculateCampaignCost(
    rewardPerTaskKes,
    maxTasks,
    settings.platformFeePercent
  );

  const minWords = Math.max(0, Math.min(500, Math.trunc(Number(payload.minWords ?? 30))));
  const requireScreenshot = Boolean(payload.requireScreenshot);
  const requireReceipt = Boolean(payload.requireReceipt);

  const guidelines = instructions
    .split(/\r?\n/)
    .map((line) => sanitizeText(line, 250))
    .filter(Boolean);

  const startDate =
    typeof payload.startDate === "string" && payload.startDate
      ? payload.startDate
      : new Date().toISOString();
  const endDate =
    typeof payload.endDate === "string" && payload.endDate ? payload.endDate : undefined;

  return {
    valid: true,
    data: {
      title,
      campaignType,
      description,
      instructions,
      rewardPerTaskKes: cost.rewardPerTaskKes,
      maxTasks: cost.maxTasks,
      rewardsSubtotalKes: cost.rewardsSubtotalKes,
      platformFeeKes: cost.platformFeeKes,
      totalBudgetKes: cost.totalBudgetKes,
      minWords,
      requireScreenshot,
      requireReceipt,
      guidelines: guidelines.length > 0 ? guidelines : [instructions],
      startDate,
      endDate,
      city: sanitizeText(payload.city, 80) || "All Kenya",
      deviceType:
        (payload.deviceType as "all" | "android" | "ios" | "desktop") || "all",
    },
  };
}

/**
 * Validates proof upload file size and MIME type.
 */
export function validateProofFile(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  if (file.size <= 0) {
    return { valid: false, error: "Attached proof file is empty." };
  }
  if (file.size > DEFAULT_PLATFORM_SETTINGS.maxProofFileSizeBytes) {
    return {
      valid: false,
      error: "Proof file exceeds the 5MB maximum size limit.",
    };
  }
  if (!DEFAULT_PLATFORM_SETTINGS.allowedProofMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload JPEG, PNG, WEBP, or PDF.",
    };
  }
  return { valid: true };
}

/**
 * Deterministic SHA-256 style hex fingerprint for duplicate proof & text detection.
 * Works synchronously across browser and Node runtimes.
 */
export function computeDeterministicHash(input: string): string {
  // FNV-1a + Murmur-style 256-bit mixing for fast synchronous deterministic fingerprint
  const seeds = [
    0x811c9dc5, 0x01000193, 0x9e3779b9, 0x85ebca6b,
    0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xd3a2646c,
  ];
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    for (let s = 0; s < seeds.length; s++) {
      seeds[s] = Math.imul(seeds[s] ^ (ch + s * 31), 0x01000193) >>> 0;
      seeds[s] = ((seeds[s] << 13) | (seeds[s] >>> 19)) >>> 0;
    }
  }
  return seeds.map((n) => n.toString(16).padStart(8, "0")).join("");
}

/**
 * Checks all anti-fraud rules for user campaign submission:
 * 1. Campaign must be active and have remaining task capacity & escrow budget.
 * 2. User cannot self-review a business they own.
 * 3. Only one submission per user per campaign.
 * 4. Daily submission limit per user.
 * 5. Duplicate proof hash check across all submissions.
 */
export function checkSubmissionEligibility(params: {
  campaign: SponsoredCampaign;
  userProfileId: string;
  proofHash?: string;
  existingSubmissions: CampaignSubmission[];
  dailyLimit: number;
  nowIso?: string;
}): { eligible: boolean; error?: string; isFlagged?: boolean; flagReason?: string } {
  const {
    campaign,
    userProfileId,
    proofHash,
    existingSubmissions,
    dailyLimit,
    nowIso = new Date().toISOString(),
  } = params;

  if (campaign.status !== "active") {
    return {
      eligible: false,
      error: "This sponsored campaign is not currently active.",
    };
  }

  if (
    campaign.completedTasks >= campaign.maxTasks ||
    campaign.remainingBudgetKes < campaign.rewardPerTaskKes
  ) {
    return {
      eligible: false,
      error: "This campaign has reached its maximum task limit.",
    };
  }

  // Rule: No self-reviewing a business the user owns
  if (campaign.ownerProfileId === userProfileId) {
    return {
      eligible: false,
      error: "Self-review policy violation: You cannot submit a task for a business you own.",
    };
  }

  // Rule: One submission per user per campaign
  const alreadySubmitted = existingSubmissions.some(
    (s) => s.campaignId === campaign.id && s.userProfileId === userProfileId
  );
  if (alreadySubmitted) {
    return {
      eligible: false,
      error: "You have already submitted a response for this campaign (limit: 1 per campaign).",
    };
  }

  // Rule: Daily submission limit per user
  const todayPrefix = nowIso.slice(0, 10);
  const userTodayCount = existingSubmissions.filter(
    (s) =>
      s.userProfileId === userProfileId &&
      s.createdAt.slice(0, 10) === todayPrefix
  ).length;

  if (userTodayCount >= dailyLimit) {
    return {
      eligible: false,
      error: `Daily submission limit reached (${dailyLimit} sponsored tasks per day). Please try again tomorrow.`,
    };
  }

  // Rule: Duplicate-proof detection (hash of uploads)
  if (proofHash) {
    const duplicateProof = existingSubmissions.find(
      (s) => s.proofHash && s.proofHash === proofHash
    );
    if (duplicateProof) {
      return {
        eligible: false,
        error: "Duplicate proof detected: This screenshot or receipt has already been uploaded on Earnora.",
      };
    }
  }

  return { eligible: true };
}
