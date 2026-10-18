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
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-4px_20px_rgba(7,13,24,0.12)] transition-colors duration-200"
    >
      <div className="max-w-md mx-auto px-4 flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isRaisedCenter) {
            return (
              <div key={item.label} className="relative -top-5 flex flex-col items-center">
                <Link
                  href={item.href}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 duration-200 ring-4 ring-[var(--bg-sidebar)] shadow-lg shadow-blue-500/25 bg-[var(--brand-blue)] text-white border border-blue-400/30"
                  aria-label="Withdraw & Wallet"
                >
                  <Icon className="w-6 h-6 stroke-[2.3]" />
                </Link>
                <span
                  className={`text-[11px] font-bold mt-1 ${
                    item.isActive ? "text-[var(--brand-blue)]" : "text-[var(--text-muted)]"
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
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 px-2.5 rounded-[12px] transition-all duration-150 active:scale-95 ${
                item.isActive
                  ? "text-[var(--brand-blue)] font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${
                  item.isActive ? "scale-110 stroke-[2.4] text-[var(--brand-blue)]" : "stroke-[2]"
                }`}
              />
              <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
