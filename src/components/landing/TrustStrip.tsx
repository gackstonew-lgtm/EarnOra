"use client";

import React from "react";
import { CheckCircle2, Lock, Zap } from "lucide-react";

export const TrustStrip: React.FC = () => {
  return (
    <section className="border-y border-blue-100/70 bg-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center text-center md:text-left">
          {/* Trust Pillar 1: M-Pesa B2C */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 p-4 rounded-[16px] bg-[#EEF3FF]/70 border border-blue-100/60 shadow-xs">
            <div className="w-12 h-12 rounded-[12px] bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-200/50">
              <Zap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F1F3D]">Paid out via M-Pesa</h3>
              <p className="text-xs text-[#6B7A99] mt-0.5">
                Instant Daraja B2C direct to line. Min KES 100.
              </p>
            </div>
          </div>

          {/* Trust Pillar 2: Verified Reviews */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 p-4 rounded-[16px] bg-[#EEF3FF]/70 border border-blue-100/60 shadow-xs">
            <div className="w-12 h-12 rounded-[12px] bg-[#EAF3FF] text-[#1E6FD9] flex items-center justify-center shrink-0 border border-blue-200/50">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F1F3D]">Verified Reviews Only</h3>
              <p className="text-xs text-[#6B7A99] mt-0.5">
                No bots or fake copy-paste. Anti-fraud screened.
              </p>
            </div>
          </div>

          {/* Trust Pillar 3: Data Protection Act */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 p-4 rounded-[16px] bg-[#EEF3FF]/70 border border-blue-100/60 shadow-xs">
            <div className="w-12 h-12 rounded-[12px] bg-sky-50 text-[#0A3D91] flex items-center justify-center shrink-0 border border-sky-200/50">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F1F3D]">Data Protection Act Compliant</h3>
              <p className="text-xs text-[#6B7A99] mt-0.5">
                Kenya DPA 2019 (ODPC). Private phone numbers.
              </p>
            </div>
          </div>
        </div>

        {/* Transparent Placeholder Metric Notice */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-[#6B7A99] font-medium">
            <span className="text-[#16A34A] font-bold">[Live Platform Stats]</span> Public cumulative payout totals & reviewer count stream directly from the Daraja disbursement ledger.
          </p>
        </div>
      </div>
    </section>
  );
};
