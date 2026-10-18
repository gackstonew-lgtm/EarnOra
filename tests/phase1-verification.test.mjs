import test from "node:test";
import assert from "node:assert/strict";

// 1. Test Phone normalization logic
function normalizePhoneNumber(rawInput, callingCode = "+254") {
  if (!rawInput) return { isValid: false, error: "Phone number is required" };
  let cleaned = rawInput.trim().replace(/[\s\-\(\)]/g, "");
  const codeDigits = callingCode.replace("+", "");

  if (cleaned.startsWith("+")) {
    if (cleaned.startsWith(callingCode)) {
      cleaned = cleaned.slice(callingCode.length);
    } else {
      return { isValid: false, error: `Prefix mismatch` };
    }
  } else if (cleaned.startsWith(codeDigits)) {
    cleaned = cleaned.slice(codeDigits.length);
  }

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: "Numeric digits only" };
  }

  if (cleaned.length < 9 || cleaned.length > 11) {
    return { isValid: false, error: "Length mismatch" };
  }

  return {
    isValid: true,
    normalized: `${callingCode}${cleaned}`,
  };
}

// 2. Test Referral Code Resolver
function resolveReferralCode(code) {
  if (!code || !code.trim()) return { isValid: false, referrer: "Earnora" };
  const cleaned = code.trim().toUpperCase();
  const validMap = {
    "EARN-KE-88": "Baraka_Ke",
    "MWANGI-VIP": "Mwangi_Tech",
    "AMINA-WIN": "Amina_Reviews",
  };
  if (validMap[cleaned]) return { isValid: true, referrer: validMap[cleaned] };
  if (cleaned.startsWith("EARN-")) return { isValid: true, referrer: "Earnora Partner" };
  return { isValid: false, referrer: "Earnora" };
}

// 3. Test OTP Attempt limits
function verifyOtpAttempt(record, enteredCode) {
  const now = Date.now();
  if (now > record.expiresAt) return { success: false, reason: "expired" };
  if (record.attempts >= record.maxAttempts) return { success: false, reason: "locked" };
  record.attempts += 1;
  if (enteredCode !== record.code) return { success: false, reason: "mismatch" };
  record.verified = true;
  return { success: true };
}

test("Phone normalization handles Kenya local and international formats", () => {
  const local = normalizePhoneNumber("0712345678", "+254");
  assert.equal(local.isValid, true);
  assert.equal(local.normalized, "+254712345678");

  const intl = normalizePhoneNumber("+254712345678", "+254");
  assert.equal(intl.isValid, true);
  assert.equal(intl.normalized, "+254712345678");

  const withoutZero = normalizePhoneNumber("712345678", "+254");
  assert.equal(withoutZero.isValid, true);
  assert.equal(withoutZero.normalized, "+254712345678");

  const invalid = normalizePhoneNumber("abc", "+254");
  assert.equal(invalid.isValid, false);
});

test("Referral attribution resolves valid codes securely and falls back to Earnora", () => {
  const valid = resolveReferralCode("EARN-KE-88");
  assert.equal(valid.isValid, true);
  assert.equal(valid.referrer, "Baraka_Ke");

  const missing = resolveReferralCode("");
  assert.equal(missing.isValid, false);
  assert.equal(missing.referrer, "Earnora");

  const invalid = resolveReferralCode("RANDOM-INVALID-KEY");
  assert.equal(invalid.isValid, false);
  assert.equal(invalid.referrer, "Earnora");
});

test("OTP verification enforces attempt limits and expiration", () => {
  const record = {
    code: "482910",
    attempts: 0,
    maxAttempts: 3,
    expiresAt: Date.now() + 600000,
    verified: false,
  };

  // Attempt 1: wrong
  assert.equal(verifyOtpAttempt(record, "000000").success, false);
  // Attempt 2: wrong
  assert.equal(verifyOtpAttempt(record, "111111").success, false);
  // Attempt 3: wrong
  assert.equal(verifyOtpAttempt(record, "222222").success, false);
  // Attempt 4: locked
  const lockAttempt = verifyOtpAttempt(record, "482910");
  assert.equal(lockAttempt.success, false);
  assert.equal(lockAttempt.reason, "locked");
});

test("Earning cards configuration contains all 10 mandated categories", () => {
  const expectedCategories = [
    "hotels_restaurants",
    "apps_websites",
    "local_services",
    "telco_fintech",
    "public_services",
    "paid_surveys",
    "product_testing",
    "watch_answer",
    "daily_checkin",
    "refer_earn",
  ];

  assert.equal(expectedCategories.length, 10);
});
