"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";
import { EarnoraSymbol } from "../brand/EarnoraSymbol";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = sessionStorage.getItem("earnora_pwa_dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show graceful manual installation guide for iOS/desktop browsers
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("earnora_pwa_dismissed", "true");
  };

  if (isInstalled || isDismissed) return null;

  return (
    <>
      <aside aria-label="Install App" className="w-full bg-gradient-to-r from-emerald-950/80 via-[#0B1E38]/90 to-emerald-950/80 border-b border-emerald-500/30 px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center p-1 shrink-0">
              <EarnoraSymbol size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Install Earnora App
              </p>
              <p className="text-[10px] text-slate-300">
                Faster performance & offline review drafting on Kenyan mobile networks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Manual Guide Modal for iOS Safari / Chrome */}
      {showManualGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[22px] bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-base">Install Earnora</h3>
              </div>
              <button
                onClick={() => setShowManualGuide(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              To install Earnora on your mobile home screen:
            </p>

            <div className="mt-4 space-y-3 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Tap your browser&apos;s <strong>Share</strong> button (Safari) or menu <strong>⋮</strong> (Chrome).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>Launch Earnora directly like a native app with instant M-Pesa notifications.</span>
              </div>
            </div>

            <button
              onClick={() => setShowManualGuide(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
