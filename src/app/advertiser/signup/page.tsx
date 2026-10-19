"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui";
import { SUPPORTED_COUNTRIES } from "@/lib/constants";
import { normalizePhoneNumber } from "@/lib/phone-utils";
import { setStoredUser } from "@/lib/auth-service";
import { useAuth } from "@/components/providers/AuthProvider";
import { registerAdvertiserAccount } from "@/lib/ads/store";
import { validateAdvertiserSignup } from "@/lib/ads/validation";
import { BusinessType } from "@/lib/ads/types";
import { UserProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "restaurant_hospitality", label: "Restaurant, Café & Hospitality" },
  { value: "app_software", label: "Mobile App, Website & SaaS" },
  { value: "telco_fintech", label: "Telco, Banking & Fintech" },
  { value: "consumer_product", label: "Consumer Product & Retail Brand" },
  { value: "market_research", label: "Market Research & Survey Agency" },
  { value: "local_service", label: "Local Service & SME" },
];

export default function AdvertiserSignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+254");
  const [phoneInput, setPhoneInput] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("restaurant_hospitality");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) ||
    SUPPORTED_COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const phoneValidation = normalizePhoneNumber(phoneInput, selectedCountryCode);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      setFormError(phoneValidation.error || "Please enter a valid business phone number.");
      return;
    }

    if (!agreeTerms) {
      setFormError("Please agree to the Advertiser Terms and Ad & Review Policy.");
      return;
    }

    const validation = validateAdvertiserSignup({
      businessName,
      contactPerson,
      phone: phoneValidation.normalized,
      email,
      businessType,
      website: website.trim() || undefined,
      password,
    });

    if (!validation.valid || !validation.data) {
      setFormError(validation.error || "Please check your registration details.");
      return;
    }

    setIsLoading(true);

    try {
      const d = validation.data;
      const profileId = `usr_adv_${Date.now()}`;

      // Attempt Supabase auth signup if live Supabase is configured
      try {
        const isSupabaseConfigured =
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

        if (isSupabaseConfigured) {
          await supabase.auth.signUp({
            email: d.email,
            password: d.password,
            options: {
              data: {
                role: "advertiser",
                business_name: d.businessName,
                contact_person: d.contactPerson,
                phone: d.phone,
              },
            },
          });
        }
      } catch {
        // Proceed with local/sandbox session
      }

      const newUserProfile: UserProfile = {
        id: profileId,
        username: d.businessName.replace(/\s+/g, "_").slice(0, 24),
        phoneNumber: d.phone,
        country: activeCountry.country,
        callingCode: selectedCountryCode,
        role: "advertiser",
        isPhoneVerified: true,
        referralCode: `BIZ-${Math.floor(1000 + Math.random() * 9000)}`,
        joinedAt: new Date().toISOString(),
        streakDays: 1,
        totalEarned: 0,
        availableBalance: 0,
        pendingBalance: 0,
        totalWithdrawn: 0,
      };

      // Save user profile & role cookie ("advertiser")
      setStoredUser(newUserProfile);
      refreshUser();

      // Create advertiser profile & KES wallet
      registerAdvertiserAccount({
        profileId,
        businessName: d.businessName,
        contactPerson: d.contactPerson,
        phone: d.phone,
        email: d.email,
        businessType: d.businessType,
        website: d.website,
      });

      router.push("/advertiser");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed.");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Advertiser Registration"
      subtitle="Create a verified business account to launch sponsored review, app testing, and survey campaigns."
      activeTab="register"
      pitch="Collect honest, first-hand customer feedback and product insights from verified Kenyan reviewers."
    >
      {formError && (
        <div className="mb-4 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Business Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#0F1F3D]">Business / Brand Name</label>
          <div className="relative flex items-center">
            <Building2 className="w-4 h-4 text-[#5A6E8C] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Savannah Roast & Bistro Ltd"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Contact Person & Business Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F1F3D]">Contact Person</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-[#5A6E8C] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Wanjiru Kamau"
                className="w-full h-11 pl-10 pr-3 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F1F3D]">Business Category</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              className="w-full h-11 px-3 text-xs sm:text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] font-medium border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all cursor-pointer"
            >
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#0F1F3D]">Business Phone (M-Pesa / Contact)</label>
          <div className="flex gap-2">
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="px-2.5 h-11 rounded-[12px] bg-[#EAF3FF] border border-blue-100/80 text-[#0A3D91] text-xs font-bold shrink-0 cursor-pointer"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1 flex items-center">
              <Phone className="w-4 h-4 text-[#5A6E8C] absolute left-3 pointer-events-none" />
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={activeCountry.placeholder}
                className="w-full h-11 pl-9 pr-3 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] font-medium border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Email & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F1F3D]">Work Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#5A6E8C] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.co.ke"
                className="w-full h-11 pl-10 pr-3 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0F1F3D]">Website (Optional)</label>
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-[#5A6E8C] absolute left-3.5 pointer-events-none" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.co.ke"
                className="w-full h-11 pl-10 pr-3 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#0F1F3D]">Account Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-[#5A6E8C] absolute left-3.5 pointer-events-none" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all font-medium"
            />
          </div>
        </div>

        {/* Honesty Policy Notice */}
        <div className="p-2.5 rounded-[10px] bg-emerald-50 border border-emerald-200/80 text-[11px] text-[#15803D] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Authentic Feedback Policy:</strong> Sponsored campaigns pay for genuine first-hand testing and honest reviews. Rating manipulation or fake reviews are strictly prohibited.
          </span>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[#1E6FD9] accent-[#1E6FD9]"
          />
          <span className="text-xs text-[#475569] leading-snug">
            I agree to the{" "}
            <Link href="/advertiser-terms" className="text-[#1E6FD9] font-bold hover:underline">
              Advertiser Terms
            </Link>{" "}
            and{" "}
            <Link href="/ad-review-policy" className="text-[#1E6FD9] font-bold hover:underline">
              Ad & Review Policy
            </Link>
            .
          </span>
        </label>

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Advertiser Account
          </Button>
        </div>
      </form>

      <div className="text-center pt-4 space-y-1">
        <p className="text-xs text-[#475569]">
          Already have an account?{" "}
          <Link href="/auth/login?redirectTo=/advertiser" className="font-bold text-[#1E6FD9] hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-xs text-[#6B7A99]">
          Want to earn as a reviewer instead?{" "}
          <Link href="/auth/register" className="font-semibold text-[#1E6FD9] hover:underline">
            Reviewer Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
