"use client";

import React from "react";
import Link from "next/link";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";
import { ShieldCheck } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-blue-100 text-[#6B7A99] text-xs py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <EarnoraLogo size="md" showTagline={true} />
            <p className="text-xs text-[#6B7A99] max-w-sm leading-relaxed mt-2">
              EarnOra is Kenya&apos;s verified review and earn platform. We connect authentic consumer feedback with forward-thinking businesses and pay real M-Pesa bounties for honest opinions.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-[#16A34A] font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Registered Data Controller • Kenya Data Protection Act 2019</span>
            </div>
          </div>

          {/* Column 1: For Reviewers */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#0F1F3D] tracking-tight">For Reviewers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register" className="hover:text-[#1E6FD9] transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/earn" className="hover:text-[#1E6FD9] transition-colors">
                  Browse Active Bounties
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#1E6FD9] transition-colors">
                  How Earnings Work
                </a>
              </li>
              <li>
                <a href="#levels" className="hover:text-[#1E6FD9] transition-colors">
                  Reputation Levels
                </a>
              </li>
              <li>
                <Link href="/activity" className="hover:text-[#1E6FD9] transition-colors">
                  Leaderboard & Streaks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Businesses */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#0F1F3D] tracking-tight">For Businesses</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/business" className="hover:text-[#1E6FD9] transition-colors">
                  Business Portal
                </Link>
              </li>
              <li>
                <a href="#for-businesses" className="hover:text-[#1E6FD9] transition-colors">
                  Launch a Campaign
                </a>
              </li>
              <li>
                <span className="text-slate-400">Sentiment Analytics</span>
              </li>
              <li>
                <span className="text-slate-400">M-Pesa Business Funding</span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#1E6FD9] transition-colors">
                  Admin Verification Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#0F1F3D] tracking-tight">Legal & Trust</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-[#1E6FD9] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#1E6FD9] transition-colors">
                  Privacy Policy (Kenya DPA)
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#1E6FD9] transition-colors">
                  FAQ & Anti-Fraud Rules
                </a>
              </li>
              <li>
                <span className="text-slate-400">Moderation Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[#6B7A99]">
          <p>© {new Date().getFullYear()} EarnOra Technologies Limited. All rights reserved. Nairobi, Kenya.</p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/terms" className="hover:text-[#1E6FD9]">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#1E6FD9]">Privacy</Link>
            <span>•</span>
            <a href="mailto:support@earnora.co.ke" className="hover:text-[#1E6FD9]">support@earnora.co.ke</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
