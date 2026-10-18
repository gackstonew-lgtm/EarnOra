"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
} from "lucide-react";
import { ModerationStatus } from "@/lib/types";
import { Button } from "@/components/ui";

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
      duplicateScore: 94,
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
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1F3D] tracking-tight">
          Admin & Moderation Desk
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7A99] mt-0.5">
          Role-based review verification, copy-paste fraud detection, and payout approval.
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-blue-100 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-3.5 py-2 rounded-[10px] transition-colors cursor-pointer ${
            activeTab === "moderation"
              ? "bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white shadow-blue-btn"
              : "text-[#6B7A99] hover:text-[#0F1F3D] hover:bg-[#EEF3FF]"
          }`}
        >
          Review Moderation Queue ({reviews.filter((r) => r.status === "pending_review").length})
        </button>
        <button
          onClick={() => setActiveTab("fraud")}
          className={`px-3.5 py-2 rounded-[10px] transition-colors cursor-pointer ${
            activeTab === "fraud"
              ? "bg-red-500 text-white shadow-xs"
              : "text-[#6B7A99] hover:text-[#0F1F3D] hover:bg-[#EEF3FF]"
          }`}
        >
          Fraud Alerts
        </button>
      </div>

      {/* Reviews Queue List */}
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
    </div>
  );
}
