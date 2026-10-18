"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Lock, Zap } from "lucide-react";

export const TrustStrip: React.FC = () => {
  return (
    <section className="border-y border-slate-800/80 bg-[#0A101D]/90 backdrop-blur-md py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center text-center md:text-left">
          {/* Trust Pillar 1: M-Pesa B2C */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Paid out via M-Pesa</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant Daraja B2C direct to line. Min KES 100.
              </p>
            </div>
          </div>

          {/* Trust Pillar 2: Verified Reviews */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Verified Reviews Only</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                No bots or fake copy-paste. Anti-fraud screened.
              </p>
            </div>
          </div>

          {/* Trust Pillar 3: Data Protection Act */}
          <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Data Protection Act Compliant</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kenya DPA 2019 (ODPC). Private phone numbers.
              </p>
            </div>
          </div>
        </div>

        {/* Transparent Placeholder Metric Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-400 font-bold">[TODO: Live Platform Stats]</span> Public cumulative payout totals & reviewer count will stream live once initial merchant verification milestones conclude.
          </p>
        </div>
      </div>
    </section>
  );
};
