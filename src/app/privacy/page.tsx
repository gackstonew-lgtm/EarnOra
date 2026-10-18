"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/" className="text-xs font-semibold text-emerald-500 hover:underline">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
          Kenya Data Protection Act Compliance & Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Compliant with Kenya Data Protection Act, 2019 (ODPC)
        </p>
      </div>

      <div className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>1. Data Controller & Principles</span>
          </h2>
          <p>
            Earnora operates in strict accordance with the principles set out in Section 25 of the Kenya Data Protection Act: lawful processing, data minimization, accuracy, purpose limitation, storage limitation, and robust security safeguards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>2. Data Minimization & Phone Privacy</span>
          </h2>
          <p>
            We collect your phone number exclusively for authentication, OTP verification, and M-Pesa automated payout execution. <strong>Your phone number is never displayed publicly on reviews</strong>, nor is it sold or transferred to sponsoring businesses without your explicit consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-500" />
            <span>3. Review Attribution & Anonymity Controls</span>
          </h2>
          <p>
            You can choose your public reviewer display alias. Sponsoring merchants receive aggregated sentiment and constructive feedback without accessing your private personal identifiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
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
