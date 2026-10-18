"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs font-semibold text-[var(--brand-blue)] hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-black text-[#0F1F3D] tracking-tight mt-2">
          Kenya Data Protection Act Compliance & Privacy Policy
        </h1>
        <p className="text-xs text-[#6B7A99] mt-1">
          Compliant with Kenya Data Protection Act, 2019 (ODPC)
        </p>
      </div>

      <div className="rounded-[20px] bg-white border border-blue-100/70 p-6 sm:p-8 space-y-6 text-xs text-[#6B7A99] leading-relaxed shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>1. Data Controller & Principles</span>
          </h2>
          <p>
            EarnOra operates in strict accordance with the principles set out in Section 25 of the Kenya Data Protection Act: lawful processing, data minimization, accuracy, purpose limitation, storage limitation, and robust security safeguards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1E6FD9]" />
            <span>2. Data Minimization & Phone Privacy</span>
          </h2>
          <p>
            We collect your phone number exclusively for authentication, OTP verification, and M-Pesa automated payout execution. <strong>Your phone number is never displayed publicly on reviews</strong>, nor is it sold or transferred to sponsoring businesses without your explicit consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D] flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#0A3D91]" />
            <span>3. Review Attribution & Anonymity Controls</span>
          </h2>
          <p>
            You can choose your public reviewer display alias. Sponsoring merchants receive aggregated sentiment and constructive feedback without accessing your private personal identifiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#0F1F3D]">
            4. Your Rights under the Act
          </h2>
          <p>
            You retain the right to access your personal data, request rectification of inaccurate records, object to processing, and request permanent deletion of your account and review history.
          </p>
        </section>
      </div>
    </div>
  );
}
