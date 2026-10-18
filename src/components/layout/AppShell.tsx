"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PwaInstallBanner } from "@/components/ui/PwaInstallBanner";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isLandingPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");

  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F1F3D] antialiased overflow-x-hidden selection:bg-[#1E6FD9] selection:text-white">
        <PwaInstallBanner />
        {children}
      </div>
    );
  }

  // App Pages (/dashboard, /earn, /wallet, /activity, /menu, /business, /admin, etc.)
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F1F3D] antialiased selection:bg-[#1E6FD9] selection:text-white">
      <PwaInstallBanner />
      {!isAuthPage && <AppHeader />}
      <main className={`flex-1 w-full mx-auto ${isAuthPage ? "" : "max-w-4xl px-4 pt-4 pb-24"}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
};
