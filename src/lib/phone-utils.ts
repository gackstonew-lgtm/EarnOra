import { SUPPORTED_COUNTRIES } from "./constants";
import { CountryCode } from "./types";

/**
 * Normalizes user-entered local phone numbers into E.164 international format.
 * Strips leading 0s, non-digits, and removes redundant country code if typed by user.
 */
export function normalizePhoneNumber(
  rawInput: string,
  callingCode: string = "+254"
): { isValid: boolean; normalized: string; display: string; error?: string } {
  if (!rawInput) {
    return { isValid: false, normalized: "", display: "", error: "Phone number is required" };
  }

  // Remove spaces, hyphens, parentheses
  let cleaned = rawInput.trim().replace(/[\s\-\(\)]/g, "");

  // If user included +, check if it matches calling code
  const codeDigits = callingCode.replace("+", "");
  if (cleaned.startsWith("+")) {
    if (cleaned.startsWith(callingCode)) {
      cleaned = cleaned.slice(callingCode.length);
    } else {
      return {
        isValid: false,
        normalized: "",
        display: "",
        error: `Number prefix does not match selected country code (${callingCode})`,
      };
    }
  } else if (cleaned.startsWith(codeDigits)) {
    cleaned = cleaned.slice(codeDigits.length);
  }

  // Strip leading 0
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Ensure digits only
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: "",
      display: "",
      error: "Phone number must contain only numeric digits",
    };
  }

  // Validate length by country
  const countryConfig = SUPPORTED_COUNTRIES.find((c) => c.code === callingCode);
  const minLen = countryConfig?.minLength || 9;
  const maxLen = countryConfig?.maxLength || 10;

  if (cleaned.length < minLen || cleaned.length > maxLen) {
    return {
      isValid: false,
      normalized: "",
      display: "",
      error: `Expected ${minLen} to ${maxLen} digits for ${countryConfig?.country || "this country"}`,
    };
  }

  const normalized = `${callingCode}${cleaned}`;

  // Formatted display: e.g. +254 712 345 678
  const formatted = `${callingCode} ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;

  return {
    isValid: true,
    normalized,
    display: formatted.trim(),
  };
}

/**
 * Checks M-Pesa payout eligibility.
 * Currently, direct Safaricom Daraja B2C payouts are live for Kenyan (+254) numbers.
 * Other countries have scheduled roadmap availability.
 */
export function checkPayoutEligibility(callingCode: string): {
  isEligible: boolean;
  provider: string;
  notes: string;
} {
  if (callingCode === "+254") {
    return {
      isEligible: true,
      provider: "Safaricom M-Pesa",
      notes: "Instant automated B2C payout eligible.",
    };
  }

  const names: Record<string, string> = {
    "+256": "MTN / Airtel Uganda",
    "+255": "Vodacom M-Pesa / Tigo Tanzania",
    "+250": "MTN MoMo Rwanda",
    "+233": "MTN / Vodafone Ghana",
    "+234": "Paystack / Flutterwave Nigeria",
    "+27": "Ozow / Capitec South Africa",
  };

  return {
    isEligible: false,
    provider: names[callingCode] || "Regional Mobile Money",
    notes: "Coming soon in Phase 2 expansion. Wallet balances will accumulate securely.",
  };
}
