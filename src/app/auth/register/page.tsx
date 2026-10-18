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
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/lib/constants";
import { normalizePhoneNumber, checkPayoutEligibility } from "@/lib/phone-utils";
import { resolveReferralCode, generateOtp } from "@/lib/auth-service";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, SocialSignInRow } from "@/components/ui";

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
  const [hasReferral, setHasReferral] = useState(false);

  // UI / Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const activeCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) ||
    SUPPORTED_COUNTRIES[0];

  const payoutEligibility = checkPayoutEligibility(selectedCountryCode);

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCodeParam(refCode);
      setHasReferral(true);
      const resolved = resolveReferralCode(refCode);
      setReferrerUsername(resolved.referrerUsername);
    } else {
      setHasReferral(false);
      setReferrerUsername("Earnora");
    }
  }, [searchParams]);

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

      const requireVerification =
        process.env.NEXT_PUBLIC_REQUIRE_SIGNUP_VERIFICATION === "true";

      if (requireVerification) {
        // Generate verification OTP
        generateOtp(phoneValidation.normalized, "registration");

        // Redirect to OTP verification screen
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneValidation.normalized)}`);
      } else {
        // Automatically verify phone and redirect directly to dashboard
        router.push("/dashboard");
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EarnOra to turn your honest reviews into real M-Pesa earnings"
      activeTab="register"
      pitch="Turn your honest reviews into real M-Pesa earnings. Join our verified community today."
    >
      {formError && (
        <div className="mb-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#0F1F3D]">Username</label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7A99]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Baraka_Ke"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#6B7A99] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
            />
          </div>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#0F1F3D]">Country</label>
          <div className="relative">
            <select
              value={selectedCountryCode}
              onChange={handleCountryChange}
              className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all cursor-pointer"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.country} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* M-Pesa Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#0F1F3D]">M-Pesa Phone Number</label>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 h-11 rounded-[12px] bg-[#EAF3FF] border border-blue-100/80 text-[#0A3D91] text-xs font-bold shrink-0">
              {activeCountry.flag} {selectedCountryCode}
            </span>
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none text-[#6B7A99]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={activeCountry.placeholder}
                className={`w-full h-11 pl-9 pr-3 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#6B7A99] border ${
                  phoneError
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-blue-100/70"
                } focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all`}
              />
            </div>
          </div>
          {phoneError && (
            <p className="text-xs text-red-500 font-medium">{phoneError}</p>
          )}

          {/* Payout note */}
          <div
            className={`mt-1 p-2 rounded-[10px] text-xs flex items-center gap-2 ${
              payoutEligibility.isEligible
                ? "bg-emerald-50 text-[#16A34A] border border-emerald-200/60"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>{payoutEligibility.provider}:</strong> {payoutEligibility.notes}
            </span>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#0F1F3D]">Password</label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7A99]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full h-11 pl-10 pr-10 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#6B7A99] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#6B7A99] hover:text-[#0F1F3D] cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Referred By (When present or default) */}
        {hasReferral && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F1F3D]">Referred By</label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#16A34A]">
                <Gift className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly
                value={referrerUsername}
                className="w-full h-11 pl-10 pr-3 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0A3D91] font-semibold border border-blue-100/70 cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[11px] text-[#6B7A99]">
              Referral code validated.
            </p>
          </div>
        )}

        {/* Terms and Privacy Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#1E6FD9] focus:ring-[#1E6FD9] border-blue-200 accent-[#1E6FD9]"
            />
            <span className="text-xs text-[#6B7A99] leading-snug">
              I agree to the{" "}
              <Link href="/terms" className="text-[#1E6FD9] font-semibold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#1E6FD9] font-semibold hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign Up
          </Button>
        </div>
      </form>

      {/* Social Sign In Row */}
      <SocialSignInRow label="Sign Up with" />

      {/* Already have an account link */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#6B7A99]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-[#1E6FD9] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-[#6B7A99]">
          Loading registration...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
