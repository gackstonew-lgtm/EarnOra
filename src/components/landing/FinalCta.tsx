"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export const FinalCta: React.FC = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-gradient-to-r from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] p-8 sm:p-14 lg:p-16 text-center relative overflow-hidden shadow-[0_15px_50px_rgba(11,79,179,0.22)] text-white">
          {/* Ambient center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>Ready to Start?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Turn Your First Review Into M-Pesa Cash Today.
            </h2>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Join thousands of Kenyan reviewers already getting rewarded for their authentic opinions. Free registration, verified bounties, and zero withdrawal fees.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 rounded-[12px] bg-white hover:bg-slate-50 text-[#0A3D91] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/earn"
                className="w-full sm:w-auto px-7 py-4 rounded-[12px] bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Active Tasks</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Instant Phone OTP Signup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>ODPC Kenya Data Privacy Compliant</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
