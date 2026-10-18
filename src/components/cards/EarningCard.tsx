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
      className={`group block relative rounded-[22px] bg-gradient-to-br ${card.cardTheme.bgGradient} p-5 border ${card.cardTheme.borderGlow} shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99]`}
    >
      {/* Top Row: Icon + Title & Reward Subtitle + Category Tag */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${card.cardTheme.iconBg}`}
          >
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
              {card.title}
            </h3>
            <p className="text-xs font-semibold text-slate-300/90 mt-0.5">
              {card.maxRewardText}
            </p>
          </div>
        </div>

        {/* Category Pill Tag */}
        <span
          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${card.cardTheme.tagBg}`}
        >
          {card.tag}
        </span>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-slate-300/70 mt-3 leading-relaxed">
        {card.description}
      </p>

      {/* Thin Divider */}
      <hr className="my-3.5 border-slate-700/50" />

      {/* Bottom Row: User Approved Earning + Circular Arrow Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">Earned:</span>
          <span className="text-xs font-bold text-emerald-400">
            KES {userEarnedKes.toFixed(2)}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-slate-800/80 group-hover:bg-emerald-500 text-slate-200 group-hover:text-slate-950 flex items-center justify-center transition-all duration-200 shadow-sm">
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
