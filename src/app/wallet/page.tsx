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
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);

  const availableBalance = user?.availableBalance ?? 850;
  const pendingBalance = user?.pendingBalance ?? 600;
  const totalEarned = user?.totalEarned ?? 1450;
  const totalWithdrawn = user?.totalWithdrawn ?? 0;
  const mpesaNumber = user?.phoneNumber ?? "+254712345678";

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

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
      {/* Wallet Balance Hero Card (Royal Blue Gradient) */}
      <section className="rounded-[24px] bg-gradient-to-br from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] p-6 sm:p-8 text-white shadow-[0_12px_36px_rgba(11,79,179,0.22)] relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-sky-300/15 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white text-[#1E6FD9] flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Verified M-Pesa Wallet
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/25">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Daraja Connected</span>
            </div>
          </div>

          {/* Big Available Balance Display */}
          <div className="mt-6">
            <span className="text-xs text-blue-100 font-medium">
              Available for Withdrawal
            </span>
            <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white numeral-bold mt-1">
              KES {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 3 Secondary Financial Metrics */}
          <div className="mt-8 grid grid-cols-3 gap-2.5 pt-5 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-xs rounded-[14px] p-3 border border-white/15">
              <span className="text-[10px] text-blue-100 block font-medium">Pending Reviews</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 numeral-bold mt-0.5 block">
                KES {pendingBalance.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-[14px] p-3 border border-white/15">
              <span className="text-[10px] text-blue-100 block font-medium">Total Earned</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300 numeral-bold mt-0.5 block">
                KES {totalEarned.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-[14px] p-3 border border-white/15">
              <span className="text-[10px] text-blue-100 block font-medium">Total Withdrawn</span>
              <span className="text-xs sm:text-sm font-bold text-white numeral-bold mt-0.5 block">
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

        <form onSubmit={handleWithdrawal} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F1F3D] mb-1.5">
              Payout Phone Number
            </label>
            <div className="flex items-center gap-2.5 p-3 rounded-[12px] bg-[#EEF3FF] border border-blue-100/70 text-xs text-[#0F1F3D]">
              <Phone className="w-4 h-4 text-[#1E6FD9]" />
              <span className="font-bold">{mpesaNumber}</span>
              <span className="ml-auto text-[10px] text-[#16A34A] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                Verified Line
              </span>
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
