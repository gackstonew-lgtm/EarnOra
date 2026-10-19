"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Building2, Save, ShieldCheck } from "lucide-react";
import { AdvertiserNav } from "@/components/advertiser/AdvertiserNav";
import { Button, Card, Badge } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getActiveAdvertiserAndWallet,
  updateAdvertiserProfile,
} from "@/lib/ads/store";
import { AdvertiserProfile, BusinessType } from "@/lib/ads/types";

export default function AdvertiserSettingsPage() {
  const { user } = useAuth();
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("restaurant_hospitality");
  const [website, setWebsite] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const { advertiser: adv } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setBusinessName(adv.businessName);
    setContactPerson(adv.contactPerson);
    setPhone(adv.phone);
    setEmail(adv.email);
    setBusinessType(adv.businessType);
    setWebsite(adv.website || "");
  }, [user?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiser) return;

    const updated = updateAdvertiserProfile(advertiser.id, {
      businessName,
      contactPerson,
      phone,
      email,
      businessType,
      website: website || undefined,
    });

    if (updated) {
      setAdvertiser(updated);
      setSavedMsg("Business profile settings saved successfully.");
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <AdvertiserNav />

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight">
            Business Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Manage your company details, billing contact, and verification profile.
          </p>
        </div>

        {savedMsg && (
          <div className="p-3.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--accent-green)] flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <Card padding="lg">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Account Verification Status
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Advertiser ID: {advertiser?.id}
                </p>
              </div>
            </div>
            <Badge
              variant={
                advertiser?.status === "verified"
                  ? "success"
                  : advertiser?.status === "suspended"
                  ? "danger"
                  : "warning"
              }
            >
              {(advertiser?.status || "pending").toUpperCase()}
            </Badge>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Business Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Billing & Notifications Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Business Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="restaurant_hospitality">Restaurant, Café & Hospitality</option>
                  <option value="app_software">Mobile App, Website & SaaS</option>
                  <option value="telco_fintech">Telco, Banking & Fintech</option>
                  <option value="consumer_product">Consumer Product & Retail Brand</option>
                  <option value="market_research">Market Research & Survey Agency</option>
                  <option value="local_service">Local Service & SME</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbusiness.co.ke"
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Business Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
