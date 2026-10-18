"use client";

import React, { useState } from "react";
import { Building2, Plus, BarChart3, Users, DollarSign, CheckCircle2, ShieldCheck } from "lucide-react";
import { EARNING_CARDS } from "@/lib/constants";

export default function BusinessPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignBudget, setCampaignBudget] = useState("25000");
  const [rewardPerReview, setRewardPerReview] = useState("350");
  const [targetReviews, setTargetReviews] = useState("50");

  const [campaigns, setCampaigns] = useState([
    {
      id: "camp-01",
      title: "Java House Kimathi St Experience",
      category: "Hotels & Restaurants",
      budget: 50000,
      spent: 22500,
      targetReviews: 100,
      approvedReviews: 45,
      status: "Active",
    },
    {
      id: "camp-02",
      title: "Loop Digital Banking Onboarding",
      category: "Telco & Fintech",
      budget: 35000,
      spent: 17500,
      targetReviews: 70,
      approvedReviews: 35,
      status: "Active",
    },
  ]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp = {
      id: `camp-${Date.now()}`,
      title: campaignTitle,
      category: "Local Services",
      budget: Number(campaignBudget),
      spent: 0,
      targetReviews: Number(targetReviews),
      approvedReviews: 0,
      status: "Active",
    };
    setCampaigns([newCamp, ...campaigns]);
    setShowCreateModal(false);
    setCampaignTitle("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Business Campaign Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sponsor honest Kenyan reviews, manage campaign budgets, and analyze genuine customer sentiment.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 font-semibold block">Active Campaigns</span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
            {campaigns.length}
          </span>
        </div>
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 font-semibold block">Total Funded</span>
          <span className="text-lg font-black text-emerald-500 mt-1 block numeral-bold">
            KES 85,000
          </span>
        </div>
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 font-semibold block">Total Reviews</span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
            80 Verified
          </span>
        </div>
        <div className="p-4 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 font-semibold block">Avg Rating</span>
          <span className="text-lg font-black text-amber-400 mt-1 block">
            4.4 / 5.0
          </span>
        </div>
      </div>

      {/* Campaigns Table / Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Active Review Campaigns
        </h2>
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-5 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                  {camp.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                  {camp.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                {camp.status}
              </span>
            </div>

            {/* Budget & Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Approved: {camp.approvedReviews} / {camp.targetReviews} reviews
                </span>
                <span>
                  KES {camp.spent.toLocaleString()} / KES {camp.budget.toLocaleString()} spent
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (camp.approvedReviews / camp.targetReviews) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="text-base font-bold">Create Review Bounty Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Sarit Centre Branch Launch Feedback"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Total M-Pesa Budget (KES)</label>
                <input
                  type="number"
                  required
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Target Number of Reviews</label>
                <input
                  type="number"
                  required
                  value={targetReviews}
                  onChange={(e) => setTargetReviews(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Create & Fund via M-Pesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
