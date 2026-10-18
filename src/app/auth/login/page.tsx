"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Lock, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";
import { EarnoraSymbol } from "@/components/brand/EarnoraSymbol";
import { BRAND_TAGLINE } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter both your username or phone number and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        router.push("/");
      } else {
        // Generic authentication errors to avoid exposing whether an account exists
        setErrorMsg(res.error || "Invalid credentials. Please check and try again.");
      }
    } catch {
      setErrorMsg("Unable to sign in right now. Please check your network and try again.");
    } finally {
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
              Welcome back to your review earnings.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track your approved reviews, claim your daily streak multipliers, and request instant M-Pesa payouts.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Available balance ready for instant withdrawal</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-track reviews: Hotels, Apps, Surveys & Local Gems</span>
            </div>
          </div>
        </div>

        {/* Mobile Branding Header + Login Card */}
        <div className="lg:col-span-7">
          <div className="lg:hidden text-center mb-6">
            <div className="flex justify-center mb-2">
              <EarnoraLogo size="md" showTagline={true} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to manage your reviews and earnings
            </p>
          </div>

          <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                New to Earnora?{" "}
                <Link
                  href="/auth/register"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. Baraka_Ke or 0712345678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted session & zero plain-text passwords</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
