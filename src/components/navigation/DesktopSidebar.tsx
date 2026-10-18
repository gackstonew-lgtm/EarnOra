"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  Wallet,
  History,
  User as UserIcon,
  Settings as SettingsIcon,
  Crown,
  Headphones,
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
      label: "Earn",
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
      label: "Profile",
      href: "/settings",
      icon: UserIcon,
      isActive: pathname === "/settings" && typeof window !== "undefined" && window.location.hash === "#profile",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: SettingsIcon,
      isActive: pathname.startsWith("/settings"),
    },
  ];

  if (!mounted) return null;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] shadow-[4px_0_24px_rgba(7,13,24,0.08)] transition-all duration-300 ease-in-out ${
        isExpanded ? "w-[260px]" : "w-[76px]"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden select-none">
          <EarnoraSymbol size={38} />
          {isExpanded && (
            <div className="flex flex-col leading-none animate-in fade-in duration-200">
              <span className="font-extrabold text-xl tracking-tight text-[var(--text-primary)] font-display">
                Earn<span className="text-[var(--brand-blue)]">Ora</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mt-1">
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)] transition-colors cursor-pointer"
          >
            {isPinned ? (
              <PinOff className="w-4 h-4 text-[var(--brand-blue)]" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto scrollbar-none flex flex-col justify-between">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-[12px] font-medium text-sm transition-all duration-150 ${
                  active
                    ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border border-[var(--brand-blue)]/20 font-bold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)]"
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-[var(--brand-blue)]" : "text-[var(--text-muted)]"
                  }`}
                />

                {isExpanded && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          active
                            ? "bg-[var(--brand-blue)] text-white"
                            : "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]"
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

        {/* Sidebar Cards (shown when expanded) */}
        {isExpanded && (
          <div className="pt-4 space-y-3 animate-in fade-in duration-200">
            {/* Your Progress Card */}
            <div className="p-3.5 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-1.5">
                <Crown className="w-5 h-5 text-[var(--brand-blue)]" />
                <span className="text-[10px] font-bold text-[var(--brand-blue)] uppercase tracking-wider">
                  Tier 1
                </span>
              </div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Your Progress</h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-tight">
                Complete more tasks to unlock higher rewards!
              </p>

              {/* Progress Ring / Circle Badge */}
              <div className="mt-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--brand-blue)] flex flex-col items-center justify-center bg-[var(--bg-card-elevated)] shadow-inner">
                  <span className="text-[11px] font-extrabold text-[var(--text-primary)]">Level 1</span>
                  <span className="text-[9px] font-semibold text-[var(--text-muted)]">0 / 10</span>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="p-3.5 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1">
                <Headphones className="w-4 h-4 text-[var(--brand-blue)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Need Help?</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Our support team is here for you 24/7.
              </p>
              <Link
                href="/settings"
                className="mt-2.5 block text-center py-1.5 px-3 rounded-[10px] text-xs font-bold border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)] transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card-elevated)] shrink-0">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "GA"}
            </div>

            {isExpanded && (
              <div className="flex-1 overflow-hidden animate-in fade-in duration-200">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {user?.username || "Gackstone Wafula"}
                </p>
                <p className="text-[11px] font-semibold text-[var(--accent-green)] truncate numeral-bold">
                  KES {(user?.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {isExpanded && (
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/login"
              className={`flex items-center justify-center py-2 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-bold hover:opacity-90 transition-all ${
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
