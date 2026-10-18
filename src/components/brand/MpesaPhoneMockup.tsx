"use client";

import React from "react";
import { Check } from "lucide-react";

interface MpesaPhoneMockupProps {
  className?: string;
  compact?: boolean;
}

export const MpesaPhoneMockup: React.FC<MpesaPhoneMockupProps> = ({
  className = "",
  compact = false,
}) => {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      {/* Decorative solid gold coin accents */}
      <div className="absolute -top-3 -left-4 w-7 h-7 rounded-full bg-[#F5C451] border-2 border-[#854D0E] flex items-center justify-center text-[10px] font-extrabold text-[#111827] shadow-xs">
        K
      </div>
      <div className="absolute top-1/4 -right-4 w-9 h-9 rounded-full bg-[#F5C451] border-2 border-[#854D0E] flex items-center justify-center text-xs font-extrabold text-[#111827] shadow-xs">
        KES
      </div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-[#F5C451] border-2 border-[#854D0E] flex items-center justify-center text-[9px] font-extrabold text-[#111827] shadow-xs">
        ✓
      </div>

      {/* Modern Phone Frame (Solid colors, no gradients) */}
      <div
        className={`relative rounded-[28px] border-4 border-[#29384D] dark:border-[#334155] bg-[#070D18] text-white shadow-xl overflow-hidden flex flex-col ${
          compact ? "w-[170px] h-[240px] p-2.5" : "w-[210px] h-[300px] p-3.5"
        }`}
      >
        {/* Dynamic Island / Speaker notch */}
        <div className="w-16 h-3 bg-[#162337] rounded-full mx-auto mb-2 shrink-0 border border-[#29384D]" />

        {/* Screen Content */}
        <div className="flex-1 rounded-[18px] bg-[#101B2B] p-3 flex flex-col justify-between border border-[#29384D]">
          {/* M-PESA Header */}
          <div className="text-center pt-1">
            <span className="font-extrabold text-sm tracking-widest text-[#22C55E]">
              M<span className="text-[#EF4444]">-</span>PESA
            </span>
            <div className="text-[9px] text-[#94A3B8] font-medium tracking-tight mt-0.5">
              Verified Payout
            </div>
          </div>

          {/* Central Checkmark Circle */}
          <div className="my-auto flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-[#22C55E] text-[#070D18] flex items-center justify-center mb-1.5 shadow-sm">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            {/* Payment Received Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#166534] text-[#F8FAFC] text-[11px] font-bold border border-[#22C55E]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>Payment Received</span>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="text-center pb-1">
            <span className="text-[9px] text-[#F5C451] font-bold uppercase tracking-wider">
              EarnOra Verified
            </span>
          </div>
        </div>
      </div>

      {/* Gold floating tag: "Your Opinion Matters" */}
      <div className="absolute -bottom-3 right-0 px-3 py-1 rounded-full bg-[#F5C451] text-[#111827] text-[11px] font-extrabold shadow-md border border-[#854D0E] whitespace-nowrap">
        Your Opinion Matters ✨
      </div>
    </div>
  );
};
