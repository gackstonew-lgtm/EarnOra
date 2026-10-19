"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";

export default function AdReviewPolicyPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[var(--brand-blue)] hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight mt-2">
          Sponsored Ad & Honest Review Policy
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Transparency, Consumer Protection & Anti-Fraud Standards (Draft for Legal Review)
        </p>
      </div>

      <Card padding="lg" className="space-y-5 text-xs text-[var(--text-secondary)] leading-relaxed">
        <div className="p-3.5 rounded-[12px] bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-[var(--accent-green)]">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Core Principle:</strong> Every sponsored task on EarnOra is clearly labeled with a &ldquo;Sponsored&rdquo; badge, and every reviewer is required to share their honest, unbiased experience.
          </span>
        </div>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            1. Mandatory &ldquo;Sponsored&rdquo; Disclosure
          </h2>
          <p>
            All advertiser-funded campaigns displayed on the Earn page carry a visible &ldquo;Sponsored&rdquo; label so users and consumers always know when feedback collection has been sponsored by a business.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            2. Honest Reviews Only — No Fake Reviews Allowed
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>No Paid 5-Star Requirement:</strong> Advertisers cannot require positive ratings as a condition for task payout. Constructive 1-star to 5-star reviews that meet proof guidelines qualify equally for payout.
            </li>
            <li>
              <strong>First-Hand Experience Required:</strong> Users may only review businesses, apps, or products they have genuinely visited, used, or tested.
            </li>
            <li>
              <strong>Original Proof Verification:</strong> Uploaded receipts and screenshots are hashed (SHA-256) to block duplicate or recycled proof across accounts.
            </li>
          </ul>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            3. Conflict of Interest & Self-Review Ban
          </h2>
          <p>
            Business owners, employees, and advertisers are strictly prohibited from submitting tasks for their own campaigns or businesses, or submitting fabricated negative reviews against competitors.
          </p>
        </section>
      </Card>
    </div>
  );
}
