"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Phone,
  Gift,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SUPPORTED_COUNTRIES, BRAND_TAGLINE } from "@/lib/constants";
import { normalizePhoneNumber, checkPayoutEligibility } from "@/lib/phone-utils";
import { resolveReferralCode, generateOtp } from "@/lib/auth-service";
import { useAuth } from "@/components/providers/AuthProvider";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";
import { EarnoraSymbol } from "@/components/brand/EarnoraSymbol";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  // Form State
  const [username, setUsername] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+254");
  const [phoneInput, setPhoneInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Referral Code Attribution
  const [referrerUsername, setReferrerUsername] = useState("Earnora");
  const [referralCodeParam, setReferralCodeParam] = useState("");

  // UI / Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Selected country object
  const activeCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) ||
    SUPPORTED_COUNTRIES[0];

  // Payout eligibility
  const payoutEligibility = checkPayoutEligibility(selectedCountryCode);

  // Handle URL referral param: e.g. /auth/register?ref=CODE
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCodeParam(refCode);
      const resolved = resolveReferralCode(refCode);
      setReferrerUsername(resolved.referrerUsername);
    } else {
      setReferrerUsername("Earnora");
    }
  }, [searchParams]);

  // Validate phone whenever input or country changes
  const handlePhoneChange = (val: string) => {
    setPhoneInput(val);
    if (!val) {
      setPhoneError("");
      return;
    }
    const result = normalizePhoneNumber(val, selectedCountryCode);
    if (!result.isValid && val.length > 4) {
      setPhoneError(result.error || "Invalid phone number format");
    } else {
      setPhoneError("");
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    if (phoneInput) {
      const result = normalizePhoneNumber(phoneInput, newCode);
      if (!result.isValid && phoneInput.length > 4) {
        setPhoneError(result.error || "");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim() || username.trim().length < 3) {
      setFormError("Username must be at least 3 characters.");
      return;
    }

    if (!phoneInput) {
      setFormError("M-Pesa phone number is required.");
      return;
    }

    const phoneValidation = normalizePhoneNumber(phoneInput, selectedCountryCode);
    if (!phoneValidation.isValid) {
      setFormError(phoneValidation.error || "Please enter a valid phone number.");
      return;
    }

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      setFormError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        username: username.trim(),
        country: activeCountry.country,
        callingCode: selectedCountryCode,
        phoneNumber: phoneValidation.normalized,
        password,
        referralCode: referralCodeParam,
      });

      if (!res.success) {
        setFormError(res.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Generate verification OTP
      generateOtp(phoneValidation.normalized, "registration");

      // Redirect to OTP verification screen
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneValidation.normalized)}`);
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Desktop Branding Left Panel */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 p-8 rounded-[22px] bg-gradient-to-br from-[#0F1E3D] via-[#0B1528] to-[#070C18] border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <EarnoraSymbol size={48} />
            <span className="font-extrabold text-2xl text-white">Earnora</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              {BRAND_TAGLINE}
            </span>
            <h2 className="text-2xl font-black text-white leading-snug">
              Turn your honest opinions into real M-Pesa earnings.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Join thousands of Kenyan reviewers reviewing local restaurants, digital apps, public services, and consumer products.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct Safaricom M-Pesa payouts (min KES 100)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No activation fees or hidden subscriptions</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transparent review moderation & streak bonuses</span>
            </div>
          </div>
        </div>

        {/* Mobile Branding Header + Registration Card */}
        <div className="lg:col-span-7">
          {/* Mobile Top Branding */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex justify-center mb-2">
              <EarnoraLogo size="md" showTagline={true} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create your account to start earning today
            </p>
          </div>

          <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Create Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Log In
                </Link>
              </p>
            </div>

            {formError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Baraka_Ke"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={selectedCountryCode}
                    onChange={handleCountryChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.country} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  M-Pesa Phone Number
                </label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-xl bg-slate-100 dark:bg-[#162752] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shrink-0">
                    {activeCountry.flag} {selectedCountryCode}
                  </span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder={activeCountry.placeholder}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border ${
                        phoneError
                          ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-slate-300 dark:border-slate-700"
                      } text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  We&apos;ll use it for account and payment updates
                </p>

                {phoneError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{phoneError}</p>
                )}

                {/* Country Payout Eligibility Notice */}
                <div
                  className={`mt-2 p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
                    payoutEligibility.isEligible
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>{payoutEligibility.provider}:</strong> {payoutEligibility.notes}
                  </span>
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Referral Attribution (Read-only Resolved) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Referred By
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
                    <Gift className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={referrerUsername}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#162752] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-emerald-300 font-semibold text-xs cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  1-level referral attribution strictly enforced.
                </p>
              </div>

              {/* Terms and Privacy Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    I agree to the{" "}
                    <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-slate-400">
          Loading registration...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

