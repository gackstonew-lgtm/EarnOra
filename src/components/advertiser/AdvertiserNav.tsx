"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Megaphone,
  Wallet,
  BarChart3,
  Settings,
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getActiveAdvertiserAndWallet } from "@/lib/ads/store";
import { AdvertiserProfile, AdvertiserWallet } from "@/lib/ads/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui";

export const AdvertiserNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [wallet, setWallet] = useState<AdvertiserWallet | null>(null);

  const loadData = () => {
    const { advertiser: adv, wallet: wal } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setWallet(wal);
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("earnora_ads_state_updated", handler);
    return () => window.removeEventListener("earnora_ads_state_updated", handler);
  }, [user?.id]);

  const tabs = [
    {
      label: "Overview",
      href: "/advertiser",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Create Campaign",
      href: "/advertiser/campaigns/new",
      icon: PlusCircle,
      exact: true,
    },
    {
      label: "My Campaigns",
      href: "/advertiser/campaigns",
      icon: Megaphone,
      exact: true,
    },
    {
      label: "Wallet",
      href: "/advertiser/wallet",
      icon: Wallet,
      exact: false,
    },
    {
      label: "Results",
      href: "/advertiser/results",
      icon: BarChart3,
      exact: false,
    },
    {
      label: "Settings",
      href: "/advertiser/settings",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Business Banner */}
      <div className="rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[14px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0 border border-[var(--brand-blue)]/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-display">
                {advertiser?.businessName || "Advertiser Workspace"}
              </h2>
              {advertiser?.status === "verified" && (
                <Badge variant="success" size="sm">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Business
                </Badge>
              )}
              {advertiser?.status === "pending" && (
                <Badge variant="warning" size="sm">
                  <Clock className="w-3 h-3 mr-1" />
                  Verification Pending
                </Badge>
              )}
              {advertiser?.status === "suspended" && (
                <Badge variant="danger" size="sm">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Suspended
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {advertiser?.contactPerson} • {advertiser?.email}
            </p>
          </div>
        </div>

        {/* Quick Wallet Balance Pill */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
              Available Campaign Wallet
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[var(--accent-green)] numeral-bold">
              KES {(wallet?.balanceKes ?? 0).toLocaleString()}
            </span>
          </div>
          <Link
            href="/advertiser/wallet"
            className="px-3.5 py-2 rounded-[10px] bg-[var(--brand-blue)] text-white text-xs font-bold hover:opacity-95 transition-opacity shrink-0"
          >
            + Top Up
          </Link>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <nav
        aria-label="Advertiser Portal Navigation"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3.5 py-2.5 rounded-[12px] text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
