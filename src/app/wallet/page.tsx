"use client";

import React, { useState } from "react";
import {
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  FileText,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { INITIAL_TRANSACTIONS } from "@/lib/mock-data";
import { WalletTransaction } from "@/lib/types";
import { Button } from "@/components/ui";

export default function WalletPage() {
  const { user, updateProfile } = useAuth();

  const [withdrawAmount, setWithdrawAmount] = useState<string>("200");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const isMockAllowed = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const isDemoUser = isMockAllowed && user?.id === "usr_demo_ke_01";

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    return isDemoUser ? INITIAL_TRANSACTIONS : [];
  });

  const availableBalance = user?.availableBalance ?? (isDemoUser ? 850 : 0);
  const pendingBalance = user?.pendingBalance ?? (isDemoUser ? 600 : 0);
  const totalEarned = user?.totalEarned ?? (isDemoUser ? 1450 : 0);
  const totalWithdrawn = user?.totalWithdrawn ?? 0;
  const mpesaNumber = user?.phoneNumber ?? "";

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!user?.isPhoneVerified) {
      setErrorMsg("Phone number verification is required before initiating an M-Pesa withdrawal.");
      return;
    }

    const amount = Number(withdrawAmount);

    if (isNaN(amount) || amount < 100) {
      setErrorMsg("Minimum withdrawal amount is KES 100.");
      return;
    }

    if (amount > availableBalance) {
      setErrorMsg(`Insufficient available balance. You have KES ${availableBalance.toFixed(2)}.`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const newTx: WalletTransaction = {
        id: `tx-mpesa-${Date.now()}`,
        type: "mpesa_withdrawal",
        title: `M-Pesa B2C Payout to ${mpesaNumber}`,
        amount: amount,
        status: "completed",
        timestamp: new Date().toISOString(),
        receiptNumber: `SJD${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: "Automated instant Daraja B2C disbursement.",
      };

      setTransactions((prev) => [newTx, ...prev]);

      updateProfile({
        availableBalance: availableBalance - amount,
        totalWithdrawn: totalWithdrawn + amount,
      });

      setIsProcessing(false);
      setSuccessMsg(
        `Withdrawal of KES ${amount} to ${mpesaNumber} completed successfully. Receipt: ${newTx.receiptNumber}`
      );
      setWithdrawAmount("");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card (Solid Fintech Card) */}
      <section className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-8 text-[var(--text-primary)] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)] flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Verified M-Pesa Wallet
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/30 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Daraja Connected</span>
            </div>
          </div>

          {/* Big Available Balance Display */}
          <div className="mt-6">
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Available for Withdrawal
            </span>
            <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] numeral-bold mt-1 font-display">
              KES {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 3 Secondary Financial Metrics */}
          <div className="mt-8 grid grid-cols-3 gap-2.5 pt-5 border-t border-[var(--border-subtle)]">
            <div className="bg-[var(--bg-card-elevated)] rounded-[14px] p-3 border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block font-medium">Pending Reviews</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--accent-gold)] numeral-bold mt-0.5 block">
                KES {pendingBalance.toLocaleString()}
              </span>
            </div>
            <div className="bg-[var(--bg-card-elevated)] rounded-[14px] p-3 border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block font-medium">Total Earned</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--accent-green)] numeral-bold mt-0.5 block">
                KES {totalEarned.toLocaleString()}
              </span>
            </div>
            <div className="bg-[var(--bg-card-elevated)] rounded-[14px] p-3 border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block font-medium">Total Withdrawn</span>
              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] numeral-bold mt-0.5 block">
                KES {totalWithdrawn.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Withdrawal Form Card */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-6 sm:p-7 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
        <h2 className="text-base sm:text-lg font-bold text-[#0F1F3D]">
          Request M-Pesa Payout
        </h2>
        <p className="text-xs text-[#6B7A99] mt-0.5">
          Disbursements are sent via Safaricom Daraja B2C directly to your registered line within 60 seconds.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-[12px] bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-xs text-[#16A34A] flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {!user?.isPhoneVerified && (
          <div className="mt-4 p-4 rounded-[14px] bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Phone Verification Required for M-Pesa Withdrawals</p>
              <p className="text-[#6B7A99]">
                To protect your earnings and satisfy Kenya anti-fraud regulations, payouts can only be disbursed to a verified phone line.
              </p>
              <a
                href={`/auth/verify-otp?phone=${encodeURIComponent(user?.phoneNumber || "")}`}
                className="inline-flex items-center gap-1 font-bold text-[#1E6FD9] hover:underline pt-1"
              >
                Verify Phone Number Now →
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F1F3D] mb-1.5">
              Payout Phone Number
            </label>
            <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-xs text-[#0F1F3D]">
              <Phone className="w-4 h-4 text-[#1E6FD9]" />
              <span className="font-bold">{mpesaNumber}</span>
              {user?.isPhoneVerified ? (
                <span className="ml-auto text-[10px] text-[#16A34A] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                  Verified Line
                </span>
              ) : (
                <span className="ml-auto text-[10px] text-amber-600 font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60">
                  Unverified
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F1F3D] mb-1.5">
              Amount (KES) — Minimum KES 100
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-[#6B7A99]">
                KES
              </span>
              <input
                type="number"
                min={100}
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="200"
                className="w-full h-11 pl-12 pr-4 text-sm rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-[#0F1F3D] font-bold focus:outline-hidden focus:bg-white focus:border-[#1E6FD9] focus:ring-2 focus:ring-[#1E6FD9]/20 transition-all"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex gap-2 mt-2.5">
              {[100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWithdrawAmount(preset.toString())}
                  disabled={preset > availableBalance}
                  className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-[#EAF3FF] text-[#0A3D91] hover:bg-[#D9E9FF] border border-blue-200/50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  KES {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isProcessing}
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Confirm M-Pesa Withdrawal
            </Button>
          </div>
        </form>
      </section>

      {/* Transaction History Section */}
      <section className="rounded-[20px] bg-white border border-blue-100/70 p-6 sm:p-7 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-[#0F1F3D]">
            Recent Transactions
          </h2>
          <span className="text-xs font-medium text-[#6B7A99]">
            {transactions.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isWithdrawal = tx.type === "mpesa_withdrawal";
            return (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                      isWithdrawal
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-[#16A34A]"
                    }`}
                  >
                    {isWithdrawal ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#0F1F3D]">
                      {tx.title}
                    </p>
                    <p className="text-[11px] text-[#6B7A99] mt-0.5">
                      {new Date(tx.timestamp).toLocaleString()} • {tx.receiptNumber || tx.id}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm sm:text-base font-extrabold numeral-bold block ${
                      isWithdrawal ? "text-[#0F1F3D]" : "text-[#16A34A]"
                    }`}
                  >
                    {isWithdrawal ? "-" : "+"}KES {tx.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
