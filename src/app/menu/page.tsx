"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Building2,
  FileText,
  HelpCircle,
  LogOut,
  Moon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";

export default function MenuPage() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Menu & Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Platform settings, business workspace, and compliance.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-base flex items-center justify-center">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {user.username}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.phoneNumber}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  M-Pesa Verified
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/wallet"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#132347] text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Wallet
          </Link>
        </div>
      )}

      {/* Navigation Group 1: Workspaces */}
      <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-2 shadow-sm space-y-1">
        <Link
          href="/business"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#132347] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Business Campaign Portal
              </p>
              <p className="text-[10px] text-slate-400">
                Sponsor reviews, set bounties, and view feedback analytics
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/admin"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#132347] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Admin & Moderation Desk
              </p>
              <p className="text-[10px] text-slate-400">
                Review moderation, fraud detection, and payout auditing
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Navigation Group 2: Legal & Trust */}
      <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-2 shadow-sm space-y-1">
        <Link
          href="/terms"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#132347] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Terms of Service & Earning Rules
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/privacy"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#132347] transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Kenya Data Protection Act (2019) & Privacy
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Logout button */}
      {isAuthenticated && (
        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Earnora</span>
        </button>
      )}

      {/* Version & Brand Credit */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-semibold text-slate-400">
          Earnora v1.0.0 • Mobile-First PWA • Kenya
        </p>
      </div>
    </div>
  );
}
