"use client";

import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Smartphone,
  MapPin,
  CreditCard,
  Building2,
  ClipboardCheck,
  PackageCheck,
  PlayCircle,
  Flame,
  Users,
  ArrowRight,
} from "lucide-react";
import { EarningCardConfig } from "@/lib/types";

interface EarningCardProps {
  card: EarningCardConfig;
  userEarnedKes?: number;
}

const iconMap: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Smartphone,
  MapPin,
  CreditCard,
  Building2,
  ClipboardCheck,
  PackageCheck,
  PlayCircle,
  Flame,
  Users,
};

export const EarningCard: React.FC<EarningCardProps> = ({
  card,
  userEarnedKes = 0,
}) => {
  const IconComponent = iconMap[card.iconName] || ArrowRight;

  return (
    <Link
      href={card.targetRoute}
      className="group block relative rounded-[20px] bg-[var(--bg-primary)] p-5 border border-[var(--border-subtle)] shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] hover:shadow-[0_12px_32px_rgba(30,111,217,0.12)] hover:border-[#1E6FD9]/40 transition-all duration-200 hover:-translate-y-1 active:scale-[0.99]"
    >
      {/* Top Row: Icon + Title & Category Tag */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] bg-[var(--bg-input)] text-[#1E6FD9] flex items-center justify-center shrink-0 border border-[var(--border-subtle)] shadow-xs group-hover:scale-105 group-hover:bg-[#EAF3FF] transition-all">
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)] tracking-tight leading-snug group-hover:text-[#1E6FD9] transition-colors font-display">
              {card.title}
            </h3>
            <p className="text-xs font-bold text-[#15803D] dark:text-[#22C55E] mt-0.5 numeral-bold">
              {card.maxRewardText}
            </p>
          </div>
        </div>

        {/* Category Pill Tag */}
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3FF] dark:bg-[#1E293B] text-[#0A3D91] dark:text-[#38BDF8] border border-blue-200/50 dark:border-blue-800/40">
          {card.tag}
        </span>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-3 leading-relaxed line-clamp-2">
        {card.description}
      </p>

      {/* Subtle Divider */}
      <hr className="my-3.5 border-[var(--border-subtle)]" />

      {/* Bottom Row: User Earned Tracker + Right Action Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8]">Earned:</span>
          <span className="text-xs font-bold text-[#15803D] dark:text-[#22C55E] numeral-bold">
            KES {userEarnedKes.toFixed(2)}
          </span>
        </div>

        <div className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[var(--bg-input)] group-hover:bg-gradient-to-r group-hover:from-[#1E6FD9] group-hover:to-[#0B4FB3] text-[#1E6FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
