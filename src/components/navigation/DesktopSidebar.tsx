"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  Wallet,
  History,
  Building2,
  Shield,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Pin,
  PinOff,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { EarnoraSymbol } from "@/components/brand/EarnoraSymbol";
import { useAuth } from "@/components/providers/AuthProvider";

export const DesktopSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("earnora_sidebar_pinned");
      if (savedPin === "true") {
        setIsPinned(true);
      }
    } catch {
      // Ignore local storage error
    }
    setMounted(true);
  }, []);

  const togglePin = () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    try {
      localStorage.setItem("earnora_sidebar_pinned", String(nextState));
    } catch {
      // Ignore
    }
  };

  const isExpanded = isPinned || isHovered;

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Earn Reviews",
      href: "/earn",
      icon: Sparkles,
      isActive: pathname.startsWith("/earn"),
    },
    {
      label: "Withdraw",
      href: "/wallet",
      icon: Wallet,
      isActive: pathname.startsWith("/wallet"),
      badge: "M-Pesa",
    },
    {
      label: "Activity",
      href: "/activity",
      icon: History,
      isActive: pathname.startsWith("/activity"),
    },
    {
      label: "For Businesses",
      href: "/business",
      icon: Building2,
      isActive: pathname.startsWith("/business"),
    },
    {
      label: "Admin Portal",
      href: "/admin",
      icon: Shield,
      isActive: pathname.startsWith("/admin"),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: SettingsIcon,
      isActive: pathname.startsWith("/settings"),
    },
    {
      label: "Menu",
      href: "/menu",
      icon: MenuIcon,
      isActive: pathname.startsWith("/menu"),
    },
  ];

  if (!mounted) return null;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-blue-100 shadow-[4px_0_24px_rgba(15,31,61,0.04)] transition-all duration-300 ease-in-out ${
        isExpanded ? "w-[260px]" : "w-[72px]"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-blue-50/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden select-none">
          <EarnoraSymbol size={40} />
          {isExpanded && (
            <div className="flex flex-col leading-none animate-in fade-in duration-200">
              <span className="font-extrabold text-xl tracking-tight text-[#0F1F3D] font-display">
                Earn<span className="text-[#1E6FD9]">Ora</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-[#6B7A99] mt-0.5">
                Review. Earn. Grow.
              </span>
            </div>
          )}
        </Link>

        {isExpanded && (
          <button
            type="button"
            onClick={togglePin}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7A99] hover:text-[#0F1F3D] hover:bg-[#EEF3FF] transition-colors"
          >
            {isPinned ? (
              <PinOff className="w-4 h-4 text-[#1E6FD9]" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] font-medium text-sm transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white shadow-blue-btn font-semibold"
                  : "text-[#6B7A99] hover:text-[#0F1F3D] hover:bg-[#EEF3FF]"
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  active ? "text-white" : "text-[#6B7A99]"
                }`}
              />

              {isExpanded && (
                <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[#EAF3FF] text-[#1E6FD9]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-blue-50/80 bg-slate-50/50">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#EAF3FF] text-[#1E6FD9] font-bold flex items-center justify-center shrink-0 border border-blue-200/60">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "EO"}
            </div>

            {isExpanded && (
              <div className="flex-1 overflow-hidden animate-in fade-in duration-200">
                <p className="text-xs font-bold text-[#0F1F3D] truncate">
                  {user?.username || "Reviewer"}
                </p>
                <p className="text-[11px] font-semibold text-[#16A34A] truncate numeral-bold">
                  KES {user?.availableBalance?.toLocaleString() || "0.00"}
                </p>
              </div>
            )}

            {isExpanded && (
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7A99] hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/login"
              className={`flex items-center justify-center py-2 rounded-[12px] bg-[#EEF3FF] text-[#0A3D91] text-xs font-bold hover:bg-[#D9E9FF] transition-all ${
                !isExpanded ? "px-0" : "px-3"
              }`}
            >
              {isExpanded ? "Sign In" : <ChevronRight className="w-4 h-4" />}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};
