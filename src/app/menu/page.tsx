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
  ChevronRight,
  Wallet,
  Settings,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isAdsEnabled } from "@/lib/ads/config";
import { UserRole } from "@/lib/types";

export default function MenuPage() {
  const { user, logout, isAuthenticated, updateProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
          Menu & Account
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          Platform settings, business workspace, and compliance.
        </p>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[var(--brand-blue)] text-white font-extrabold text-base flex items-center justify-center shadow-xs">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[var(--text-primary)] font-display">
                {user.username}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {user.phoneNumber}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                <span className="text-[10px] font-bold text-[var(--accent-green)] uppercase">
                  M-Pesa Verified
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/wallet"
            className="px-3.5 py-2 rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] text-xs font-bold text-[var(--text-primary)] transition-colors"
          >
            Wallet
          </Link>
        </div>
      )}

      {/* Navigation Group 1: Workspaces */}
      <div className="rounded-[20px] bg-white border border-blue-100/70 p-2 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-1">
        <Link
          href="/wallet"
          className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F1F3D]">
                M-Pesa Wallet & Payouts
              </p>
              <p className="text-[11px] text-[#6B7A99]">
                Instant B2C withdrawals from KES 100
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </Link>

        {isAdsEnabled() && (
          <Link
            href="/advertiser"
            className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F1F3D]">
                  Advertiser Portal & Campaign Wallet
                </p>
                <p className="text-[11px] text-[#6B7A99]">
                  Fund KES escrow wallet, launch sponsored tasks, and download invoices
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
          </Link>
        )}

        <Link
          href="/business"
          className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#0A3D91] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F1F3D]">
                Business Campaign Portal
              </p>
              <p className="text-[11px] text-[#6B7A99]">
                Sponsor reviews, set bounties, and view feedback analytics
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </Link>

        <Link
          href="/admin"
          className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-sky-50 text-sky-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F1F3D]">
                Admin Operations Desk
              </p>
              <p className="text-[11px] text-[#6B7A99]">
                Quality moderation, NLP check, and ledger verification
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </Link>

        <Link
          href="/settings"
          className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F1F3D]">
                Settings & Preferences
              </p>
              <p className="text-[11px] text-[#6B7A99]">
                Appearance, data saver mode, payout number, and notifications
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </Link>
      </div>

      {/* Navigation Group 2: Compliance & Legal */}
      <div className="rounded-[20px] bg-white border border-blue-100/70 p-2 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-1">
        <Link
          href="/terms"
          className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#6B7A99] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#0F1F3D]">
              Terms of Service & Rules
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </Link>

        <Link
          href="/privacy"
          className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#6B7A99] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#0F1F3D]">
              Privacy Policy (Kenya DPA 2019)
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </Link>

        {isAdsEnabled() && (
          <>
            <Link
              href="/for-businesses"
              className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#0F1F3D]">
                  For Businesses (Sponsor Tasks)
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
            </Link>

            <Link
              href="/advertiser-terms"
              className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#6B7A99] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#0F1F3D]">
                  Advertiser Terms of Service
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
            </Link>

            <Link
              href="/ad-review-policy"
              className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#16A34A] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#0F1F3D]">
                  Sponsored Ad & Honest Review Policy
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-between p-3.5 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-[#0F1F3D]">
                  Contact & Support Desk
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
            </Link>
          </>
        )}
      </div>

      {/* Sandbox Role Switcher for Testing Protected Portals */}
      {isAdsEnabled() && user && (
        <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[var(--text-primary)] block">
              Active Session Role: <span className="uppercase text-[var(--brand-blue)]">{user.role}</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Sandbox role selector for testing middleware access on /advertiser and /admin
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {(["user", "advertiser", "admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateProfile({ role: r })}
                className={`px-3 py-1.5 rounded-[10px] font-bold uppercase text-[11px] cursor-pointer transition-colors ${
                  user.role === r
                    ? "bg-[var(--brand-blue)] text-white"
                    : "bg-[var(--bg-card-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sign Out Action */}
      {isAuthenticated && (
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-[14px] bg-white border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of EarnOra</span>
        </button>
      )}
    </div>
  );
}
