"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pause,
  Play,
  StopCircle,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  ArrowUpRight,
} from "lucide-react";
import { AdvertiserNav } from "@/components/advertiser/AdvertiserNav";
import { Button, Card, Badge, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  changeCampaignStatus,
  getActiveAdvertiserAndWallet,
  getAdsState,
} from "@/lib/ads/store";
import { AdvertiserProfile, SponsoredCampaign } from "@/lib/ads/types";
import { getCampaignTypeTag } from "@/lib/ads/validation";

export default function AdvertiserCampaignsPage() {
  const { user } = useAuth();
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [feedbackBanner, setFeedbackBanner] = useState<string>("");
  const [errorBanner, setErrorBanner] = useState<string>("");

  const loadCampaigns = () => {
    const state = getAdsState();
    const { advertiser: adv } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setCampaigns(state.campaigns.filter((c) => c.advertiserId === adv.id));
  };

  useEffect(() => {
    loadCampaigns();
    const handler = () => loadCampaigns();
    window.addEventListener("earnora_ads_state_updated", handler);
    return () => window.removeEventListener("earnora_ads_state_updated", handler);
  }, [user?.id]);

  const handleStatusAction = (
    camp: SponsoredCampaign,
    nextStatus: "active" | "paused" | "completed"
  ) => {
    if (!advertiser) return;
    setFeedbackBanner("");
    setErrorBanner("");

    try {
      const res = changeCampaignStatus({
        campaignId: camp.id,
        nextStatus,
        actorId: advertiser.profileId,
        actorName: advertiser.businessName,
        actorRole: "advertiser",
      });

      if (nextStatus === "completed") {
        setFeedbackBanner(
          `Campaign "${camp.title}" ended. Unused escrow budget of KES ${res.refundedKes.toLocaleString()} has been refunded to your campaign wallet.`
        );
      } else {
        setFeedbackBanner(
          `Campaign "${camp.title}" is now ${nextStatus.toUpperCase()}.`
        );
      }
      loadCampaigns();
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const filtered = campaigns.filter(
    (c) => filterStatus === "all" || c.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <AdvertiserNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            My Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Track task completion progress, pause or resume delivery, or end a campaign to refund unused escrow funds.
          </p>
        </div>

        <Link href="/advertiser/campaigns/new">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Campaign
          </Button>
        </Link>
      </div>

      {feedbackBanner && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--accent-green)] flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: "all", label: `All (${campaigns.length})` },
          { id: "active", label: "Active" },
          { id: "pending_approval", label: "Pending Approval" },
          { id: "paused", label: "Paused" },
          { id: "completed", label: "Completed" },
          { id: "rejected", label: "Rejected" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3.5 py-2 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === f.id
                ? "bg-[var(--brand-blue)] text-white shadow-xs"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-7 h-7" />}
          title="No campaigns match this filter"
          description="Create a new sponsored campaign to start collecting verified Kenyan reviews and product feedback."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((camp) => {
            const pct =
              camp.maxTasks > 0
                ? Math.round((camp.completedTasks / camp.maxTasks) * 100)
                : 0;

            return (
              <Card key={camp.id} padding="lg" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue" size="sm">
                        {getCampaignTypeTag(camp.campaignType)}
                      </Badge>
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
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Target: {camp.targetOptions.city || "All Kenya"}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-display">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                      {camp.description}
                    </p>
                  </div>

                  {/* Budget & Escrow Metrics */}
                  <div className="sm:text-right shrink-0 space-y-0.5 bg-[var(--bg-card-elevated)] p-3 rounded-[14px] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] block">
                      Total Campaign Budget
                    </span>
                    <span className="text-base font-extrabold text-[var(--text-primary)] numeral-bold block">
                      KES {camp.totalBudgetKes.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--accent-green)] font-semibold numeral-bold block">
                      Escrow Remaining: KES {camp.remainingBudgetKes.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Rejection reason banner if rejected */}
                {camp.status === "rejected" && camp.rejectionReason && (
                  <div className="p-3 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                    <strong>Admin Rejection Reason:</strong> {camp.rejectionReason} (Full escrow & fee refunded to wallet)
                  </div>
                )}

                {/* Progress Bar & Controls */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-secondary)]">
                        Progress: {camp.completedTasks} / {camp.maxTasks} verified tasks (KES{" "}
                        {camp.rewardPerTaskKes} / task)
                      </span>
                      <span className="font-bold text-[var(--brand-blue)]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-card-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                      <div
                        className="h-full bg-[var(--brand-blue)] rounded-full transition-all"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link href="/advertiser/results">
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      >
                        Submissions
                      </Button>
                    </Link>

                    {camp.status === "active" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusAction(camp, "paused")}
                        leftIcon={<Pause className="w-3.5 h-3.5" />}
                      >
                        Pause
                      </Button>
                    )}

                    {camp.status === "paused" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusAction(camp, "active")}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                      >
                        Resume
                      </Button>
                    )}

                    {(camp.status === "active" ||
                      camp.status === "paused" ||
                      camp.status === "pending_approval") && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusAction(camp, "completed")}
                        leftIcon={<StopCircle className="w-3.5 h-3.5" />}
                      >
                        End & Refund Unused (KES {camp.remainingBudgetKes.toLocaleString()})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
