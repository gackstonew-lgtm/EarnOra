"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Wallet, History, Menu } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Earn",
      href: "/earn",
      icon: Sparkles,
      isActive: pathname.startsWith("/earn"),
    },
    {
      label: "Withdraw",
      href: "/wallet",
      icon: Wallet,
      isRaisedCenter: true,
      isActive: pathname.startsWith("/wallet"),
    },
    {
      label: "Activity",
      href: "/activity",
      icon: History,
      isActive: pathname.startsWith("/activity"),
    },
    {
      label: "Menu",
      href: "/menu",
      icon: Menu,
      isActive: pathname.startsWith("/menu"),
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#070C18]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 transition-colors shadow-lg"
    >
      <div className="max-w-md mx-auto px-4 flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isRaisedCenter) {
            return (
              <div key={item.label} className="relative -top-5 flex flex-col items-center">
                <Link
                  href={item.href}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-200
                    ${
                      item.isActive
                        ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/30 ring-4 ring-white dark:ring-[#070C18]"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 ring-4 ring-white dark:ring-[#070C18]"
                    }`}
                  aria-label="Withdrawal & Wallet"
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </Link>
                <span
                  className={`text-[11px] font-bold mt-1 ${
                    item.isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-95
                ${
                  item.isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  item.isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.8]"
                }`}
              />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
