"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Megaphone,
  Building2,
  ShieldCheck,
  TrendingUp,
  FileText,
  Settings,
  CheckSquare,
  Save,
} from "lucide-react";
import { ModerationStatus } from "@/lib/types";
import { Button, Card, Badge } from "@/components/ui";
import { isAdsEnabled } from "@/lib/ads/config";
import {
  changeCampaignStatus,
  getAdsState,
  reviewCampaignSubmission,
  setAdvertiserStatusAdmin,
  updatePlatformSettingsAdmin,
} from "@/lib/ads/store";
import {
  AdvertiserProfile,
  AuditLogEntry,
  CampaignSubmission,
  PlatformSettings,
  SponsoredCampaign,
} from "@/lib/ads/types";

interface QueuedReview {
  id: string;
  reviewer: string;
  phone: string;
  taskTitle: string;
  rating: number;
  wordCount: number;
  hasPhoto: boolean;
  duplicateScore: number;
  status: ModerationStatus;
  headline: string;
  textSnippet: string;
  rewardKes: number;
}

type AdminTab =
  | "moderation"
  | "campaigns"
  | "video_ads"
  | "advertisers"
  | "flagged"
  | "revenue"
  | "audits"
  | "settings";

interface AdminVideoAdItem {
  id: string;
  title: string;
  advertiserName: string;
  description: string;
  category: string;
  videoUrl: string;
  videoType: "hosted" | "embedded";
  thumbnailUrl?: string;
  durationSeconds: number;
  minWatchSeconds: number;
  rewardKes: number;
  rewardPoints: number;
  status: "draft" | "pending_approval" | "active" | "paused" | "completed" | "rejected";
  isDemoData?: boolean;
  ownsVideoRights?: boolean;
}

