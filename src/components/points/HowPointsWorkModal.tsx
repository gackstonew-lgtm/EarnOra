"use client";

import React from "react";
import {
  Award,
  CheckCircle2,
  Crown,
  Flame,
  Info,
  PlayCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { POINT_AWARD_VALUES, TIER_LEVELS_CONFIG } from "@/lib/points/config";
import { TierLevelName } from "@/lib/points/types";

export const TierBadge: React.FC<{
  level: TierLevelName | string;
  size?: "sm" | "md";
}> = ({ level, size = "sm" }) => {
  const tier =
    TIER_LEVELS_CONFIG.find((t) => t.name === level) || TIER_LEVELS_CONFIG[0];

  const colorClasses: Record<string, string> = {
    Starter:
      "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-400/30",
    Bronze:
      "bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    Silver:
      "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    Gold:
      "bg-amber-500/15 text-[var(--accent-gold)] border-amber-500/40",
    Platinum:
      "bg-[var(--brand-blue)]/15 text-[var(--brand-blue)] border-[var(--brand-blue)]/40",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-extrabold uppercase tracking-wider ${
        colorClasses[tier.name] || colorClasses.Starter
      } ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}
    >
      <Crown className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{tier.name}</span>
    </span>
  );
};

interface HowPointsWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints?: number;
  currentLevel?: string;
}

export const HowPointsWorkModal: React.FC<HowPointsWorkModalProps> = ({
  isOpen,
  onClose,
  currentPoints = 0,
  currentLevel = "Starter",
}) => {
  if (!isOpen) return null;

  const earnWays = [
    {
      label: "Approved First-Hand Review",
      points: `+${POINT_AWARD_VALUES.approved_review} pts`,
      icon: ShieldCheck,
      sub: "Awarded when your restaurant or business review is verified",
    },
    {
      label: "Approved Sponsored Task",
      points: `+${POINT_AWARD_VALUES.approved_task} pts`,
      icon: CheckCircle2,
      sub: "Awarded on approval of app testing, telco, or product tasks",
    },
    {
      label: "Watched Sponsored Ad",
      points: `+${POINT_AWARD_VALUES.watched_ad} pts`,
      icon: PlayCircle,
      sub: "Complete the full verified watch timer on /earn/ads",
    },
    {
      label: "Daily Login & Streak Milestones",
      points: `+${POINT_AWARD_VALUES.daily_login} to +${POINT_AWARD_VALUES.streak_30d} pts`,
      icon: Flame,
      sub: `+${POINT_AWARD_VALUES.daily_login} pt daily login • +${POINT_AWARD_VALUES.streak_3d} pts (3d) • +${POINT_AWARD_VALUES.streak_7d} pts (7d) • +${POINT_AWARD_VALUES.streak_30d} pts (30d)`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-display">
                  How Points & Tiers Work
                </h3>
                <TierBadge level={currentLevel} size="sm" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                You currently have{" "}
                <strong className="text-[var(--text-primary)]">
                  {currentPoints.toLocaleString()} pts
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ways to Earn Points */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            How You Earn Points
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {earnWays.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-3 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-[10px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] leading-snug">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/30 text-xs font-extrabold shrink-0 numeral-bold">
                    {item.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier Withdrawal Limits Table */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Tier Withdrawal Limits (M-Pesa B2C)
          </h4>
          <div className="rounded-[14px] border border-[var(--border-subtle)] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--bg-card-elevated)] border-b border-[var(--border-subtle)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Min Points</th>
                  <th className="py-2.5 px-3">Max / Tx</th>
                  <th className="py-2.5 px-3">Daily Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {TIER_LEVELS_CONFIG.map((lvl) => {
                  const isCurrent = lvl.name === currentLevel;
                  return (
                    <tr
                      key={lvl.name}
                      className={
                        isCurrent
                          ? "bg-[var(--brand-blue)]/10 font-bold"
                          : "bg-[var(--bg-card)]"
                      }
                    >
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        <TierBadge level={lvl.name} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)] numeral-bold">
                        {lvl.minPoints.toLocaleString()} pts
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)] numeral-bold">
                        KES {lvl.maxPerWithdrawalKes.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--accent-green)] font-bold numeral-bold">
                        KES {lvl.dailyWithdrawalLimitKes.toLocaleString()}/day
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fair Play & Transparency Notice */}
        <div className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-blue)] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--text-primary)]">
              Fair Play & Transparency:
            </strong>{" "}
            Points are awarded once per verified action with daily source caps. If a submission is later rejected or flagged for policy violations, its points are automatically revoked. Points raise your M-Pesa withdrawal limits and do not represent a promise of guaranteed earnings.
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-extrabold hover:opacity-95 transition-all cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
