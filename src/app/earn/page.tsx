"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle,
  X,
} from "lucide-react";
import { INITIAL_TASKS } from "@/lib/mock-data";
import { EARNING_CARDS } from "@/lib/constants";
import { ReviewTask } from "@/lib/types";
import { Button } from "@/components/ui";
import { isAdsEnabled } from "@/lib/ads/config";
import { getActiveSponsoredTasksForEarnPage } from "@/lib/ads/store";

function EarnContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState("");
  const [minReward, setMinReward] = useState<number>(0);
  const [activeTaskModal, setActiveTaskModal] = useState<ReviewTask | null>(null);
  const [sponsoredTasks, setSponsoredTasks] = useState<ReviewTask[]>([]);

  useEffect(() => {
    if (!isAdsEnabled()) return;
    const loadSponsored = () => setSponsoredTasks(getActiveSponsoredTasksForEarnPage());
    loadSponsored();
    window.addEventListener("earnora_ads_state_updated", loadSponsored);
    return () => window.removeEventListener("earnora_ads_state_updated", loadSponsored);
  }, []);

  const allTasks = isAdsEnabled()
    ? [
        ...sponsoredTasks,
        ...INITIAL_TASKS.filter((t) => !sponsoredTasks.some((s) => s.id === t.id)),
      ]
    : INITIAL_TASKS;

  const filteredTasks = allTasks.filter((task) => {
    const matchesCategory =
      selectedCategory === "all" || task.categoryId === selectedCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.categoryTag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReward = task.rewardKes >= minReward;
    return matchesCategory && matchesSearch && matchesReward;
  });

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
          Explore Earning Tasks
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Select verified review bounties, surveys, and testing opportunities.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotel, app, brand, or local service..."
            className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)] transition-all"
          />
        </div>

        {/* Min Reward Filter Selector */}
        <div className="flex items-center gap-2">
          <select
            value={minReward}
            onChange={(e) => setMinReward(Number(e.target.value))}
            className="h-11 px-3.5 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)] transition-all cursor-pointer"
          >
            <option value={0}>All Rewards</option>
            <option value={200}>KES 200+</option>
            <option value={300}>KES 300+</option>
            <option value={500}>KES 500+</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[var(--brand-blue)] text-white shadow-xs"
              : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
          }`}
        >
          All ({allTasks.length})
        </button>
        {EARNING_CARDS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[var(--brand-blue)] text-white shadow-xs"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-[20px] bg-white border border-blue-100/70 p-6 shadow-xs">
            <Sparkles className="w-8 h-8 text-[#1E6FD9] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#0F1F3D]">
              No matching tasks found
            </h3>
            <p className="text-xs text-[#6B7A99] mt-1">
              Try adjusting your search query or reward filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setActiveTaskModal(task)}
              className="cursor-pointer rounded-[20px] bg-white border border-blue-100/70 p-5 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)] hover:shadow-[0_12px_32px_rgba(30,111,217,0.12)] hover:border-[#1E6FD9]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0A3D91] border border-blue-200/50">
                    {task.categoryTag}
                  </span>
                  {task.isSponsored && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200/50">
                      Sponsored
                    </span>
                  )}
                  <span className="text-[11px] text-[#6B7A99] flex items-center gap-1 ml-auto sm:ml-0">
                    <Clock className="w-3 h-3 text-[#1E6FD9]" />
                    <span>~{task.estimatedMinutes} mins</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#0F1F3D] group-hover:text-[#1E6FD9] transition-colors">
                  {task.title}
                </h3>

                <p className="text-xs text-[#6B7A99] line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Reward Badge + Start Button */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#6B7A99] uppercase font-semibold block">
                    Bounty Reward
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#16A34A] numeral-bold">
                    KES {task.rewardKes}
                  </span>
                </div>

                <button className="px-4 py-2 rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] group-hover:bg-[var(--brand-blue)] text-[var(--brand-blue)] group-hover:text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer">
                  <span>Start Task</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Details Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-[#0F1F3D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white border border-blue-100/80 p-6 shadow-2xl text-[#0F1F3D] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0A3D91]">
                  {activeTaskModal.categoryTag}
                </span>
                <h2 className="text-lg font-bold mt-2 leading-snug text-[#0F1F3D]">
                  {activeTaskModal.title}
                </h2>
                <p className="text-xs text-[#6B7A99]">
                  By {activeTaskModal.entityName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-extrabold text-[#16A34A] numeral-bold block">
                  KES {activeTaskModal.rewardKes}
                </span>
                <span className="text-[10px] text-[#6B7A99]">Verified payout</span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-[14px] bg-[#EEF3FF] border border-blue-100/70 text-xs text-[#0F1F3D] leading-relaxed">
              {activeTaskModal.description}
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-[#0F1F3D] uppercase tracking-wider">
                Submission Guidelines & Rules:
              </h4>
              <ul className="space-y-1.5 text-xs text-[#6B7A99]">
                {activeTaskModal.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#6B7A99] hover:text-[#0F1F3D] cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/earn/submit?task=${activeTaskModal.id}`}
                className="px-5 py-2.5 rounded-[12px] bg-[var(--brand-blue)] text-white font-bold text-xs hover:opacity-95 transition-all shadow-xs"
              >
                Proceed to Write Review
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EarnPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs text-[#6B7A99]">
          Loading earning tasks...
        </div>
      }
    >
      <EarnContent />
    </Suspense>
  );
}
