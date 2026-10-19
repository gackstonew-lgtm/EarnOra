"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function ForBusinessesPage() {
  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[var(--brand-blue)] hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display tracking-tight mt-2">
          EarnOra for Businesses & Brands
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Collect honest first-hand customer feedback, app testing reports, and market research across Kenya.
        </p>
      </div>

      <Card padding="lg" className="space-y-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border border-[var(--brand-blue)]/20 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Transparent Escrow-Backed Campaigns</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-display">
          Real Customer Insights — Never Fake Praise
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          EarnOra connects Kenyan businesses, hospitality venues, digital apps, and consumer brands with verified local reviewers. Unlike astroturfing services, our platform strictly rewards honest, constructive first-hand experiences—helping you identify operational blind spots and improve customer satisfaction.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <div className="p-4 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-1.5">
            <Wallet className="w-5 h-5 text-[var(--accent-green)]" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              1. Fund KES Escrow
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Top up your Campaign Wallet via M-Pesa STK Push or Card. Funds are held in escrow and unused budget is refunded when a campaign ends.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-blue)]" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              2. Verified Proof Rules
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Require original receipts, app screenshots, and structured pros & cons. Duplicate uploads and self-reviews are automatically blocked.
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-1.5">
            <BarChart3 className="w-5 h-5 text-[var(--accent-gold)]" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              3. Actionable Results
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Review submissions, track approval rates, and download itemized transaction receipts for your business accounting.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold text-[var(--brand-blue)]">
            <Link href="/advertiser-terms" className="hover:underline">
              Advertiser Terms
            </Link>
            <Link href="/ad-review-policy" className="hover:underline">
              Ad & Review Policy
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/advertiser">
              <Button variant="secondary" size="md">
                Advertiser Portal
              </Button>
            </Link>
            <Link href="/advertiser/signup">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Advertiser Account
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
