"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isIosSafari: boolean;
  isBannerDismissed: boolean;
  showIosGuide: boolean;
  setShowIosGuide: (open: boolean) => void;
  promptInstall: () => Promise<void>;
  dismissBanner: () => void;
}

const DISMISS_STORAGE_KEY = "earnora_pwa_dismiss_until";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const InstallContext = createContext<InstallContextValue>({
  canInstall: false,
  isInstalled: false,
  isIosSafari: false,
  isBannerDismissed: false,
  showIosGuide: false,
  setShowIosGuide: () => {},
  promptInstall: async () => {},
  dismissBanner: () => {},
});

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker for PWA installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore service worker registration errors in dev
      });
    }

    // Check standalone status
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check 7-day dismissal in localStorage wrapped in try/catch
    try {
      const dismissUntilRaw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissUntilRaw) {
        const dismissUntil = Number(dismissUntilRaw);
        if (Number.isFinite(dismissUntil) && Date.now() < dismissUntil) {
          setIsBannerDismissed(true);
        } else {
          window.localStorage.removeItem(DISMISS_STORAGE_KEY);
        }
      }
    } catch {
      // Ignore storage access errors in private browsing
    }

    // Detect iOS Safari (where beforeinstallprompt is not supported)
    const ua = window.navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isWebkit = /WebKit/.test(ua);
    const isCriOS = /CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIOS && isWebkit && !isCriOS) {
      setIsIosSafari(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIosGuide(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
      } catch {
        // Ignore prompt errors
      } finally {
        setDeferredPrompt(null);
      }
      return;
    }

    if (isIosSafari) {
      setShowIosGuide(true);
    }
  }, [deferredPrompt, isInstalled, isIosSafari]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      window.localStorage.setItem(
        DISMISS_STORAGE_KEY,
        String(Date.now() + SEVEN_DAYS_MS),
      );
    } catch {
      // Ignore localStorage quota/privacy errors
    }
  }, []);

  const canInstall = !isInstalled && (Boolean(deferredPrompt) || isIosSafari);

  return (
    <InstallContext.Provider
      value={{
        canInstall,
        isInstalled,
        isIosSafari,
        isBannerDismissed,
        showIosGuide,
        setShowIosGuide,
        promptInstall,
        dismissBanner,
      }}
    >
      {children}
    </InstallContext.Provider>
  );
}

export function useInstall() {
  return useContext(InstallContext);
}
