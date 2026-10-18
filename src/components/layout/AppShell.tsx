"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PwaInstallBanner } from "@/components/ui/PwaInstallBanner";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Landing page route ("/") is a self-contained, full-width marketing experience
  // with its own sticky landing navbar and footer.
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");

  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070C18] text-slate-100 antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-black">
        <PwaInstallBanner />
        {children}
      </div>
    );
  }

  // App Pages (/dashboard, /earn, /wallet, /activity, /menu, /business, /admin, etc.)
  return (
    <div className="min-h-screen flex flex-col bg-[#070C18] dark:bg-[#070C18] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
      <PwaInstallBanner />
      {!isAuthPage && <AppHeader />}
      <main className={`flex-1 w-full mx-auto ${isAuthPage ? "" : "max-w-4xl px-4 pt-4 pb-24"}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
};
