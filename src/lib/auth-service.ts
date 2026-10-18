import { UserProfile } from "./types";
import { INITIAL_USER } from "./mock-data";

export interface OtpRecord {
  phoneNumber: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  resendAvailableAt: number;
  verified: boolean;
  purpose: "registration" | "login" | "reset_password" | "withdrawal";
}

const STORAGE_KEY_USER = "earnora_current_user";
const STORAGE_KEY_OTP = "earnora_active_otp";
const STORAGE_KEY_USERS_DB = "earnora_registered_users";

// Fallback in-memory storage for SSR
let memoryUser: UserProfile | null = INITIAL_USER;
let memoryOtp: OtpRecord | null = null;
const memoryUsersDb: Map<string, { profile: UserProfile; passwordHash: string }> = new Map([
  [
    INITIAL_USER.username.toLowerCase(),
    {
      profile: INITIAL_USER,
      passwordHash: "demo_hash_secured",
    },
  ],
  [
    INITIAL_USER.phoneNumber,
    {
      profile: INITIAL_USER,
      passwordHash: "demo_hash_secured",
    },
  ],
]);

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") {
    return memoryUser;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      // Seed with default demo user if empty
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch (err) {
    return memoryUser;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  memoryUser = user;
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }
}

export function updateStoredUser(updates: Partial<UserProfile>): UserProfile | null {
  const current = getStoredUser();
  if (!current) return null;
  const updated: UserProfile = { ...current, ...updates };
  setStoredUser(updated);
  return updated;
}

/**
 * Generate a 6-digit OTP with strict attempt limits, 10-minute expiry, and 60-second cooldown.
 */
export function generateOtp(
  phoneNumber: string,
  purpose: OtpRecord["purpose"] = "registration"
): OtpRecord {
  const now = Date.now();
  // In development/test mode, use standard predictable code or random
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const record: OtpRecord = {
    phoneNumber,
    code,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    maxAttempts: 5,
    resendAvailableAt: now + 60 * 1000, // 60s cooldown
    verified: false,
    purpose,
  };

  memoryOtp = record;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_OTP, JSON.stringify(record));
  }
  return record;
}

export function getActiveOtp(): OtpRecord | null {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OTP);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return memoryOtp;
}

export function verifyOtpCode(
  enteredCode: string
): { success: boolean; error?: string; remainingAttempts?: number } {
  const activeOtp = getActiveOtp();

  if (!activeOtp) {
    return { success: false, error: "No active verification code found. Please request a new one." };
  }

  const now = Date.now();
  if (now > activeOtp.expiresAt) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  if (activeOtp.attempts >= activeOtp.maxAttempts) {
    return {
      success: false,
      error: "Too many failed attempts. Code locked for security. Please request a new code.",
    };
  }

  activeOtp.attempts += 1;

  if (enteredCode.trim() !== activeOtp.code) {
    const remaining = activeOtp.maxAttempts - activeOtp.attempts;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_OTP, JSON.stringify(activeOtp));
    }
    return {
      success: false,
      error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      remainingAttempts: remaining,
    };
  }

  // Verified successfully
  activeOtp.verified = true;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_OTP, JSON.stringify(activeOtp));
  }

  // If there is an active user, mark phone verified
  const user = getStoredUser();
  if (user) {
    updateStoredUser({ isPhoneVerified: true });
  }

  return { success: true };
}

/**
 * Validates a referral code against known users.
 * Returns the resolved username or "Earnora" if not found / invalid.
 */
export function resolveReferralCode(code?: string): {
  isValid: boolean;
  referrerUsername: string;
} {
  if (!code || !code.trim()) {
    return { isValid: false, referrerUsername: "Earnora" };
  }

  const cleaned = code.trim().toUpperCase();

  // Demo valid codes
  const validMap: Record<string, string> = {
    "EARN-KE-88": "Baraka_Ke",
    "MWANGI-VIP": "Mwangi_Tech",
    "AMINA-WIN": "Amina_Reviews",
    "OTIENO-TOP": "Otieno_Tester",
  };

  if (validMap[cleaned]) {
    return { isValid: true, referrerUsername: validMap[cleaned] };
  }

  // Any custom referral code format (e.g. EARN-XXXX) can resolve to demo inviter
  if (cleaned.startsWith("EARN-")) {
    return { isValid: true, referrerUsername: "Earnora Partner" };
  }

  return { isValid: false, referrerUsername: "Earnora" };
}
