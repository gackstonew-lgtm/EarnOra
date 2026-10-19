"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Download, Share, X, Smartphone } from "lucide-react";
import { EarnoraSymbol } from "../brand/EarnoraSymbol";
import { useInstall } from "@/components/providers/InstallProvider";

export const PwaInstallBanner: React.FC = () => {
  const pathname = usePathname();
  const {
    canInstall,
    isInstalled,
    isBannerDismissed,
    isIosSafari,
    showIosGuide,
    setShowIosGuide,
    promptInstall,
    dismissBanner,
  } = useInstall();

  // Never show banner on auth pages
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <>
      {!isInstalled && !isBannerDismissed && !isAuthPage && canInstall && (
        <aside
          aria-label="Install App"
          className="w-full bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-4 py-2.5"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center p-1 shrink-0">
                <EarnoraSymbol size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-tight truncate">
                  Install Earnora App
                </p>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  One-tap home screen access &amp; fast performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={promptInstall}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Install App</span>
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label="Dismiss install banner for 7 days"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari ONLY: 1-Step Visual Share -> Add to Home Screen Guide */}
      {isIosSafari && showIosGuide && !isInstalled && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Earnora to iOS Home Screen"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm rounded-[22px] bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                aria-label="Close guide"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3 text-sm text-slate-100 leading-relaxed">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                <Share className="w-5 h-5" />
              </span>
              <span>
                Tap the Safari <strong>Share</strong> icon below, then tap{" "}
                <strong>Add to Home Screen</strong>.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm text-center transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
