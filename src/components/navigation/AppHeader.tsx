"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, User, LogOut, ShieldCheck, Wallet, ChevronDown, CheckCheck } from "lucide-react";
import { EarnoraLogo } from "../brand/EarnoraLogo";
import { ThemeToggle } from "../brand/ThemeToggle";
import { useAuth } from "../providers/AuthProvider";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "earning" | "system" | "streak";
}

export const AppHeader: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dynamic application-driven notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Review Approved!",
      message: "KES 450 credited to your available balance for Java House Kimathi St review.",
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
      message: "Mount Kenya Organics is looking for 50 product testers in Kenya.",
      timestamp: "Yesterday",
      isRead: true,
      type: "system",
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Close dropdowns on outside click
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
    if (!name) return "E";
    const parts = name.split(/[_\s]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#070C18]/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <EarnoraLogo size="sm" showTagline={false} />

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="View notifications"
              className="relative w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white dark:text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#070C18] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-3 px-2 rounded-xl transition-colors ${
                        !notif.isRead
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 mt-2">
                  <Link
                    href="/activity"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View full activity history →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Chip & Dropdown */}
          <div className="relative" ref={userRef}>
            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                  {getInitials(user.username)}
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[80px] truncate hidden sm:inline">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Profile Dropdown */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-700/80 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 bg-slate-50 dark:bg-[#132347] rounded-xl mb-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {user.phoneNumber}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      M-Pesa Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/wallet"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <span>Wallet & Payouts</span>
                    <span className="ml-auto font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      KES {user.availableBalance.toLocaleString()}
                    </span>
                  </Link>

                  <Link
                    href="/business"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Business Workspace</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Admin Operations</span>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
