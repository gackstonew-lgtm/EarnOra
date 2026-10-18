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
      className="group block relative rounded-[20px] bg-white p-5 border border-blue-100/70 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] hover:shadow-[0_12px_32px_rgba(30,111,217,0.12)] hover:border-[#1E6FD9]/40 transition-all duration-200 hover:-translate-y-1 active:scale-[0.99]"
    >
      {/* Top Row: Icon + Title & Category Tag */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs group-hover:scale-105 group-hover:bg-[#EAF3FF] transition-all">
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F1F3D] tracking-tight leading-snug group-hover:text-[#1E6FD9] transition-colors">
              {card.title}
            </h3>
            <p className="text-xs font-bold text-[#16A34A] mt-0.5 numeral-bold">
              {card.maxRewardText}
            </p>
          </div>
        </div>

        {/* Category Pill Tag */}
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF3FF] text-[#0A3D91] border border-blue-200/50">
          {card.tag}
        </span>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-[#6B7A99] mt-3 leading-relaxed line-clamp-2">
        {card.description}
      </p>

      {/* Subtle Divider */}
      <hr className="my-3.5 border-slate-100" />

      {/* Bottom Row: User Earned Tracker + Right Action Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-medium text-[#6B7A99]">Earned:</span>
          <span className="text-xs font-bold text-[#16A34A] numeral-bold">
            KES {userEarnedKes.toFixed(2)}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#EEF3FF] group-hover:bg-gradient-to-r group-hover:from-[#1E6FD9] group-hover:to-[#0B4FB3] text-[#1E6FD9] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
