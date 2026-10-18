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

function SubmitReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("task") || "task-hotel-01";
  const { user, updateProfile } = useAuth();

  const task = INITIAL_TASKS.find((t) => t.id === taskId) || INITIAL_TASKS[0];

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoAttestation, setPhotoAttestation] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Word count counter
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const minWordsRequired = task.requirements.minWords || 50;

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

    if (hasPhoto && !photoAttestation) {
      setErrorMsg(
        "You must check 'I took this photo myself' to attest copyright ownership."
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Add bounty reward to pending balance (not available until approved)
      if (user) {
        updateProfile({
          pendingBalance: user.pendingBalance + task.rewardKes,
        });
      }
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 1200);
  };

  if (submittedSuccess) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Review Submitted!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Your review for <strong>{task.title}</strong> has entered our moderation queue.
            Status: <span className="font-bold text-amber-500">Pending Review</span>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Reward Bounty:</span>
            <span className="font-bold text-amber-500 numeral-bold">KES {task.rewardKes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Moderation:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Within 24 Hours</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            Pending rewards are securely reserved and credited to your available balance upon approval.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/activity"
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-[#132347] text-xs font-bold text-slate-800 dark:text-slate-200 text-center"
          >
            View in Activity
          </Link>
          <Link
            href="/earn"
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold text-center"
          >
            Browse More Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 max-w-xl mx-auto space-y-6">
      {/* Task Heading */}
      <div>
        <Link
          href="/earn"
          className="text-xs font-semibold text-emerald-500 hover:underline mb-1 inline-block"
        >
          ← Back to Tasks
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Write Honest Review
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {task.title} • Bounty: <strong className="text-emerald-500">KES {task.rewardKes}</strong>
        </p>
      </div>

      {/* Rules Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Review Guidelines:</strong> Must be first-hand, unbiased, and include genuine pros & cons. Minimum {minWordsRequired} words. Fake or AI copy-pasted reviews are rejected during moderation.
        </span>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* Star Rating */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-amber-400 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-700"
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              {rating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Review Headline
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Great coffee, but seating wait was longer than expected"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Written Review */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Experience
            </label>
            <span
              className={`text-[11px] font-semibold ${
                wordCount >= minWordsRequired ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {wordCount} / {minWordsRequired} words minimum
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your actual first-hand experience in detail. Mention specific items, customer service, pricing, and ambience..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Pros (What was good?)</span>
            </label>
            <input
              type="text"
              required
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="e.g. Fast Wi-Fi, friendly staff"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-rose-500 mb-1.5">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Cons (Needs improvement)</span>
            </label>
            <input
              type="text"
              required
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="e.g. Limited parking, slow billing"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Photo Upload & Attestation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-500" />
              <span>Attach Original Receipt / Photo (Optional)</span>
            </span>
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {hasPhoto ? "Remove" : "+ Simulate Photo"}
            </button>
          </div>

          {hasPhoto && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulated receipt: <strong>receipt_photo_01.jpg (1.2 MB)</strong></span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={photoAttestation}
                  onChange={(e) => setPhotoAttestation(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span>I took this photo myself and own the rights to submit it.</span>
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Review for Moderation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function SubmitReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-slate-400">
          Loading submission form...
        </div>
      }
    >
      <SubmitReviewContent />
    </Suspense>
  );
}

