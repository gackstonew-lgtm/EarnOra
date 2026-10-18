"use client";

import React from "react";
import Link from "next/link";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#050912] border-t border-slate-800 text-slate-400 text-xs py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <EarnoraLogo size="md" showTagline={true} />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-2">
              EarnOra is Kenya&apos;s verified review and earn platform. We connect authentic consumer feedback with forward-thinking businesses and pay real M-Pesa bounties for honest opinions.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Registered Data Controller • Kenya Data Protection Act 2019</span>
            </div>
          </div>

          {/* Column 1: For Reviewers */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white tracking-tight">For Reviewers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register" className="hover:text-emerald-400 transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link href="/earn" className="hover:text-emerald-400 transition-colors">
                  Browse Active Bounties
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  How Earnings Work
                </a>
              </li>
              <li>
                <a href="#levels" className="hover:text-emerald-400 transition-colors">
                  Reputation Levels
                </a>
              </li>
              <li>
                <Link href="/activity" className="hover:text-emerald-400 transition-colors">
                  Leaderboard & Streaks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Businesses */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white tracking-tight">For Businesses</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/business" className="hover:text-emerald-400 transition-colors">
                  Business Portal
                </Link>
              </li>
              <li>
                <a href="#for-businesses" className="hover:text-emerald-400 transition-colors">
                  Launch a Campaign
                </a>
              </li>
              <li>
                <span className="text-slate-500">Sentiment Analytics</span>
              </li>
              <li>
                <span className="text-slate-500">M-Pesa Business Funding</span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Verification Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white tracking-tight">Legal & Trust</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy (Kenya DPA)
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  FAQ & Review Guidelines
                </a>
              </li>
              <li>
                <span className="text-slate-500">Anti-Fraud & Moderation</span>
              </li>
              <li>
                <span className="text-slate-500">Takedown Requests</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} EarnOra Technologies Limited. All rights reserved. Made with pride in Nairobi, Kenya.</p>
          <div className="flex items-center gap-5">
            <span>M-Pesa Daraja B2C Enabled</span>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
