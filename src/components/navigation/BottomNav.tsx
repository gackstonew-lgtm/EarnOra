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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-blue-100/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-4px_20px_rgba(15,31,61,0.06)] transition-all"
    >
      <div className="max-w-md mx-auto px-4 flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isRaisedCenter) {
            return (
              <div key={item.label} className="relative -top-5 flex flex-col items-center">
                <Link
                  href={item.href}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-blue-btn transition-transform active:scale-95 duration-200 ring-4 ring-[#F8FAFC]
                    ${
                      item.isActive
                        ? "bg-gradient-to-tr from-[#1E6FD9] to-[#0B4FB3] text-white shadow-[0_6px_22px_rgba(11,79,179,0.4)]"
                        : "bg-gradient-to-tr from-[#1E6FD9] to-[#0B4FB3] text-white hover:brightness-105"
                    }`}
                  aria-label="Withdraw & Wallet"
                >
                  <Icon className="w-6 h-6 stroke-[2.3]" />
                </Link>
                <span
                  className={`text-[11px] font-bold mt-1 ${
                    item.isActive ? "text-[#1E6FD9]" : "text-[#6B7A99]"
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
              className={`flex flex-col items-center py-1 px-3 rounded-[12px] transition-all duration-150 active:scale-95 ${
                item.isActive
                  ? "text-[#1E6FD9] font-bold"
                  : "text-[#6B7A99] hover:text-[#0F1F3D]"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  item.isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
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
