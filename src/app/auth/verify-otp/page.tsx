"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { getActiveOtp, verifyOtpCode, generateOtp } from "@/lib/auth-service";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [activeCodeHint, setActiveCodeHint] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const p = searchParams.get("phone") || user?.phoneNumber || "+254712345678";
    setPhoneNumber(p);

    let active = getActiveOtp();
    if (!active) {
      active = generateOtp(p, "registration");
    }

    if (active) {
      setActiveCodeHint(active.code);
      const remainingSeconds = Math.max(0, Math.ceil((active.resendAvailableAt - Date.now()) / 1000));
      setCooldown(remainingSeconds);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg("");

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    if (pasted.length >= 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    const res = verifyOtpCode(fullCode);
    if (res.success) {
      setSuccessMsg("Phone verified successfully! Redirecting...");
      await refreshUser();
      setTimeout(() => {
        const nextUrl = searchParams.get("redirect") || "/dashboard";
        router.push(nextUrl);
      }, 1000);
    } else {
      setErrorMsg(res.error || "Invalid or expired code.");
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    const newOtp = generateOtp(phoneNumber, "registration");
    setActiveCodeHint(newOtp.code);
    setCooldown(60);
    setErrorMsg("");
    setSuccessMsg("A new 6-digit verification code has been dispatched.");
    setOtpDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <AuthLayout
      title="Verify Your Phone"
      subtitle={`Enter the 6-digit code sent to ${phoneNumber}`}
      activeTab="otp"
      pitch="Your security is our priority. Verified numbers prevent fraud and ensure safe M-Pesa payouts."
    >
      {/* Dev Mode Notification Banner */}
      {activeCodeHint && (
        <div className="mb-5 p-3 rounded-[12px] bg-[#EAF3FF] border border-blue-200/80 text-xs text-[#0A3D91] flex items-center justify-between">
          <span>
            Mock OTP Mode: Code is <strong className="font-mono text-sm text-[#1E6FD9]">{activeCodeHint}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setOtpDigits(activeCodeHint.split(""));
              inputRefs.current[5]?.focus();
            }}
            className="text-[11px] font-bold text-[#1E6FD9] hover:underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-[#16A34A]">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Input Boxes */}
        <div>
          <label className="block text-xs font-semibold text-[#0F1F3D] mb-3 text-center">
            Verification Code
          </label>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 sm:w-13 h-13 sm:h-14 text-center font-bold text-lg sm:text-xl rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] border ${
                  digit
                    ? "border-[#1E6FD9] bg-white ring-2 ring-[#1E6FD9]/20"
                    : "border-blue-100/70"
                } focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/25 transition-all`}
              />
            ))}
          </div>
        </div>

        {/* Resend Timer */}
        <div className="flex items-center justify-between text-xs text-[#6B7A99] pt-1">
          <span>Didn&apos;t get the code?</span>
          {cooldown > 0 ? (
            <span className="font-semibold text-[#0F1F3D]">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-bold text-[#1E6FD9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Code</span>
            </button>
          )}
        </div>

        {/* Submit Verification */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isVerifying}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Verify & Continue
          </Button>
        </div>
      </form>

      {/* Security badge */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-[#6B7A99]">
        <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
        <span>Secured with Daraja M-Pesa phone binding</span>
      </div>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-[#6B7A99]">
          Loading verification...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
