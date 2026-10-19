"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

export default function AdvertiserTermsPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/for-businesses"
          className="text-xs font-semibold text-[var(--brand-blue)] hover:underline"
        >
          ← Back to For Businesses
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight mt-2">
          EarnOra Advertiser Terms of Service
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Draft Placeholder for Legal Review • Jurisdiction: Republic of Kenya
        </p>
      </div>

      <Card padding="lg" className="space-y-5 text-xs text-[var(--text-secondary)] leading-relaxed">
        <div className="p-3 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
          <strong>Legal Review Notice:</strong> This document contains structured placeholder terms for review by qualified Kenyan legal and tax counsel prior to commercial launch.
        </div>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            1. Account Eligibility & Business Verification
          </h2>
          <p>
            Advertiser accounts may only be registered by authorized representatives of legitimate businesses, organizations, or research entities. EarnOra reserves the right to verify business details and suspend accounts that provide misleading information.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            2. Campaign Wallet, Escrow Holds & Platform Fees
          </h2>
          <p>
            All campaign budgets are denominated in whole Kenyan Shillings (KES). Before a campaign goes live, the total budget (task rewards subtotal plus the applicable platform fee) must be available in the Advertiser&apos;s wallet and is placed in an atomic escrow hold.
          </p>
          <p>
            When a campaign ends or is stopped, any unused task reward escrow is automatically refunded to the Advertiser&apos;s Campaign Wallet.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            3. Prohibition on Rating Manipulation
          </h2>
          <p>
            Advertisers sponsor task participation and genuine first-hand testing—never specific star ratings or predetermined praise. Rejecting a valid user submission solely because it contains constructive criticism or a lower star rating is strictly prohibited.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            4. Taxes, Invoices & Compliance
          </h2>
          <p>
            Advertisers are responsible for applicable taxes in accordance with Kenyan tax regulations. Itemized transaction receipts are available for download in the Advertiser Wallet section.
          </p>
        </section>
      </Card>
    </div>
  );
}
