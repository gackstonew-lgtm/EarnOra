export type CountryCode = {
  country: string;
  code: string;
  flag: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
  example: string;
};

export type UserRole = "user" | "business" | "admin";

export interface UserProfile {
  id: string;
  username: string;
  phoneNumber: string;
  country: string;
  callingCode: string;
  role: UserRole;
  isPhoneVerified: boolean;
  avatarUrl?: string;
  referralCode: string;
  referredBy?: string;
  joinedAt: string;
  streakDays: number;
  lastCheckInDate?: string;
  totalEarned: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
}

export type EarningCategoryId =
  | "hotels_restaurants"
  | "apps_websites"
  | "local_services"
  | "telco_fintech"
  | "public_services"
  | "paid_surveys"
  | "product_testing"
  | "watch_answer"
  | "daily_checkin"
  | "refer_earn";

export interface EarningCardConfig {
  id: EarningCategoryId;
  title: string;
  maxRewardText: string;
  maxRewardKes: number;
  tag: string;
  description: string;
  iconName: string;
  cardTheme: {
    bgGradient: string;
    borderGlow: string;
    iconBg: string;
    iconColor: string;
    tagBg: string;
    tagText: string;
  };
  targetRoute: string;
}

export interface ReviewTask {
  id: string;
  categoryId: EarningCategoryId;
  title: string;
  entityName: string;
  logoUrl?: string;
  rewardKes: number;
  estimatedMinutes: number;
  isSponsored: boolean;
  categoryTag: string;
  deadline?: string;
  description: string;
  instructions: string[];
  requirements: {
    minWords: number;
    requirePhoto: boolean;
    photoAttestationRequired: boolean;
  };
  sampleAvailability?: string;
}

export type ModerationStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "approved"
  | "rejected"
  | "under_appeal";

export interface ReviewSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  photoUrl?: string;
  photoAttestation: boolean;
  status: ModerationStatus;
  rejectionReason?: string;
  rewardKes: number;
  submittedAt: string;
  reviewedAt?: string;
}

export type TransactionType =
  | "reward_earned"
  | "referral_bonus"
  | "streak_bonus"
  | "mpesa_withdrawal"
  | "withdrawal_refund";

export type TransactionStatus = "completed" | "pending" | "failed" | "reversed";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  receiptNumber?: string;
  notes?: string;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  approvedReviewsCount: number;
  totalEarnedKes: number;
  avatarLetter: string;
}
