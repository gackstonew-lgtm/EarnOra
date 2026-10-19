"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { INITIAL_TASKS } from "@/lib/mock-data";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui";
import { isAdsEnabled } from "@/lib/ads/config";
import {
  getActiveSponsoredTasksForEarnPage,
  getAdsState,
  submitSponsoredTaskProof,
} from "@/lib/ads/store";
import { validateProofFile } from "@/lib/ads/validation";

function SubmitReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("task") || "task-hotel-01";
  const { user, updateProfile } = useAuth();

  const allAvailableTasks = isAdsEnabled()
    ? [...getActiveSponsoredTasksForEarnPage(), ...INITIAL_TASKS]
    : INITIAL_TASKS;

  const task = allAvailableTasks.find((t) => t.id === taskId) || INITIAL_TASKS[0];

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [hasPhoto, setHasPhoto] = useState(task.requirements.requirePhoto);
  const [photoAttestation, setPhotoAttestation] = useState(false);
  const [proofFileData, setProofFileData] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrlOrContent?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const minWordsRequired = task.requirements.minWords || 50;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) {
      setProofFileData(null);
      return;
    }
    const validation = validateProofFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!validation.valid) {
      setErrorMsg(validation.error || "Invalid proof file.");
      e.target.value = "";
      setProofFileData(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofFileData({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrlOrContent: typeof reader.result === "string" ? reader.result : undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || title.length < 5) {
      setErrorMsg("Review headline must be at least 5 characters.");
      return;
    }

    if (minWordsRequired > 0 && wordCount < minWordsRequired) {
      setErrorMsg(
        `Review text must be at least ${minWordsRequired} words to qualify. Currently: ${wordCount} words.`
      );
      return;
    }

    if (!pros.trim() || !cons.trim()) {
      setErrorMsg("Please include at least one pro and one con of your experience.");
      return;
    }

    if (task.requirements.requirePhoto && !hasPhoto) {
      setErrorMsg("This campaign requires attaching a screenshot or receipt proof.");
      return;
    }

    if (hasPhoto && !photoAttestation) {
      setErrorMsg(
        "You must check 'I took this photo myself' to attest copyright ownership."
      );
      return;
    }

    const isAdvertiserCampaign =
      isAdsEnabled() &&
      getAdsState().campaigns.some((c) => c.id === task.id);

    if (isAdvertiserCampaign) {
      try {
        submitSponsoredTaskProof({
          campaignId: task.id,
          userProfileId: user?.id || "usr_ke_98721",
          username: user?.username || "Baraka_Ke",
          userPhone: user?.phoneNumber || "+254712345678",
          rating,
          headline: title,
          reviewText: content,
          pros,
          cons,
          proofFile: proofFileData || undefined,
        });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to submit task proof.");
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (user) {
        updateProfile({
          pendingBalance: user.pendingBalance + task.rewardKes,
        });
      }
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 800);
  };

  if (submittedSuccess) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#16A34A] mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F1F3D]">
            Review Submitted!
          </h2>
          <p className="text-xs text-[#6B7A99] mt-2 leading-relaxed">
            Your review for <strong>{task.title}</strong> has entered our moderation queue.
            Status: <span className="font-bold text-amber-600">Pending Review</span>.
          </p>
        </div>

        <div className="p-4 rounded-[16px] bg-[#EEF3FF] border border-blue-100/70 text-xs text-[#0F1F3D] text-left space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#6B7A99]">Pending Bounty:</span>
            <span className="font-bold text-[#16A34A] numeral-bold">+KES {task.rewardKes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7A99]">Estimated Verification:</span>
            <span className="font-semibold text-[#0F1F3D]">Under 12 hours</span>
          </div>
        </div>

        <div className="pt-2 flex gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => router.push("/earn")}
          >
            Review Another Task
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Task Summary Banner */}
      <div className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0A3D91]">
              {task.categoryTag}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-[#0F1F3D] mt-2 leading-snug">
              Review: {task.title}
            </h1>
            <p className="text-xs text-[#6B7A99]">
              Sponsored task by <strong>{task.entityName}</strong>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg sm:text-xl font-black text-[#16A34A] numeral-bold block">
              KES {task.rewardKes}
            </span>
            <span className="text-[10px] text-[#6B7A99]">Payout on Approval</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-[12px] bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="rounded-[20px] bg-white border border-blue-100/70 p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-6">
        {/* Overall Star Rating */}
        <div>
          <label className="block text-xs font-semibold text-[#0F1F3D] mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-bold text-[#0F1F3D]">
              {rating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#0F1F3D]">
            Review Headline
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Great coffee and fast Wi-Fi, but slightly slow weekend service"
            className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] placeholder-[#6B7A99] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
          />
        </div>

        {/* Detailed Experience Body */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#0F1F3D]">
              Detailed First-Hand Experience
            </label>
            <span
              className={`text-[11px] font-bold ${
                wordCount >= minWordsRequired
                  ? "text-[#16A34A]"
                  : "text-[#6B7A99]"
              }`}
            >
              {wordCount} / {minWordsRequired} words min
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your actual first-hand experience in detail. Mention specific items ordered, staff interaction, ambiance, pricing, or ease of use..."
            className="w-full p-3.5 text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] placeholder-[#6B7A99] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all resize-y"
          />
        </div>

        {/* Structured Pros and Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F1F3D] flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Pros (What was good?)</span>
            </label>
            <textarea
              required
              rows={2}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="e.g. Crisp espresso, friendly greeting, clean washrooms"
              className="w-full p-3 text-xs sm:text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] placeholder-[#6B7A99] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F1F3D] flex items-center gap-1">
              <ThumbsDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Cons (What needs improvement?)</span>
            </label>
            <textarea
              required
              rows={2}
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="e.g. Limited parking, slow bill payment during lunch hour"
              className="w-full p-3 text-xs sm:text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] placeholder-[#6B7A99] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
            />
          </div>
        </div>

        {/* Optional Photo Proof with Attestation */}
        <div className="p-4 rounded-[14px] bg-[#EEF3FF]/70 border border-blue-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1E6FD9]" />
              <span className="text-xs font-bold text-[#0F1F3D]">
                Photo Proof (+20% Bounty Bonus)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasPhoto}
                onChange={(e) => setHasPhoto(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E6FD9]" />
            </label>
          </div>

          {hasPhoto && (
            <div className="pt-2 border-t border-blue-100 space-y-2 animate-in fade-in duration-150">
              <label className="block border-2 border-dashed border-blue-200 rounded-[12px] p-4 text-center bg-white cursor-pointer hover:border-[#1E6FD9] transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <Camera className="w-6 h-6 text-[#1E6FD9] mx-auto mb-1" />
                <p className="text-xs font-semibold text-[#0F1F3D]">
                  {proofFileData
                    ? `Attached: ${proofFileData.name} (${Math.round(proofFileData.size / 1024)} KB)`
                    : "Tap to attach receipt, screenshot or photo"}
                </p>
                <p className="text-[10px] text-[#6B7A99]">
                  JPEG, PNG, WEBP or PDF up to 5MB. Original proof only.
                </p>
              </label>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={photoAttestation}
                  onChange={(e) => setPhotoAttestation(e.target.checked)}
                  className="mt-0.5 rounded text-[#1E6FD9] focus:ring-[#1E6FD9] accent-[#1E6FD9]"
                />
                <span className="text-xs text-[#6B7A99]">
                  I certify that I took this photo myself during my visit.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit for Moderation (KES {task.rewardKes})
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-[#6B7A99]">
          Loading review form...
        </div>
      }
    >
      <SubmitReviewContent />
    </Suspense>
  );
}
