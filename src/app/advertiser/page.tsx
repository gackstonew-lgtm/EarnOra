"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { AdvertiserNav } from "@/components/advertiser/AdvertiserNav";
import { Button, Card, Badge, EmptyState, Skeleton } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getActiveAdvertiserAndWallet,
  getAdsState,
} from "@/lib/ads/store";
import {
  AdvertiserLedgerEntry,
  AdvertiserProfile,
  AdvertiserWallet,
  SponsoredCampaign,
} from "@/lib/ads/types";

export default function AdvertiserOverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [wallet, setWallet] = useState<AdvertiserWallet | null>(null);
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [recentLedger, setRecentLedger] = useState<AdvertiserLedgerEntry[]>([]);

  const loadOverview = () => {
    const state = getAdsState();
    const { advertiser: adv, wallet: wal } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setWallet(wal);
    setCampaigns(state.campaigns.filter((c) => c.advertiserId === adv.id));
    setRecentLedger(
      state.ledger.filter((l) => l.advertiserId === adv.id).slice(0, 5)
    );
    setLoading(false);
  };

  useEffect(() => {
    loadOverview();
    const handler = () => loadOverview();
    window.addEventListener("earnora_ads_state_updated", handler);
    return () => window.removeEventListener("earnora_ads_state_updated", handler);
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" rounded="xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" rounded="xl" />
          <Skeleton className="h-28 w-full" rounded="xl" />
          <Skeleton className="h-28 w-full" rounded="xl" />
          <Skeleton className="h-28 w-full" rounded="xl" />
        </div>
      </div>
    );
  }

  const activeCampaignsCount = campaigns.filter((c) => c.status === "active").length;
  const totalTasksCompleted = campaigns.reduce((sum, c) => sum + c.completedTasks, 0);
  const totalMaxTasks = campaigns.reduce((sum, c) => sum + c.maxTasks, 0);

  return (
    <div className="space-y-6">
      <AdvertiserNav />

      {/* Page Heading & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Advertiser Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Monitor campaign escrow balances, verified task completions, and customer sentiment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/advertiser/wallet">
            <Button variant="secondary" size="sm" leftIcon={<Wallet className="w-4 h-4" />}>
              Top Up Wallet
            </Button>
          </Link>
          <Link href="/advertiser/campaigns/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-emerald-500/15 text-[var(--accent-green)] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[var(--accent-green)] numeral-bold mt-2 font-display">
            KES {(wallet?.balanceKes ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 numeral-bold">
            + KES {(wallet?.heldKes ?? 0).toLocaleString()} held in escrow
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Active Campaigns
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] numeral-bold mt-2 font-display">
            {activeCampaignsCount}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            {campaigns.length} total campaigns created
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Tasks Completed
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-amber-500/15 text-[var(--accent-gold)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] numeral-bold mt-2 font-display">
            {totalTasksCompleted}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            of {totalMaxTasks} target tasks
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Total Spend
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] numeral-bold mt-2 font-display">
            KES {(wallet?.totalSpentKes ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Disbursed rewards & platform fees
          </p>
        </Card>
      </div>

      {/* Main Grid: Active Campaigns + Recent Wallet Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Campaigns */}
        <div className="lg:col-span-7 space-y-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Recent Campaigns
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Escrow-backed campaigns and task completion progress
                </p>
              </div>
              <Link
                href="/advertiser/campaigns"
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                description="Top up your campaign wallet and launch your first sponsored review or testing campaign."
              />
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {campaigns.slice(0, 4).map((camp) => {
                  const pct =
                    camp.maxTasks > 0
                      ? Math.round((camp.completedTasks / camp.maxTasks) * 100)
                      : 0;
                  return (
                    <div key={camp.id} className="py-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {camp.title}
                            </span>
                            <Badge
                              size="sm"
                              variant={
                                camp.status === "active"
                                  ? "success"
                                  : camp.status === "pending_approval"
                                  ? "warning"
                                  : camp.status === "rejected"
                                  ? "danger"
                                  : "neutral"
                              }
                            >
                              {camp.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Reward: KES {camp.rewardPerTaskKes} / task • Escrow remaining: KES{" "}
                            {camp.remainingBudgetKes.toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[var(--text-primary)] numeral-bold block">
                            {camp.completedTasks} / {camp.maxTasks} tasks
                          </span>
                          <span className="text-[11px] text-[var(--brand-blue)] font-semibold">
                            {pct}% complete
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-[var(--bg-card-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                        <div
                          className="h-full bg-[var(--brand-blue)] rounded-full transition-all"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 5 Cols: Recent Ledger Activity */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Wallet Ledger
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Immutable append-only KES transactions
                </p>
              </div>
              <Link
                href="/advertiser/wallet"
                className="text-xs font-bold text-[var(--brand-blue)] hover:underline flex items-center gap-1"
              >
                <span>Full ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentLedger.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">
                No wallet transactions recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {recentLedger.map((entry) => {
                  const isCredit = entry.direction === "credit";
                  return (
                    <div
                      key={entry.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {entry.description}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="uppercase font-semibold">{entry.txType.replace("_", " ")}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-extrabold numeral-bold block ${
                            isCredit ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"
                          }`}
                        >
                          {isCredit ? "+" : "-"}KES {entry.amountKes.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] numeral-bold">
                          Bal: KES {entry.balanceAfterKes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0" />
              <span>
                All campaign funds are held in atomic KES escrow and refunded automatically if unused.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
