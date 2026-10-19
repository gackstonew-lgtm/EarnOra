"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Clock,
  Camera,
  FileText,
} from "lucide-react";
import { AdvertiserNav } from "@/components/advertiser/AdvertiserNav";
import { Button, Card, Badge } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  createAndFundCampaign,
  getActiveAdvertiserAndWallet,
  getAdsState,
} from "@/lib/ads/store";
import { calculateCampaignCost, getCampaignTypeTag } from "@/lib/ads/validation";
import {
  AdvertiserProfile,
  AdvertiserWallet,
  CampaignType,
  PlatformSettings,
} from "@/lib/ads/types";

const CAMPAIGN_TYPES: { value: CampaignType; label: string; desc: string }[] = [
  {
    value: "restaurant_review",
    label: "Restaurant & Hospitality Review",
    desc: "First-hand dining, café, hotel, or lounge experience feedback.",
  },
  {
    value: "app_testing",
    label: "Mobile App & Website Testing",
    desc: "Usability, onboarding, performance, and bug reports from real users.",
  },
  {
    value: "survey",
    label: "Market Research Survey",
    desc: "Structured consumer insights and household questionnaire responses.",
  },
  {
    value: "telco",
    label: "Telco & Fintech Task",
    desc: "Network speed, mobile money, or digital banking user evaluation.",
  },
  {
    value: "product",
    label: "Consumer Product Review",
    desc: "Hands-on product sample or retail purchase experience review.",
  },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [wallet, setWallet] = useState<AdvertiserWallet | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFeePercent: 15,
    dailyUserSubmissionLimit: 5,
    minRewardPerTaskKes: 50,
    minCampaignTasks: 5,
    updatedAt: "",
  });

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [campaignType, setCampaignType] = useState<CampaignType>("restaurant_review");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [deviceType, setDeviceType] = useState<"all" | "android" | "ios" | "desktop">("all");
  const [endDate, setEndDate] = useState("2026-12-31");

  // Step 2: Reward & Budget (Integer KES)
  const [rewardPerTaskInput, setRewardPerTaskInput] = useState("250");
  const [maxTasksInput, setMaxTasksInput] = useState("20");

  // Step 3: Proof Requirements
  const [instructions, setInstructions] = useState(
    "Describe your genuine first-hand experience in detail.\nInclude specific pros and cons.\nUpload your receipt or screenshot proof if requested."
  );
  const [minWords, setMinWords] = useState("35");
  const [requireScreenshot, setRequireScreenshot] = useState(false);
  const [requireReceipt, setRequireReceipt] = useState(false);

  // Submission state
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const state = getAdsState();
    const { advertiser: adv, wallet: wal } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setWallet(wal);
    setSettings(state.settings);
  }, [user?.id]);

  // Live cost breakdown using integer KES
  const rewardInt = Math.max(1, Math.trunc(Number(rewardPerTaskInput) || 0));
  const tasksInt = Math.max(1, Math.trunc(Number(maxTasksInput) || 0));
  let costBreakdown = {
    rewardPerTaskKes: rewardInt,
    maxTasks: tasksInt,
    rewardsSubtotalKes: rewardInt * tasksInt,
    platformFeePercent: settings.platformFeePercent,
    platformFeeKes: Math.ceil((rewardInt * tasksInt * settings.platformFeePercent) / 100),
    totalBudgetKes:
      rewardInt * tasksInt +
      Math.ceil((rewardInt * tasksInt * settings.platformFeePercent) / 100),
  };
  try {
    costBreakdown = calculateCampaignCost(rewardInt, tasksInt, settings.platformFeePercent);
  } catch {
    // Use fallback above while typing
  }

  const walletBalanceKes = wallet?.balanceKes ?? 0;
  const hasSufficientFunds = walletBalanceKes >= costBreakdown.totalBudgetKes;

  const validateCurrentStep = (): boolean => {
    setErrorMsg("");
    if (step === 1) {
      if (!title.trim() || title.trim().length < 5) {
        setErrorMsg("Campaign title must be at least 5 characters.");
        return false;
      }
      if (!description.trim() || description.trim().length < 15) {
        setErrorMsg("Please provide a clear description (at least 15 characters).");
        return false;
      }
    }
    if (step === 2) {
      if (rewardInt < settings.minRewardPerTaskKes) {
        setErrorMsg(`Minimum reward per task is KES ${settings.minRewardPerTaskKes}.`);
        return false;
      }
      if (tasksInt < settings.minCampaignTasks) {
        setErrorMsg(`Minimum number of tasks is ${settings.minCampaignTasks}.`);
        return false;
      }
    }
    if (step === 3) {
      if (!instructions.trim() || instructions.trim().length < 10) {
        setErrorMsg("Please provide clear instructions for reviewers.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleLaunchCampaign = async () => {
    setErrorMsg("");
    if (!advertiser) return;

    if (!hasSufficientFunds) {
      setErrorMsg(
        `Insufficient wallet balance. Required: KES ${costBreakdown.totalBudgetKes.toLocaleString()}, Available: KES ${walletBalanceKes.toLocaleString()}. Please top up your wallet first.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      createAndFundCampaign(advertiser.id, {
        title,
        campaignType,
        description,
        instructions,
        rewardPerTaskKes: rewardInt,
        maxTasks: tasksInt,
        minWords: Math.trunc(Number(minWords) || 30),
        requireScreenshot,
        requireReceipt,
        city,
        deviceType,
        startDate: new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });

      router.push("/advertiser/campaigns?created=1");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create campaign.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdvertiserNav />

      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Create Sponsored Campaign
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Step {step} of 4 — Funds are held in atomic KES escrow and released only when submissions are approved.
          </p>
        </div>

        {/* Stepper Progress Pills */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "1. Details" },
            { num: 2, label: "2. Reward & Budget" },
            { num: 3, label: "3. Proof Rules" },
            { num: 4, label: "4. Preview & Escrow" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => {
                if (item.num < step || validateCurrentStep()) {
                  setStep(item.num as 1 | 2 | 3 | 4);
                }
              }}
              className={`py-2.5 px-2 rounded-[12px] text-xs font-bold text-center transition-all cursor-pointer border ${
                step === item.num
                  ? "bg-[var(--brand-blue)] text-white border-[var(--brand-blue)] shadow-xs"
                  : step > item.num
                  ? "bg-emerald-500/10 text-[var(--accent-green)] border-emerald-500/30"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: DETAILS */}
        {step === 1 && (
          <Card padding="lg" className="space-y-5">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
              Step 1: Campaign Details & Targeting
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Savannah Roast Westlands Dining & Coffee Experience"
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Campaign Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CAMPAIGN_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setCampaignType(ct.value)}
                      className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer ${
                        campaignType === ct.value
                          ? "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)] text-[var(--text-primary)]"
                          : "bg-[var(--bg-card-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-blue)]/50"
                      }`}
                    >
                      <p className="text-xs font-bold text-[var(--text-primary)]">{ct.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                        {ct.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Campaign Summary / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what reviewers or testers will evaluate..."
                  className="w-full p-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Target Location
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 px-3 text-xs sm:text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium"
                  >
                    <option value="All Kenya">All Kenya</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Eldoret">Eldoret</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Target Device
                  </label>
                  <select
                    value={deviceType}
                    onChange={(e) =>
                      setDeviceType(e.target.value as "all" | "android" | "ios" | "desktop")
                    }
                    className="w-full h-11 px-3 text-xs sm:text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium"
                  >
                    <option value="all">All Devices</option>
                    <option value="android">Android Only</option>
                    <option value="ios">iOS Only</option>
                    <option value="desktop">Desktop / Web</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 px-3 text-xs sm:text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                variant="primary"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Reward & Budget
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: REWARD & BUDGET (WITH LIVE COST BREAKDOWN) */}
        {step === 2 && (
          <Card padding="lg" className="space-y-5">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
              Step 2: Task Reward & Live Escrow Cost Breakdown
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Reward per Approved Task (Whole KES)
                </label>
                <input
                  type="number"
                  min={settings.minRewardPerTaskKes}
                  step={1}
                  value={rewardPerTaskInput}
                  onChange={(e) => setRewardPerTaskInput(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-blue)]"
                />
                <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                  Minimum KES {settings.minRewardPerTaskKes} per task
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Maximum Tasks (Target Submissions)
                </label>
                <input
                  type="number"
                  min={settings.minCampaignTasks}
                  step={1}
                  value={maxTasksInput}
                  onChange={(e) => setMaxTasksInput(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-blue)]"
                />
                <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                  Minimum {settings.minCampaignTasks} tasks
                </span>
              </div>
            </div>

            {/* Live Cost Breakdown Box */}
            <div className="p-5 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  Task Rewards Escrow (KES {costBreakdown.rewardPerTaskKes.toLocaleString()} ×{" "}
                  {costBreakdown.maxTasks} tasks)
                </span>
                <span className="font-bold text-[var(--text-primary)] numeral-bold">
                  KES {costBreakdown.rewardsSubtotalKes.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  Earnora Platform & Moderation Fee ({costBreakdown.platformFeePercent}%)
                </span>
                <span className="font-bold text-[var(--text-primary)] numeral-bold">
                  KES {costBreakdown.platformFeeKes.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-sm font-extrabold text-[var(--text-primary)]">
                  Total Required Budget
                </span>
                <span className="text-lg font-extrabold text-[var(--brand-blue)] numeral-bold">
                  KES {costBreakdown.totalBudgetKes.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Wallet Sufficiency Banner */}
            <div
              className={`p-4 rounded-[14px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                hasSufficientFunds
                  ? "bg-emerald-500/10 border-emerald-500/30 text-[var(--accent-green)]"
                  : "bg-amber-500/10 border-amber-500/30 text-[var(--accent-amber)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 shrink-0" />
                <span>
                  Your Available Wallet Balance:{" "}
                  <strong className="numeral-bold">
                    KES {walletBalanceKes.toLocaleString()}
                  </strong>{" "}
                  {hasSufficientFunds
                    ? "(Sufficient for escrow hold)"
                    : `(Short by KES ${(costBreakdown.totalBudgetKes - walletBalanceKes).toLocaleString()})`}
                </span>
              </div>

              {!hasSufficientFunds && (
                <Link
                  href="/advertiser/wallet"
                  className="px-3.5 py-2 rounded-[10px] bg-[var(--brand-blue)] text-white font-bold text-xs text-center shrink-0"
                >
                  Top Up Wallet Now
                </Link>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Proof Requirements
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: PROOF REQUIREMENTS */}
        {step === 3 && (
          <Card padding="lg" className="space-y-5">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
              Step 3: Proof & Verification Requirements
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Task Instructions (One guideline per line)
                </label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-blue)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[var(--brand-blue)]" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Minimum Words
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={minWords}
                    onChange={(e) => setMinWords(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-bold rounded-[10px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>

                <label className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireScreenshot}
                    onChange={(e) => setRequireScreenshot(e.target.checked)}
                    className="mt-0.5 rounded accent-[var(--brand-blue)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      Require Screenshot
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      App screen or service proof
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireReceipt}
                    onChange={(e) => setRequireReceipt(e.target.checked)}
                    className="mt-0.5 rounded accent-[var(--brand-blue)]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      Require Receipt Photo
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Original visit or M-Pesa receipt
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Preview & Launch
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: PREVIEW & LAUNCH */}
        {step === 4 && (
          <Card padding="lg" className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
                Step 4: Preview & Escrow Launch
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Here is how your sponsored task will appear on the Earnora Earn page once approved.
              </p>
            </div>

            {/* Live Task Card Preview (Matches exact Earn page task card style) */}
            <div className="rounded-[20px] bg-white border border-blue-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0A3D91] border border-blue-200/50">
                    {getCampaignTypeTag(campaignType)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200/50">
                    Sponsored
                  </span>
                  <span className="text-[11px] text-[#6B7A99] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1E6FD9]" />
                    <span>~5 mins</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#0F1F3D]">{title}</h3>
                <p className="text-xs text-[#6B7A99] leading-relaxed">{description}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#6B7A99] uppercase font-semibold block">
                    Bounty Reward
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#16A34A] numeral-bold">
                    KES {costBreakdown.rewardPerTaskKes}
                  </span>
                </div>
                <Badge variant="blue" size="sm">
                  {costBreakdown.maxTasks} Tasks
                </Badge>
              </div>
            </div>

            {/* Final Escrow Summary */}
            <div className="p-4 rounded-[16px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Rewards Held in Escrow:</span>
                <span className="font-bold text-[var(--text-primary)] numeral-bold">
                  KES {costBreakdown.rewardsSubtotalKes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">
                  Platform Fee ({costBreakdown.platformFeePercent}%):
                </span>
                <span className="font-bold text-[var(--text-primary)] numeral-bold">
                  KES {costBreakdown.platformFeeKes.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)] text-sm font-extrabold">
                <span className="text-[var(--text-primary)]">Total Deducted from Wallet Now:</span>
                <span className="text-[var(--accent-green)] numeral-bold">
                  KES {costBreakdown.totalBudgetKes.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
              <span>
                By launching this campaign, you confirm compliance with Earnora&apos;s{" "}
                <Link href="/ad-review-policy" className="text-[var(--brand-blue)] font-bold underline">
                  Ad & Review Policy
                </Link>
                . Reviewers are rewarded for honest feedback regardless of star rating.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              {hasSufficientFunds ? (
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handleLaunchCampaign}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Fund Escrow (KES {costBreakdown.totalBudgetKes.toLocaleString()}) & Submit
                </Button>
              ) : (
                <Link href="/advertiser/wallet">
                  <Button variant="primary" size="lg">
                    Top Up Wallet to Launch (Need KES{" "}
                    {(costBreakdown.totalBudgetKes - walletBalanceKes).toLocaleString()} more)
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
