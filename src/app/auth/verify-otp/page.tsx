"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ArrowRight, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";
import { getActiveOtp, verifyOtpCode, generateOtp } from "@/lib/auth-service";
import { useAuth } from "@/components/providers/AuthProvider";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";

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

  // Cooldown countdown timer
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

    // Auto-focus next input
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

    // Server/Service OTP verification
    const res = verifyOtpCode(fullCode);
    if (res.success) {
      setSuccessMsg("Phone number verified successfully! Redirecting to your dashboard...");
      refreshUser();
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setErrorMsg(res.error || "Verification failed. Please check the code.");
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    const newRecord = generateOtp(phoneNumber, "registration");
    setActiveCodeHint(newRecord.code);
    setCooldown(60);
    setOtpDigits(["", "", "", "", "", ""]);
    setErrorMsg("");
    setSuccessMsg("A new verification code has been generated.");
    inputRefs.current[0]?.focus();
  };

  // Masked phone display: e.g. +254 712 *** 678
  const maskPhone = (phone: string) => {
    if (phone.length < 9) return phone;
    return `${phone.slice(0, 7)} ••• ${phone.slice(-3)}`;
  };

  return (
    <div className="py-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <EarnoraLogo size="md" showTagline={false} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Verify Phone Number
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          We sent a 6-digit M-Pesa verification code to{" "}
          <strong className="text-slate-900 dark:text-emerald-400">
            {maskPhone(phoneNumber)}
          </strong>
        </p>
      </div>

      <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
        {/* Sandbox Dev Code Display Helper */}
        {activeCodeHint && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Sandbox Test OTP: <strong>{activeCodeHint}</strong></span>
            </div>
            <button
              onClick={() => {
                const parts = activeCodeHint.split("");
                setOtpDigits(parts);
              }}
              className="text-[11px] underline font-bold"
            >
              Fill Code
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
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
                className="w-11 h-13 sm:w-12 sm:h-14 text-center font-bold text-lg rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otpDigits.join("").length !== 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify & Activate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Cooldown Controls */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Didn&apos;t receive code?
          </span>
          {cooldown > 0 ? (
            <span className="font-semibold text-slate-400">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/auth/register"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Change phone number
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-slate-400">
          Loading verification...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

