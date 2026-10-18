"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui";
import { normalizePhoneNumber } from "@/lib/phone-utils";
import { generateOtp, verifyOtpCode } from "@/lib/auth-service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Multi-step: 1 = Phone Number, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Phone
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Step 2: OTP
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [activeCodeHint, setActiveCodeHint] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cooldown countdown
  useEffect(() => {
    if (step !== 2 || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-500" };
    return { score: 4, label: "Strong", color: "bg-[#16A34A]", text: "text-[#16A34A]" };
  };

  const strength = getPasswordStrength(newPassword);

  // Step 1: Submit Phone
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setPhoneError("");

    const validation = normalizePhoneNumber(phoneNumber, "+254");
    if (!validation.isValid) {
      setPhoneError("Please enter a valid Kenyan M-Pesa phone number.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const otp = generateOtp(validation.normalized, "reset_password");
      setActiveCodeHint(otp.code);
      setPhoneNumber(validation.normalized);
      setCooldown(60);
      setIsLoading(false);
      setStep(2);
    }, 600);
  };

  // Step 2: OTP Entry Handlers
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg("");

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
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    const res = verifyOtpCode(code);
    setIsLoading(false);

    if (res.success) {
      setErrorMsg("");
      setStep(3);
    } else {
      setErrorMsg(res.error || "Invalid or expired OTP code.");
    }
  };

  // Step 3: Set New Password
  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 800);
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? "Reset Password"
          : step === 2
          ? "Enter Reset Code"
          : step === 3
          ? "Create New Password"
          : "Password Reset Complete"
      }
      subtitle={
        step === 1
          ? "Enter your registered M-Pesa phone number to receive a verification code"
          : step === 2
          ? `Enter the 6-digit verification code sent to ${phoneNumber}`
          : step === 3
          ? "Choose a strong password for your EarnOra account"
          : "Your account password has been updated successfully"
      }
      activeTab="forgot"
      pitch="Account recovery made fast and secure with direct M-Pesa phone binding."
    >
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: PHONE NUMBER INPUT */}
      {step === 1 && (
        <form onSubmit={handlePhoneSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F1F3D]">
              M-Pesa Phone Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7A99]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678"
                className="w-full h-11 pl-10 pr-3.5 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#6B7A99] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
              />
            </div>
            {phoneError ? (
              <p className="text-xs text-red-500 font-medium">{phoneError}</p>
            ) : (
              <p className="text-[11px] text-[#6B7A99]">
                Enter the Safaricom M-Pesa phone number linked to your EarnOra account.
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Code
            </Button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-[#1E6FD9] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: 6-BOX OTP ENTRY */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {activeCodeHint && (
            <div className="p-3 rounded-[12px] bg-[#EAF3FF] border border-blue-200/80 text-xs text-[#0A3D91] flex items-center justify-between">
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

          <div>
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

          <div className="flex items-center justify-between text-xs text-[#6B7A99]">
            <span>Didn&apos;t receive code?</span>
            {cooldown > 0 ? (
              <span className="font-semibold text-[#0F1F3D]">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const newOtp = generateOtp(phoneNumber, "reset_password");
                  setActiveCodeHint(newOtp.code);
                  setCooldown(60);
                  setOtpDigits(["", "", "", "", "", ""]);
                }}
                className="font-bold text-[#1E6FD9] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify Code
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: NEW PASSWORD WITH STRENGTH METER */}
      {step === 3 && (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F1F3D]">New Password</label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7A99]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-11 pl-10 pr-10 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#6B7A99] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#6B7A99] hover:text-[#0F1F3D] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7A99]">Password strength:</span>
                  <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : "bg-slate-200"}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : "bg-slate-200"}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : "bg-slate-200"}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : "bg-slate-200"}`} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F1F3D]">Confirm Password</label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7A99]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-11 pl-10 pr-10 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#6B7A99] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS STATE */}
      {step === 4 && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F1F3D]">
            Password Updated!
          </h3>
          <p className="text-xs text-[#6B7A99] max-w-xs mx-auto">
            Your password has been reset successfully. You can now log in with your new credentials.
          </p>
          <div className="pt-4">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => router.push("/auth/login")}
            >
              Proceed to Sign In
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
