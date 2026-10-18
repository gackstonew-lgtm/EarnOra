"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  Laptop,
  Wifi,
  Sparkles,
  Database,
  Bell,
  User,
  Shield,
  Phone,
  Lock,
  Download,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { useTheme, Theme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui";
import { normalizePhoneNumber } from "@/lib/phone-utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();

  // Performance Preferences
  const [dataSaver, setDataSaver] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [offlineDrafts, setOfflineDrafts] = useState(true);

  // Notification Preferences
  const [notifTaskAlerts, setNotifTaskAlerts] = useState(true);
  const [notifPayoutUpdates, setNotifPayoutUpdates] = useState(true);
  const [notifReferralActivity, setNotifReferralActivity] = useState(true);

  // Account details state
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [country, setCountry] = useState(user?.country || "Kenya");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Feedback states
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");
  const [cacheCleared, setCacheCleared] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setPhone(user.phoneNumber);
      setCountry(user.country);
    }
    // Load local performance settings
    try {
      setDataSaver(localStorage.getItem("earnora_data_saver") === "true");
      setReduceMotion(localStorage.getItem("earnora_reduce_motion") === "true");
      setOfflineDrafts(localStorage.getItem("earnora_offline_drafts") !== "false");
    } catch {}
  }, [user]);

  const toggleDataSaver = () => {
    const val = !dataSaver;
    setDataSaver(val);
    try {
      localStorage.setItem("earnora_data_saver", String(val));
    } catch {}
  };

  const toggleReduceMotion = () => {
    const val = !reduceMotion;
    setReduceMotion(val);
    try {
      localStorage.setItem("earnora_reduce_motion", String(val));
    } catch {}
  };

  const toggleOfflineDrafts = () => {
    const val = !offlineDrafts;
    setOfflineDrafts(val);
    try {
      localStorage.setItem("earnora_offline_drafts", String(val));
    } catch {}
  };

  const handleClearCache = () => {
    try {
      // Clear temporary review drafts, search cache
      sessionStorage.clear();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch {}
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSuccess("");
    setAccountError("");

    if (!username.trim() || username.trim().length < 3) {
      setAccountError("Username must be at least 3 characters.");
      return;
    }

    const validation = normalizePhoneNumber(phone, user?.callingCode || "+254");
    if (!validation.isValid) {
      setAccountError(validation.error || "Please enter a valid M-Pesa phone number.");
      return;
    }

    updateProfile({
      username: username.trim(),
      phoneNumber: validation.normalized,
      country,
    });

    setAccountSuccess("Account and M-Pesa payout details updated successfully.");
    setTimeout(() => setAccountSuccess(""), 4000);
  };

  const handleDownloadData = () => {
    const dataToExport = {
      profile: user,
      exportedAt: new Date().toISOString(),
      platform: "EarnOra Kenya",
      compliance: "Kenya Data Protection Act 2019",
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnora-data-${user?.username || "user"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1F3D] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7A99] mt-0.5">
          Manage appearance, data saving mode, payout accounts, and privacy.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F1F3D]">Appearance</h2>
            <p className="text-xs text-[#6B7A99]">Customize theme display</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "light" as Theme, label: "Light", icon: Sun },
            { key: "dark" as Theme, label: "Dark", icon: Moon },
            { key: "system" as Theme, label: "System", icon: Laptop },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTheme(opt.key)}
                className={`p-3.5 rounded-[14px] border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#EAF3FF] border-[#1E6FD9] text-[#1E6FD9] shadow-xs font-bold"
                    : "bg-[#F8FAFC] border-slate-200/80 text-[#6B7A99] hover:bg-slate-100/80 font-medium"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: PERFORMANCE & DATA */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#0A3D91] flex items-center justify-center">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F1F3D]">Performance & Data Optimization</h2>
            <p className="text-xs text-[#6B7A99]">Low-bandwidth mode and offline review sync</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Data Saver Mode */}
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="font-bold text-[#0F1F3D]">Data Saver Mode</p>
              <p className="text-[#6B7A99] mt-0.5">
                Compress images and minimize mobile background data for slow Kenyan 3G networks.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDataSaver}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                dataSaver ? "bg-[#1E6FD9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  dataSaver ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Reduce Animations */}
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="font-bold text-[#0F1F3D]">Reduce Animations</p>
              <p className="text-[#6B7A99] mt-0.5">
                Minimize card transitions to conserve battery and enhance response on budget phones.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleReduceMotion}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                reduceMotion ? "bg-[#1E6FD9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  reduceMotion ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Offline Drafts Toggle */}
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="font-bold text-[#0F1F3D]">Offline Review Drafts</p>
              <p className="text-[#6B7A99] mt-0.5">
                Automatically save pending reviews locally when connection drops.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleOfflineDrafts}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                offlineDrafts ? "bg-[#1E6FD9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  offlineDrafts ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Cache Cleaning */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-[#0F1F3D]">Local Storage & Cache</p>
              <p className="text-[#6B7A99] mt-0.5">Clear cached previews and temporary storage.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="text-xs"
            >
              {cacheCleared ? "Cleared!" : "Clear Cache"}
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 3: NOTIFICATIONS */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F1F3D]">Notification Alerts</h2>
            <p className="text-xs text-[#6B7A99]">Control in-app alerts and SMS updates</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="font-bold text-[#0F1F3D]">New Task & Bounty Alerts</p>
              <p className="text-[#6B7A99] mt-0.5">
                Get notified when high-value reviews or sponsored product bounties open.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifTaskAlerts(!notifTaskAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notifTaskAlerts ? "bg-[#1E6FD9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  notifTaskAlerts ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="font-bold text-[#0F1F3D]">M-Pesa Payout Confirmations</p>
              <p className="text-[#6B7A99] mt-0.5">
                Notifications when Daraja B2C disbursements are processed and sent to your line.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifPayoutUpdates(!notifPayoutUpdates)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notifPayoutUpdates ? "bg-[#1E6FD9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  notifPayoutUpdates ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="font-bold text-[#0F1F3D]">Referral Bonus Credits</p>
              <p className="text-[#6B7A99] mt-0.5">
                Alerts when friends join using your link and complete their first review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifReferralActivity(!notifReferralActivity)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notifReferralActivity ? "bg-[#1E6FD9]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  notifReferralActivity ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: ACCOUNT & M-PESA LINE */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-[10px] bg-[#EEF3FF] text-[#1E6FD9] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F1F3D]">Account & M-Pesa Payout Number</h2>
            <p className="text-xs text-[#6B7A99]">Update contact details and disbursement line</p>
          </div>
        </div>

        {accountSuccess && (
          <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-xs text-[#16A34A] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{accountSuccess}</span>
          </div>
        )}

        {accountError && (
          <div className="p-3.5 rounded-[12px] bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{accountError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAccount} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F1F3D]">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F1F3D]">M-Pesa Payout Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Account Changes
            </Button>
          </div>
        </form>
      </section>

      {/* SECTION 5: PRIVACY & DATA RIGHTS */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-[10px] bg-sky-50 text-[#0A3D91] flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F1F3D]">Privacy & Data Protection</h2>
            <p className="text-xs text-[#6B7A99]">Kenya Data Protection Act 2019 Rights</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[#EEF3FF] transition-colors">
            <div>
              <p className="font-bold text-[#0F1F3D]">Export Your Data</p>
              <p className="text-[#6B7A99]">Download a JSON copy of your profile and task history.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadData}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
          </div>

          <Link
            href="/privacy"
            className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
          >
            <div>
              <p className="font-bold text-[#0F1F3D]">Privacy Policy</p>
              <p className="text-[#6B7A99]">Read our lawful basis and consent disclosures.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
          </Link>

          <Link
            href="/terms"
            className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[#EEF3FF] transition-colors"
          >
            <div>
              <p className="font-bold text-[#0F1F3D]">Terms of Service</p>
              <p className="text-[#6B7A99]">Community guidelines and review payout rules.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
          </Link>

          <div className="pt-2 flex items-center justify-between p-3 rounded-[12px] bg-red-50/50 border border-red-100">
            <div>
              <p className="font-bold text-red-600">Delete Account & Scrub Data</p>
              <p className="text-[#6B7A99]">Request permanent erasure of your reviewer account.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteRequested(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleteRequested ? "Request Sent" : "Request Erasure"}
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 6: SIGN OUT */}
      <div className="pt-2">
        <button
          type="button"
          onClick={logout}
          className="w-full py-3.5 rounded-[14px] bg-white border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of EarnOra</span>
        </button>
      </div>
    </div>
  );
}
