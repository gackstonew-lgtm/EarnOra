"use client";

import React, { useState } from "react";
import { Building2, Plus, BarChart3, Users, DollarSign, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui";

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
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1F3D] tracking-tight">
            Business Campaign Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7A99] mt-0.5">
            Sponsor honest Kenyan reviews, manage campaign budgets, and analyze genuine customer sentiment.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          New Campaign
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-[20px] bg-white border border-blue-100/70 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)]">
          <span className="text-[10px] text-[#6B7A99] font-semibold block">Active Campaigns</span>
          <span className="text-xl font-black text-[#0F1F3D] mt-1 block">
            {campaigns.length}
          </span>
        </div>
        <div className="p-4 rounded-[20px] bg-white border border-blue-100/70 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)]">
          <span className="text-[10px] text-[#6B7A99] font-semibold block">Total Funded</span>
          <span className="text-xl font-black text-[#16A34A] mt-1 block numeral-bold">
            KES 85,000
          </span>
        </div>
        <div className="p-4 rounded-[20px] bg-white border border-blue-100/70 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)]">
          <span className="text-[10px] text-[#6B7A99] font-semibold block">Total Reviews</span>
          <span className="text-xl font-black text-[#0F1F3D] mt-1 block">
            80 Verified
          </span>
        </div>
        <div className="p-4 rounded-[20px] bg-white border border-blue-100/70 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)]">
          <span className="text-[10px] text-[#6B7A99] font-semibold block">Avg Rating</span>
          <span className="text-xl font-black text-amber-500 mt-1 block">
            4.4 / 5.0
          </span>
        </div>
      </div>

      {/* Active Campaigns Card */}
      <div className="rounded-[20px] bg-white border border-blue-100/70 p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0F1F3D]">
            Active Review Campaigns
          </h2>
          <span className="text-xs text-[#6B7A99]">Real-time M-Pesa Funding</span>
        </div>

        <div className="divide-y divide-slate-100">
          {campaigns.map((camp) => (
            <div key={camp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#0A3D91]">
                    {camp.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A]">
                    {camp.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#0F1F3D]">{camp.title}</h3>
                <p className="text-xs text-[#6B7A99]">
                  {camp.approvedReviews} of {camp.targetReviews} verified reviews collected
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <span className="text-sm sm:text-base font-extrabold text-[#0F1F3D] numeral-bold">
                  KES {camp.spent.toLocaleString()} / KES {camp.budget.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#16A34A] font-semibold">
                  {Math.round((camp.spent / camp.budget) * 100)}% budget utilized
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0F1F3D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white border border-blue-100/80 p-6 sm:p-7 shadow-2xl text-[#0F1F3D] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0F1F3D]">
                Launch New Review Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7A99] hover:bg-[#EEF3FF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F1F3D]">
                  Campaign Title / Establishment Name
                </label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. CJ's Restaurant Waterfront Karen"
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] placeholder-[#6B7A99] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F1F3D]">
                    Total Budget (KES)
                  </label>
                  <input
                    type="number"
                    min={5000}
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] font-bold focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F1F3D]">
                    Reward / Review (KES)
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={rewardPerReview}
                    onChange={(e) => setRewardPerReview(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] font-bold focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Create & Fund Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
