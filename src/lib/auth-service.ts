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
let memoryUser: UserProfile | null = null;
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
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  memoryUser = user;
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      // Set earnora_session, earnora_role, and earnora_user_ctx cookies for Next.js middleware & server API routes
      document.cookie = "earnora_session=1; path=/; max-age=2592000; SameSite=Lax";
      document.cookie = `earnora_role=${encodeURIComponent(user.role || "user")}; path=/; max-age=2592000; SameSite=Lax`;
      const safeSnapshot = {
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        role: user.role || "user",
        isPhoneVerified: user.isPhoneVerified,
        streakDays: user.streakDays,
        availableBalance: user.availableBalance,
        pendingBalance: user.pendingBalance,
        totalEarned: user.totalEarned,
        totalWithdrawn: user.totalWithdrawn,
      };
      document.cookie = `earnora_user_ctx=${encodeURIComponent(JSON.stringify(safeSnapshot))}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
      // Remove cookies on logout
      document.cookie = "earnora_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = "earnora_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = "earnora_user_ctx=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }
}

export function getServerSessionUserFromCookie(rawCookieValue?: string): UserProfile | null {
  if (rawCookieValue) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawCookieValue)) as Partial<UserProfile>;
      if (parsed && typeof parsed.id === "string") {
        return {
          id: parsed.id,
          username: parsed.username || "EarnOra Member",
          phoneNumber: parsed.phoneNumber || "+254700000000",
          country: parsed.country || "Kenya",
          callingCode: parsed.callingCode || "+254",
          role: parsed.role || "user",
          isPhoneVerified: Boolean(parsed.isPhoneVerified),
          referralCode: parsed.referralCode || "EARN-KE",
          joinedAt: parsed.joinedAt || new Date().toISOString(),
          streakDays: Number(parsed.streakDays ?? 1),
          totalEarned: Number(parsed.totalEarned ?? 0),
          availableBalance: Number(parsed.availableBalance ?? 0),
          pendingBalance: Number(parsed.pendingBalance ?? 0),
          totalWithdrawn: Number(parsed.totalWithdrawn ?? 0),
        };
      }
    } catch {
      // ignore malformed cookie
    }
  }
  return memoryUser;
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
