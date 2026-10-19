"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { AdvertiserNav } from "@/components/advertiser/AdvertiserNav";
import { Button, Card, Badge, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getActiveAdvertiserAndWallet,
  getAdsState,
  reviewCampaignSubmission,
} from "@/lib/ads/store";
import {
  AdvertiserProfile,
  CampaignSubmission,
  SponsoredCampaign,
} from "@/lib/ads/types";

export default function AdvertiserResultsPage() {
  const { user } = useAuth();
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = () => {
    const state = getAdsState();
    const { advertiser: adv } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setCampaigns(state.campaigns.filter((c) => c.advertiserId === adv.id));
    setSubmissions(state.submissions.filter((s) => s.advertiserId === adv.id));
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("earnora_ads_state_updated", handler);
    return () => window.removeEventListener("earnora_ads_state_updated", handler);
  }, [user?.id]);

  const filteredSubs = submissions.filter(
    (s) => selectedCampaignId === "all" || s.campaignId === selectedCampaignId
  );

  const totalCount = filteredSubs.length;
  const approvedCount = filteredSubs.filter((s) => s.status === "approved").length;
  const pendingCount = filteredSubs.filter((s) => s.status === "pending").length;
  const rejectedCount = filteredSubs.filter((s) => s.status === "rejected").length;
  const reviewedTotal = approvedCount + rejectedCount;
  const approvalRate =
    reviewedTotal > 0 ? Math.round((approvedCount / reviewedTotal) * 100) : 100;
  const avgRating =
    totalCount > 0
      ? (filteredSubs.reduce((sum, s) => sum + s.rating, 0) / totalCount).toFixed(1)
      : "0.0";

  // Simple rating distribution chart data (1 to 5 stars)
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = filteredSubs.filter((s) => s.rating === star).length;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { star, count, pct };
  });

  const handleDecision = (
    sub: CampaignSubmission,
    decision: "approved" | "rejected"
  ) => {
    if (!advertiser) return;
    setStatusMessage("");
    setErrorMessage("");
    try {
      reviewCampaignSubmission({
        submissionId: sub.id,
        decision,
        reviewerId: advertiser.profileId,
        reviewerName: advertiser.businessName,
        reviewerRole: "advertiser",
        notes:
          decision === "approved"
            ? "Verified first-hand feedback approved by advertiser."
            : "Submission did not meet proof requirements.",
      });

      setStatusMessage(
        decision === "approved"
          ? `Approved submission by @${sub.username}. KES ${sub.rewardKes} released from escrow to reviewer's wallet.`
          : `Rejected submission by @${sub.username}.`
      );
      loadData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Action failed.");
    }
  };

  return (
    <div className="space-y-6">
      <AdvertiserNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Campaign Results & Submissions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Analyze submission metrics, approval rates, rating distribution, and verify task proofs.
          </p>
        </div>

        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="h-10 px-3.5 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
        >
          <option value="all">All Campaigns ({submissions.length})</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--accent-green)] flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card padding="md">
          <span className="text-xs font-semibold text-[var(--text-muted)] block">
            Total Submissions
          </span>
          <span className="text-2xl font-extrabold text-[var(--text-primary)] numeral-bold mt-1 block font-display">
            {totalCount}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {pendingCount} awaiting review
          </span>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-[var(--text-muted)] block">
            Approval Rate
          </span>
          <span className="text-2xl font-extrabold text-[var(--accent-green)] numeral-bold mt-1 block font-display">
            {approvalRate}%
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {approvedCount} approved • {rejectedCount} rejected
          </span>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-[var(--text-muted)] block">
            Average Sentiment Rating
          </span>
          <span className="text-2xl font-extrabold text-[var(--accent-gold)] numeral-bold mt-1 block font-display">
            {avgRating} / 5.0
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Honest verified customer rating
          </span>
        </Card>

        <Card padding="md">
          <span className="text-xs font-semibold text-[var(--text-muted)] block">
            Rewards Disbursed
          </span>
          <span className="text-2xl font-extrabold text-[var(--brand-blue)] numeral-bold mt-1 block font-display">
            KES{" "}
            {filteredSubs
              .filter((s) => s.status === "approved")
              .reduce((sum, s) => sum + s.rewardKes, 0)
              .toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Paid from campaign escrow
          </span>
        </Card>
      </div>

      {/* Simple Charts Section: Rating Distribution + Campaign Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
              Star Rating Breakdown
            </h2>
            <Star className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>

          <div className="space-y-2.5">
            {ratingCounts.map((rc) => (
              <div key={rc.star} className="flex items-center gap-3 text-xs">
                <span className="w-14 font-bold text-[var(--text-secondary)] shrink-0">
                  {rc.star} Stars
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-card-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[var(--brand-blue)] rounded-full transition-all"
                    style={{ width: `${rc.pct}%` }}
                  />
                </div>
                <span className="w-16 text-right font-semibold text-[var(--text-muted)] numeral-bold">
                  {rc.count} ({rc.pct}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
              Task Completion by Campaign
            </h2>
            <BarChart3 className="w-4 h-4 text-[var(--brand-blue)]" />
          </div>

          <div className="space-y-3">
            {campaigns.map((camp) => {
              const pct =
                camp.maxTasks > 0
                  ? Math.round((camp.completedTasks / camp.maxTasks) * 100)
                  : 0;
              return (
                <div key={camp.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)] truncate max-w-[220px]">
                      {camp.title}
                    </span>
                    <span className="text-[var(--text-muted)] numeral-bold">
                      {camp.completedTasks}/{camp.maxTasks} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-card-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-[var(--accent-green)] rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Submissions Queue */}
      <Card padding="lg" className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
          Submitted Task Proofs ({filteredSubs.length})
        </h2>

        {filteredSubs.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="When users complete your active sponsored tasks on the Earn page, their proofs will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredSubs.map((sub) => (
              <div key={sub.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[var(--brand-blue)]">
                        {sub.campaignTitle}
                      </span>
                      <Badge
                        size="sm"
                        variant={
                          sub.status === "approved"
                            ? "success"
                            : sub.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {sub.status.toUpperCase()}
                      </Badge>
                      {sub.isFlagged && (
                        <Badge size="sm" variant="danger">
                          Flagged for Review
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      By <strong>@{sub.username}</strong> • Rating: {sub.rating}/5 Stars •{" "}
                      {new Date(sub.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-sm font-extrabold text-[var(--accent-green)] numeral-bold">
                      Reward: KES {sub.rewardKes}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <p className="font-bold text-[var(--text-primary)]">{sub.headline}</p>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {sub.reviewText}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                    <p className="text-[var(--accent-green)]">
                      <strong>Pros:</strong> {sub.pros}
                    </p>
                    <p className="text-[var(--accent-amber)]">
                      <strong>Cons:</strong> {sub.cons}
                    </p>
                  </div>
                  {sub.proofFileName && (
                    <div className="pt-2 flex items-center gap-2 text-[11px] text-[var(--brand-blue)] font-semibold">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>
                        Attached Proof: {sub.proofFileName} (SHA-256 fingerprint:{" "}
                        {sub.proofHash?.slice(0, 14)}...)
                      </span>
                    </div>
                  )}
                </div>

                {sub.status === "pending" && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDecision(sub, "rejected")}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleDecision(sub, "approved")}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve & Release KES {sub.rewardKes}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
