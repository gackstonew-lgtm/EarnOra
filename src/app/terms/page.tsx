"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-500 hover:underline">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
          Earnora Terms of Service & Earning Rules
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Effective Date: October 2026 • Kenyan Law & Commercial Guidelines
        </p>
      </div>

      <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            1. Core Transparent Earning Model
          </h2>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>No Registration Fees:</strong> Earnora is 100% free to join. We will never ask you to pay any fee to unlock earning tasks or activate your account.</li>
            <li><strong>No Paid Memberships:</strong> Payouts do not require tier upgrades or paid memberships.</li>
            <li><strong>Authenticity Over Rating:</strong> Rewards are granted for genuine, constructive, first-hand experiences—not for submitting 5-star praise. Businesses cannot purchase favorable reviews.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            2. Review Quality & Anti-Fraud Standards
          </h2>
          <p>
            Submissions are subjected to automated near-duplicate detection, AI text screening, and manual human moderation. Plagiarized reviews or bot submissions result in task forfeiture and account review.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            3. M-Pesa Withdrawals & Payout Minimums
          </h2>
          <p>
            The minimum withdrawal threshold is <strong>KES 100.00</strong>. Payouts are disbursed to the verified M-Pesa line via Safaricom Daraja B2C. Standard telecom processing speeds apply.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            4. Referral Policy
          </h2>
          <p>
            Earnora enforces a transparent <strong>one-level referral structure</strong>. You earn a fixed bounty of KES 150 when a directly invited reviewer has their first review verified and approved. Multi-level marketing schemes or cascading commissions are strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
