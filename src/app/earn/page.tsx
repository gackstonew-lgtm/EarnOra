"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Star,
  CheckCircle,
} from "lucide-react";
import { INITIAL_TASKS } from "@/lib/mock-data";
import { EARNING_CARDS } from "@/lib/constants";
import { ReviewTask } from "@/lib/types";

function EarnContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState("");
  const [minReward, setMinReward] = useState<number>(0);
  const [activeTaskModal, setActiveTaskModal] = useState<ReviewTask | null>(null);

  const filteredTasks = INITIAL_TASKS.filter((task) => {
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
    <div className="space-y-5">
      {/* Page Title & Search Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Explore Earning Tasks
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select verified review bounties, surveys, and testing opportunities.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotel, app, brand, or local service..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Min Reward Filter Selector */}
        <div className="flex items-center gap-2">
          <select
            value={minReward}
            onChange={(e) => setMinReward(Number(e.target.value))}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
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
          className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          All ({INITIAL_TASKS.length})
        </button>
        {EARNING_CARDS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-6">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No matching tasks found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or reward filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setActiveTaskModal(task)}
              className="cursor-pointer rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500">
                    {task.categoryTag}
                  </span>
                  {task.isSponsored && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400">
                      Sponsored
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                    <Clock className="w-3 h-3" />
                    <span>~{task.estimatedMinutes} mins</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Reward Badge + Start Button */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/80 shrink-0 gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Bounty Reward
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-500 numeral-bold">
                    KES {task.rewardKes}
                  </span>
                </div>

                <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#132347] group-hover:bg-emerald-500 text-slate-800 dark:text-slate-200 group-hover:text-slate-950 font-bold text-xs transition-colors flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-700 p-6 shadow-2xl text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500">
                  {activeTaskModal.categoryTag}
                </span>
                <h2 className="text-lg font-bold mt-2 leading-snug">
                  {activeTaskModal.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By {activeTaskModal.entityName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-emerald-500 numeral-bold block">
                  KES {activeTaskModal.rewardKes}
                </span>
                <span className="text-[10px] text-slate-400">Verified payout</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeTaskModal.description}
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Submission Guidelines & Rules:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {activeTaskModal.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
              <Link
                href={`/earn/submit?task=${activeTaskModal.id}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
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
        <div className="py-12 text-center text-xs text-slate-400">
          Loading earning tasks...
        </div>
      }
    >
      <EarnContent />
    </Suspense>
  );
}