export default function AdminPage() {
  const [reviews, setReviews] = useState<QueuedReview[]>([
    {
      id: "rev-mod-101",
      reviewer: "Baraka_Ke",
      phone: "+254712345678",
      taskTitle: "Java House Kimathi St Experience",
      rating: 4,
      wordCount: 84,
      hasPhoto: true,
      duplicateScore: 2,
      status: "pending_review",
      headline: "Great coffee, but seating wait was longer than expected",
      textSnippet:
        "Visited on Tuesday afternoon. Barista gave great recommendations on Kenyan single origin beans. The seating area upstairs was well lit, though Wi-Fi experienced minor drops around 3 PM.",
      rewardKes: 450,
    },
    {
      id: "rev-mod-102",
      reviewer: "QuickSpammer99",
      phone: "+254700000000",
      taskTitle: "M-Pesa Consumer App Review",
      rating: 5,
      wordCount: 52,
      hasPhoto: false,
      duplicateScore: 94,
      status: "pending_review",
      headline: "Good app best app in Kenya download now",
      textSnippet:
        "This app is very good and nice I like it so much best app download now very good app is very good and nice I like it so much best app download now.",
      rewardKes: 300,
    },
  ]);

  const [activeTab, setActiveTab] = useState<AdminTab>("moderation");

  // Ads Portal Admin State
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [videoAds, setVideoAds] = useState<AdminVideoAdItem[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserProfile[]>([]);
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFeePercent: 15,
    dailyUserSubmissionLimit: 5,
    minRewardPerTaskKes: 50,
    minCampaignTasks: 5,
    updatedAt: "",
  });

  // UI state
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [feeInput, setFeeInput] = useState("15");
  const [dailyLimitInput, setDailyLimitInput] = useState("5");
  const [minRewardInput, setMinRewardInput] = useState("50");
  const [minTasksInput, setMinTasksInput] = useState("5");

  const loadVideoAds = async () => {
    try {
      const res = await fetch("/api/ads/watch?scope=admin", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setVideoAds(json.ads || []);
      }
    } catch {
      // Ignore transient error
    }
  };

  const loadAdminData = () => {
    if (!isAdsEnabled()) return;
    const state = getAdsState();
    setCampaigns(state.campaigns);
    setAdvertisers(state.advertisers);
    setSubmissions(state.submissions);
    setAuditLogs(state.auditLogs);
    setSettings(state.settings);
    setFeeInput(String(state.settings.platformFeePercent));
    setDailyLimitInput(String(state.settings.dailyUserSubmissionLimit));
    setMinRewardInput(String(state.settings.minRewardPerTaskKes));
    setMinTasksInput(String(state.settings.minCampaignTasks));
    loadVideoAds();
  };

  const handleVideoAdStatus = async (adId: string, status: "active" | "rejected" | "paused") => {
    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", adId, status }),
      });
      if (res.ok) {
        setAdminFeedback(`Video ad ${adId} status updated to ${status.toUpperCase()}.`);
        await loadVideoAds();
      }
    } catch {
      // Ignore
    }
  };

  const handleDeleteVideoAd = async (adId: string, title: string) => {
    try {
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_ad", adId }),
      });
      if (res.ok) {
        setAdminFeedback(`Deleted video ad "${title}".`);
        await loadVideoAds();
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadAdminData();
    const handler = () => loadAdminData();
    window.addEventListener("earnora_ads_state_updated", handler);
    return () => window.removeEventListener("earnora_ads_state_updated", handler);
  }, []);

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: decision } : r))
    );
  };

  const handleCampaignDecision = (
    camp: SponsoredCampaign,
    decision: "active" | "rejected"
  ) => {
    const reason =
      rejectionReasons[camp.id]?.trim() ||
      (decision === "rejected"
        ? "Campaign instructions or proof requirements did not meet Earnora transparency policy."
        : undefined);

    const res = changeCampaignStatus({
      campaignId: camp.id,
      nextStatus: decision,
      actorId: "admin_ke_01",
      actorName: "Earnora Compliance Admin",
      actorRole: "admin",
      reason,
    });

    setAdminFeedback(
      decision === "active"
        ? `Campaign "${camp.title}" approved and is now live on the Earn page.`
        : `Campaign "${camp.title}" rejected. KES ${res.refundedKes.toLocaleString()} refunded to advertiser wallet.`
    );
    loadAdminData();
  };

  const handleAdvertiserStatus = (
    adv: AdvertiserProfile,
    status: "verified" | "suspended"
  ) => {
    setAdvertiserStatusAdmin({
      advertiserId: adv.id,
      status,
      reason:
        status === "suspended"
          ? "Suspended by Admin compliance review."
          : "Verified business registration.",
      adminId: "admin_ke_01",
    });
    setAdminFeedback(`Advertiser "${adv.businessName}" marked as ${status.toUpperCase()}.`);
    loadAdminData();
  };

  const toggleSubSelection = (id: string) => {
    setSelectedSubIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkSubmissions = (decision: "approved" | "rejected") => {
    let processedCount = 0;
    for (const subId of selectedSubIds) {
      const sub = submissions.find((s) => s.id === subId);
      if (sub && sub.status === "pending") {
        try {
          reviewCampaignSubmission({
            submissionId: sub.id,
            decision,
            reviewerId: "admin_ke_01",
            reviewerName: "Earnora Admin",
            reviewerRole: "admin",
            notes: `Bulk ${decision} by Admin moderation desk.`,
          });
          processedCount++;
        } catch {
          // Skip if error
        }
      }
    }
    setSelectedSubIds([]);
    setAdminFeedback(
      `Bulk ${decision} completed for ${processedCount} submission(s).`
    );
    loadAdminData();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettingsAdmin({
      platformFeePercent: Number(feeInput),
      dailyUserSubmissionLimit: Number(dailyLimitInput),
      minRewardPerTaskKes: Number(minRewardInput),
      minCampaignTasks: Number(minTasksInput),
    });
    setAdminFeedback("Platform fee percentage and limits updated.");
    loadAdminData();
  };

  // Financial & Revenue Overview Calculation
  const totalPlatformFeeKes = campaigns
    .filter((c) => c.status !== "rejected")
    .reduce((sum, c) => sum + c.platformFeeKes, 0);
  const totalEscrowHeldKes = campaigns.reduce(
    (sum, c) => sum + c.remainingBudgetKes,
    0
  );
  const totalUserPayoutsKes = submissions
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + s.rewardKes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
          Admin & Moderation Desk
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          Role-based review verification, campaign approvals, advertiser governance, revenue ledger, and audit logs.
        </p>
      </div>

      {adminFeedback && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--accent-green)] font-semibold flex items-center justify-between">
          <span>{adminFeedback}</span>
          <button
            onClick={() => setAdminFeedback("")}
            className="text-[11px] underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] pb-2 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "moderation"
              ? "bg-[var(--brand-blue)] text-white shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
          }`}
        >
          Review Moderation Queue ({reviews.filter((r) => r.status === "pending_review").length})
        </button>

        {isAdsEnabled() && (
          <>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "campaigns"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>
                Campaign Approvals (
                {campaigns.filter((c) => c.status === "pending_approval").length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("video_ads")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "video_ads"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Video Ads ({videoAds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("advertisers")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "advertisers"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Advertisers ({advertisers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("flagged")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "flagged"
                  ? "bg-red-500 text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                Submissions & Flagged Queue (
                {submissions.filter((s) => s.status === "pending").length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "revenue"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Revenue & Payouts</span>
            </button>

            <button
              onClick={() => setActiveTab("audits")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "audits"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Logs ({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3.5 py-2 rounded-[10px] whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Fee & Limits</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: EXISTING REVIEW MODERATION QUEUE */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#0A3D91]">
                    {rev.taskTitle}
                  </span>
                  <p className="text-xs font-semibold text-[#6B7A99] mt-1">
                    Submitted by <strong>@{rev.reviewer}</strong> ({rev.phone})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#16A34A] numeral-bold">
                    Bounty: KES {rev.rewardKes}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      rev.duplicateScore > 50
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                    }`}
                  >
                    {rev.duplicateScore > 50
                      ? `⚠️ High Risk (${rev.duplicateScore}%)`
                      : `Verified (${rev.duplicateScore}% risk)`}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#0F1F3D]">{rev.headline}</h4>
                <p className="text-xs text-[#6B7A99] mt-1.5 leading-relaxed bg-[#EEF3FF]/60 p-3 rounded-[12px] border border-blue-100/60">
                  &ldquo;{rev.textSnippet}&rdquo;
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-[#6B7A99]">
                  <span>{rev.wordCount} words</span>
                  <span>•</span>
                  <span>{rev.hasPhoto ? "Photo Attached" : "No Photo"}</span>
                  <span>•</span>
                  <span>Rating: {rev.rating}/5</span>
                </div>

                {rev.status === "pending_review" ? (
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDecision(rev.id, "rejected")}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleDecision(rev.id, "approved")}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      Approve & Disburse KES {rev.rewardKes}
                    </Button>
                  </div>
                ) : (
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      rev.status === "approved"
                        ? "bg-emerald-50 text-[#16A34A]"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    Decision: {rev.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CAMPAIGN APPROVALS / REJECTIONS */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <Card key={camp.id} padding="lg" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {camp.businessName}
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
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mt-1.5">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {camp.description}
                  </p>
                </div>

                <div className="sm:text-right text-xs shrink-0 space-y-1">
                  <p className="font-extrabold text-[var(--accent-green)] numeral-bold text-sm">
                    Total Escrow + Fee: KES {camp.totalBudgetKes.toLocaleString()}
                  </p>
                  <p className="text-[var(--text-muted)] numeral-bold">
                    {camp.maxTasks} tasks × KES {camp.rewardPerTaskKes} + KES{" "}
                    {camp.platformFeeKes} fee
                  </p>
                </div>
              </div>

              {camp.status === "pending_approval" && (
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={rejectionReasons[camp.id] || ""}
                    onChange={(e) =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [camp.id]: e.target.value,
                      }))
                    }
                    placeholder="Reason for rejection (shown to advertiser if rejected)..."
                    className="flex-1 h-10 px-3.5 text-xs rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCampaignDecision(camp, "rejected")}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject & Refund Escrow
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCampaignDecision(camp, "active")}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      Approve Campaign Live
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: ADVERTISERS VERIFICATION / SUSPENSION */}
      {activeTab === "advertisers" && (
        <div className="space-y-3.5">
          {advertisers.map((adv) => (
            <Card
              key={adv.id}
              padding="md"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {adv.businessName}
                  </h3>
                  <Badge
                    size="sm"
                    variant={
                      adv.status === "verified"
                        ? "success"
                        : adv.status === "suspended"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {adv.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Contact: {adv.contactPerson} • {adv.phone} • {adv.email}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Category: {adv.businessType.replace("_", " ")}
                  {adv.website ? ` • ${adv.website}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {adv.status !== "verified" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAdvertiserStatus(adv, "verified")}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  >
                    Verify Advertiser
                  </Button>
                )}
                {adv.status !== "suspended" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAdvertiserStatus(adv, "suspended")}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: FLAGGED & PENDING CAMPAIGN SUBMISSIONS (WITH BULK APPROVE/REJECT) */}
      {activeTab === "flagged" && (
        <div className="space-y-4">
          <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <CheckSquare className="w-4 h-4 text-[var(--brand-blue)]" />
              <span>{selectedSubIds.length} submission(s) selected for bulk action</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={selectedSubIds.length === 0}
                onClick={() => handleBulkSubmissions("rejected")}
              >
                Bulk Reject ({selectedSubIds.length})
              </Button>
              <Button
                variant="success"
                size="sm"
                disabled={selectedSubIds.length === 0}
                onClick={() => handleBulkSubmissions("approved")}
              >
                Bulk Approve & Pay ({selectedSubIds.length})
              </Button>
            </div>
          </Card>

          {submissions.map((sub) => (
            <Card key={sub.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  {sub.status === "pending" && (
                    <input
                      type="checkbox"
                      checked={selectedSubIds.includes(sub.id)}
                      onChange={() => toggleSubSelection(sub.id)}
                      className="mt-1 w-4 h-4 rounded accent-[var(--brand-blue)]"
                    />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
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
                          ⚠️ Flagged: {sub.flagReason || "Duplicate/Low-Effort Risk"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Reviewer: <strong>@{sub.username}</strong> ({sub.userPhone}) • Reward: KES{" "}
                      {sub.rewardKes}
                    </p>
                  </div>
                </label>

                {sub.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        reviewCampaignSubmission({
                          submissionId: sub.id,
                          decision: "rejected",
                          reviewerId: "admin_ke_01",
                          reviewerName: "Earnora Admin",
                          reviewerRole: "admin",
                        });
                        loadAdminData();
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        reviewCampaignSubmission({
                          submissionId: sub.id,
                          decision: "approved",
                          reviewerId: "admin_ke_01",
                          reviewerName: "Earnora Admin",
                          reviewerRole: "admin",
                        });
                        loadAdminData();
                      }}
                    >
                      Approve & Credit KES {sub.rewardKes}
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-xs">
                <p className="font-bold text-[var(--text-primary)]">{sub.headline}</p>
                <p className="text-[var(--text-secondary)] mt-1">{sub.reviewText}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 5: PLATFORM REVENUE & PAYOUT OVERVIEW */}
      {activeTab === "revenue" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="lg">
            <span className="text-xs font-semibold text-[var(--text-muted)] block">
              Platform Fee Revenue Earned
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--accent-green)] numeral-bold mt-2 block font-display">
              KES {totalPlatformFeeKes.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Retained by Earnora from funded campaigns ({settings.platformFeePercent}% fee rate)
            </span>
          </Card>

          <Card padding="lg">
            <span className="text-xs font-semibold text-[var(--text-muted)] block">
              Active Campaign Escrow Held
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--accent-gold)] numeral-bold mt-2 block font-display">
              KES {totalEscrowHeldKes.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Ring-fenced integer KES backing active tasks
            </span>
          </Card>

          <Card padding="lg">
            <span className="text-xs font-semibold text-[var(--text-muted)] block">
              Total Sponsored User Payouts
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-blue)] numeral-bold mt-2 block font-display">
              KES {totalUserPayoutsKes.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Credited to user available balances on approval
            </span>
          </Card>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === "audits" && (
        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
            Immutable Financial & Admin Audit Trail
          </h2>
          <div className="divide-y divide-[var(--border-subtle)] text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {log.action}
                    </Badge>
                    <span className="font-bold text-[var(--text-primary)]">
                      {log.actorName} ({log.actorRole})
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                    Target: {log.targetType}:{log.targetId} •{" "}
                    {JSON.stringify(log.details)}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 7: PLATFORM FEE & LIMITS SETTINGS */}
      {activeTab === "settings" && (
        <Card padding="lg" className="max-w-xl">
          <h2 className="text-base font-bold text-[var(--text-primary)] font-display mb-4">
            Platform Fee & Submission Limits
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Platform Fee Percentage (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Daily User Submission Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={dailyLimitInput}
                  onChange={(e) => setDailyLimitInput(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Min Reward per Task (KES)
                </label>
                <input
                  type="number"
                  min={10}
                  value={minRewardInput}
                  onChange={(e) => setMinRewardInput(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Min Tasks per Campaign
                </label>
                <input
                  type="number"
                  min={1}
                  value={minTasksInput}
                  onChange={(e) => setMinTasksInput(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Platform Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 8: VIDEO ADS MODERATION & SAMPLE DEMO ADS MANAGEMENT */}
      {activeTab === "video_ads" && (
        <div className="space-y-4">
          <div className="p-4 rounded-[14px] bg-amber-100/80 dark:bg-amber-950/70 border border-amber-500/40 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Copyright &amp; Video Rights Compliance Notice</p>
              <p className="mt-0.5 leading-relaxed">
                Advertisers must own full copyright and distribution rights to all videos they upload or embed (YouTube/Vimeo). Do not approve copyrighted third-party videos. Seeded sample ads below are marked as <strong>Demo Data</strong> and can be deleted with one tap.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {videoAds.map((ad) => (
              <Card key={ad.id} padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 text-xs font-bold">
                      {ad.videoType.toUpperCase()} ({ad.durationSeconds}s)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold">
                      +KES {ad.rewardKes} / +{ad.rewardPoints} pts
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold uppercase">
                      {ad.status}
                    </span>
                    {ad.isDemoData && (
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-400/40 text-xs font-bold">
                        Demo Sample Ad
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {ad.title} — <span className="text-sm font-semibold text-[var(--text-secondary)]">{ad.advertiserName}</span>
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">{ad.description}</p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">Source: {ad.videoUrl}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {ad.status !== "active" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleVideoAdStatus(ad.id, "active")}
                    >
                      Approve
                    </Button>
                  )}
                  {ad.status === "active" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleVideoAdStatus(ad.id, "paused")}
                    >
                      Pause
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteVideoAd(ad.id, ad.title)}
                  >
                    {ad.isDemoData ? "Delete Demo Ad" : "Delete"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
