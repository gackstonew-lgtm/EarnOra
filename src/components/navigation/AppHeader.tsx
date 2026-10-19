"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Wallet,
  ChevronDown,
  CheckCheck,
  Settings,
  Search,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { EarnoraLogo } from "../brand/EarnoraLogo";
import { useAuth } from "../providers/AuthProvider";
import { useTheme, Theme } from "../providers/ThemeProvider";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "earning" | "system" | "streak";
}

export const AppHeader: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      return [
        {
          id: "notif-1",
          title: "Review Approved!",
          message: "KES 450 credited to your available balance for Java House review.",
          timestamp: "10 mins ago",
          isRead: false,
          type: "earning",
        },
        {
          id: "notif-2",
          title: "Daily Streak Bonus",
          message: "Day 4 streak multiplier claimed. Current bonus: +15%.",
          timestamp: "Today, 08:30 AM",
          isRead: false,
          type: "streak",
        },
        {
          id: "notif-3",
          title: "New Sponsored Task",
          message: "Mount Kenya Organics is looking for product testers in Kenya.",
          timestamp: "Yesterday",
          isRead: true,
          type: "system",
        },
      ];
    }
    return [];
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/earn?query=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "GA";
    const parts = name.split(/[_\s]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[var(--bg-sidebar)]/95 border-b border-[var(--border-subtle)] transition-colors shadow-xs">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile/Tablet: Brand Logo */}
        <div className="flex md:hidden items-center gap-3">
          <EarnoraLogo size="sm" showTagline={false} href="/dashboard" />
        </div>

        {/* Desktop: Top Bar Search Field (Matches reference design) */}
        <form
          onSubmit={handleHeaderSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-md relative"
        >
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="Search categories, restaurants, apps, telcos..."
            className="w-full h-10 pl-10 pr-4 text-xs font-medium rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)] transition-all"
          />
        </form>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="View notifications"
              className="relative min-w-[44px] min-h-[44px] w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-card-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--accent-red)] rounded-full ring-2 ring-[var(--bg-sidebar)]" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--brand-blue)]/15 text-[var(--brand-blue)]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[var(--brand-blue)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[var(--border-subtle)] max-h-72 overflow-y-auto mt-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-3 px-2 rounded-[12px] transition-colors ${
                        !notif.isRead
                          ? "bg-[var(--bg-card-elevated)]"
                          : "hover:bg-[var(--bg-card-elevated)]/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center border-t border-[var(--border-subtle)] mt-2">
                  <Link
                    href="/activity"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[var(--brand-blue)] hover:underline"
                  >
                    View full activity history →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={userRef}>
            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--brand-blue)] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(user.username)}
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)] max-w-[120px] truncate hidden sm:inline">
                  {user.username || "Gackstone Wafula"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-[12px] text-xs font-bold bg-[var(--brand-blue)] text-white hover:opacity-90 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Profile Dropdown */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-72 rounded-[18px] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-[var(--bg-card-elevated)] rounded-[14px] mb-2 border border-[var(--border-subtle)]">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {user.username || "Gackstone Wafula"}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                    {user.phoneNumber}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                    <span className="text-[10px] font-bold text-[var(--accent-green)]">
                      M-Pesa Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/wallet"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)] transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-[var(--accent-green)]" />
                    <span>Wallet & Payouts</span>
                    <span className="ml-auto font-bold text-[var(--accent-green)] text-xs numeral-bold">
                      KES {(user.availableBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card-elevated)] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Account Settings</span>
                  </Link>

                  {/* Theme Row (placed between Account Settings and Sign Out) */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2 rounded-[10px] text-xs font-medium text-[var(--text-primary)]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        Theme
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {theme}
                      </span>
                    </div>
                    <div
                      role="group"
                      aria-label="Select theme"
                      className="grid grid-cols-3 gap-1 p-1 rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]"
                    >
                      {(
                        [
                          { id: "light" as Theme, label: "Light", icon: Sun },
                          { id: "dark" as Theme, label: "Dark", icon: Moon },
                          { id: "system" as Theme, label: "System", icon: Monitor },
                        ] as const
                      ).map((opt) => {
                        const Icon = opt.icon;
                        const active = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTheme(opt.id);
                            }}
                            aria-pressed={active}
                            className={`min-h-[34px] px-2 py-1 rounded-[8px] flex items-center justify-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                              active
                                ? "bg-[var(--brand-blue)] text-white shadow-xs"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
