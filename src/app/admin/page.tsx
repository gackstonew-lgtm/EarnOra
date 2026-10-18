"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { ModerationStatus } from "@/lib/types";

interface QueuedReview {
  id: string;
  reviewer: string;
  phone: string;
  taskTitle: string;
  rating: number;
  wordCount: number;
  hasPhoto: boolean;
  duplicateScore: number; // 0 to 100%
  status: ModerationStatus;
  headline: string;
  textSnippet: string;
  rewardKes: number;
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
      duplicateScore: 2, // low fraud risk
      status: "pending_review",
      headline: "Great coffee, but seating wait was longer than expected",
      textSnippet: "Visited on Tuesday afternoon. Barista gave great recommendations on Kenyan single origin beans. The seating area upstairs was well lit, though Wi-Fi experienced minor drops around 3 PM.",
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
      duplicateScore: 94, // HIGH FRAUD RISK
      status: "pending_review",
      headline: "Good app best app in Kenya download now",
      textSnippet: "This app is very good and nice I like it so much best app download now very good app is very good and nice I like it so much best app download now.",
      rewardKes: 300,
    },
  ]);

  const [activeTab, setActiveTab] = useState<"moderation" | "fraud" | "audits">("moderation");

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: decision } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Admin & Moderation Desk
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Role-based review verification, copy-paste fraud detection, and payout approval.
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "moderation"
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Review Moderation Queue ({reviews.filter((r) => r.status === "pending_review").length})
        </button>
        <button
          onClick={() => setActiveTab("fraud")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "fraud"
              ? "bg-rose-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Fraud Flags (1 High Risk)
        </button>
      </div>

      {/* Review Moderation Queue */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className={`p-5 rounded-[22px] bg-white dark:bg-[#0F1A2E] border ${
              rev.duplicateScore > 70
                ? "border-rose-500/50 dark:border-rose-500/40"
                : "border-slate-200 dark:border-slate-800"
            } shadow-sm space-y-3`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                  {rev.reviewer} ({rev.phone})
                </span>
                <p className="text-xs text-slate-400">
                  Task: <strong>{rev.taskTitle}</strong> • Bounty: KES {rev.rewardKes}
                </p>
              </div>

              {/* Fraud Risk Tag */}
              {rev.duplicateScore > 70 ? (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Flagged: {rev.duplicateScore}% Duplicate Risk</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  Verified Genuine ({rev.wordCount} words)
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-slate-700/60 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                &ldquo;{rev.headline}&rdquo;
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {rev.textSnippet}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-400">
                Current Status:{" "}
                <strong
                  className={
                    rev.status === "approved"
                      ? "text-emerald-500"
                      : rev.status === "rejected"
                      ? "text-rose-500"
                      : "text-amber-500"
                  }
                >
                  {rev.status.toUpperCase()}
                </strong>
              </span>

              {rev.status === "pending_review" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(rev.id, "rejected")}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleDecision(rev.id, "approved")}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Credit Wallet</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
