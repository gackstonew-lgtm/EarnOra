"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold text-[#1E6FD9] hover:underline">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-black text-[#0F1F3D] tracking-tight mt-2">
          EarnOra Terms of Service & Earning Rules
        </h1>
        <p className="text-xs text-[#6B7A99] mt-1">
          Effective Date: October 2026 • Kenyan Law & Commercial Guidelines
        </p>
      </div>

      <div className="rounded-[20px] bg-white border border-blue-100/70 p-6 sm:p-8 space-y-6 text-xs text-[#6B7A99] leading-relaxed shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D]">
            1. Core Transparent Earning Model
          </h2>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>No Registration Fees:</strong> EarnOra is 100% free to join. We will never ask you to pay any fee to unlock earning tasks or activate your account.</li>
            <li><strong>No Paid Memberships:</strong> Payouts do not require tier upgrades or paid memberships.</li>
            <li><strong>Authenticity Over Rating:</strong> Rewards are granted for genuine, constructive, first-hand experiences—not for submitting 5-star praise. Businesses cannot purchase favorable reviews.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D]">
            2. Review Quality & Anti-Fraud Standards
          </h2>
          <p>
            Submissions are subjected to automated near-duplicate detection, AI text screening, and manual human moderation. Plagiarized reviews or bot submissions result in task forfeiture and account review.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D]">
            3. M-Pesa Withdrawals & Payout Minimums
          </h2>
          <p>
            The minimum withdrawal threshold is <strong>KES 100.00</strong>. Payouts are disbursed to the verified M-Pesa line via Safaricom Daraja B2C. Standard telecom processing speeds apply.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D]">
            4. Referral Policy
          </h2>
          <p>
            EarnOra enforces a transparent <strong>one-level referral structure</strong>. You earn a fixed bounty of KES 150 when a directly invited reviewer has their first review verified and approved. Multi-level marketing schemes or cascading commissions are strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
