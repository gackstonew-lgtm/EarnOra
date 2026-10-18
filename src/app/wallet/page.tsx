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

    // Simulate Server-side Daraja B2C Payout with idempotency & ledger record
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
      {/* Wallet Balance Hero Card */}
      <section className="rounded-[22px] bg-gradient-to-br from-[#0B1A30] via-[#0D2447] to-[#071326] border border-emerald-500/30 p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
              Verified Wallet
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>M-Pesa Connected</span>
          </div>
        </div>

        {/* Big Available Balance Display */}
        <div className="mt-5">
          <span className="text-xs text-slate-300 font-medium">Available for Withdrawal</span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white numeral-bold mt-1">
            KES {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* 3 Secondary Financial Metrics */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-700/60">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Pending Rewards</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300 numeral-bold mt-0.5 block">
              KES {pendingBalance.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Earned</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 numeral-bold mt-0.5 block">
              KES {totalEarned.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Withdrawn</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 numeral-bold mt-0.5 block">
              KES {totalWithdrawn.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* Withdrawal Form Card */}
      <section className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Request M-Pesa Payout
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Disbursements are sent via Safaricom Daraja B2C directly to your registered line.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Payout Phone Number
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#132347] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span className="font-bold">{mpesaNumber}</span>
              <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Default Payout Line
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (KES) — Minimum KES 100
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                KES
              </span>
              <input
                type="number"
                min={100}
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="200"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex gap-2 mt-2">
              {[100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWithdrawAmount(preset.toString())}
                  disabled={preset > availableBalance}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#162752] text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20 disabled:opacity-40"
                >
                  KES {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || availableBalance < 100}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Withdraw to M-Pesa</span>
                <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </section>

      {/* Transaction History Ledger */}
      <section className="rounded-[22px] bg-white dark:bg-[#0F1A2E] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>Financial Activity Ledger</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === "mpesa_withdrawal"
                      ? "bg-rose-500/15 text-rose-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {tx.type === "mpesa_withdrawal" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    {tx.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(tx.timestamp).toLocaleDateString()} • {tx.status}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-black text-xs sm:text-sm numeral-bold ${
                    tx.type === "mpesa_withdrawal"
                      ? "text-rose-500"
                      : "text-emerald-500"
                  }`}
                >
                  {tx.type === "mpesa_withdrawal" ? "-" : "+"}KES {tx.amount.toFixed(2)}
                </span>
                {tx.receiptNumber && (
                  <span className="block text-[10px] text-slate-400">
                    {tx.receiptNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
