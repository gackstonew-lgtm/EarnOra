"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, User, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, SocialSignInRow } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter both your phone number or username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        const nextParam = searchParams.get("redirectTo") || searchParams.get("next");
        // Validate internal redirect only
        const target = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
        router.push(target);
      } else {
        setErrorMsg(res.error || "Invalid credentials. Please check and try again.");
      }
    } catch {
      setErrorMsg("Unable to sign in right now. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your EarnOra account to continue earning"
      activeTab="login"
      pitch="Turn your honest reviews into real M-Pesa earnings. Track your balance and claim instant payouts."
    >
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#0F1F3D]">
            Phone Number or Username
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#5A6E8C]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 0712345678 or username"
              className="w-full h-11 pl-10 pr-3.5 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#0F1F3D]">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-[#1E6FD9] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#5A6E8C]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 pl-10 pr-10 text-sm rounded-[12px] bg-[#EEF3FF] text-[#0F1F3D] placeholder-[#5A6E8C] border border-blue-100/70 focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#5A6E8C] hover:text-[#0F1F3D] cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#1E6FD9] focus:ring-[#1E6FD9] border-blue-200 accent-[#1E6FD9]"
            />
            <span className="text-xs text-[#475569] font-medium">Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Social Sign In Row */}
      <SocialSignInRow label="Sign In with" />

      {/* Don't have an account link */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#475569]">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-[#1E6FD9] hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-[#6B7A99]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
