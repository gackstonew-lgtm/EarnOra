"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, User, LogOut, ShieldCheck, Wallet, ChevronDown, CheckCheck } from "lucide-react";
import { EarnoraLogo } from "../brand/EarnoraLogo";
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
    if (!name) return "EO";
    const parts = name.split(/[_\s]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/95 border-b border-blue-100/80 transition-colors shadow-[0_2px_15px_rgba(15,31,61,0.03)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo (Visible on mobile/tablet or when header needs brand presence) */}
        <div className="flex items-center gap-3">
          <EarnoraLogo size="sm" showTagline={false} href="/dashboard" />
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="View notifications"
              className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF3FF] text-[#0F1F3D] hover:bg-[#E2EDFF] border border-blue-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5 text-[#0A3D91]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#1E6FD9] text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[20px] bg-white border border-blue-100/80 shadow-[0_12px_40px_rgba(15,31,61,0.12)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0F1F3D]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3FF] text-[#1E6FD9]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#1E6FD9] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-3 px-2 rounded-[12px] transition-colors ${
                        !notif.isRead
                          ? "bg-[#EAF3FF]/40"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[#0F1F3D]">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-[#6B7A99] shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7A99] mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center border-t border-slate-100 mt-2">
                  <Link
                    href="/activity"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#1E6FD9] hover:underline"
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
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#EEF3FF] border border-blue-100 hover:bg-[#E2EDFF] transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getInitials(user.username)}
                </div>
                <span className="text-xs font-semibold text-[#0F1F3D] max-w-[90px] truncate hidden sm:inline">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7A99]" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-[12px] text-xs font-bold bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white shadow-blue-btn hover:brightness-105 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Profile Dropdown */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-64 rounded-[20px] bg-white border border-blue-100/80 shadow-[0_12px_40px_rgba(15,31,61,0.12)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-[#EEF3FF]/70 rounded-[14px] mb-2 border border-blue-100/50">
                  <p className="text-xs font-bold text-[#0F1F3D] truncate">
                    {user.username}
                  </p>
                  <p className="text-[11px] text-[#6B7A99] mt-0.5 truncate">
                    {user.phoneNumber}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span className="text-[10px] font-bold text-[#16A34A]">
                      M-Pesa Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/wallet"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[#0F1F3D] hover:bg-[#EEF3FF] transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-[#1E6FD9]" />
                    <span>Wallet & Payouts</span>
                    <span className="ml-auto font-bold text-[#16A34A] text-xs numeral-bold">
                      KES {user.availableBalance.toLocaleString()}
                    </span>
                  </Link>

                  <Link
                    href="/business"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-[#0F1F3D] hover:bg-[#EEF3FF] transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#0A3D91]" />
                    <span>Business Workspace</span>
                  </Link>

                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
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
