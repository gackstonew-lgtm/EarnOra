"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  Phone,
  CreditCard,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { AdvertiserNav } from "@/components/advertiser/AdvertiserNav";
import { Button, Card, Badge } from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  confirmTopUpPaymentCallback,
  createPendingTopUpPayment,
  getActiveAdvertiserAndWallet,
  getAdsState,
} from "@/lib/ads/store";
import {
  AdvertiserLedgerEntry,
  AdvertiserProfile,
  AdvertiserWallet,
  PaymentGatewayProvider,
  PaymentRecord,
} from "@/lib/ads/types";

export default function AdvertiserWalletPage() {
  const { user } = useAuth();
  const [advertiser, setAdvertiser] = useState<AdvertiserProfile | null>(null);
  const [wallet, setWallet] = useState<AdvertiserWallet | null>(null);
  const [ledger, setLedger] = useState<AdvertiserLedgerEntry[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Top-up form state
  const [provider, setProvider] = useState<PaymentGatewayProvider>("mpesa_stk");
  const [amountInput, setAmountInput] = useState("10000");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [pendingPayment, setPendingPayment] = useState<PaymentRecord | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadWalletData = () => {
    const state = getAdsState();
    const { advertiser: adv, wallet: wal } = getActiveAdvertiserAndWallet(user?.id);
    setAdvertiser(adv);
    setWallet(wal);
    setLedger(state.ledger.filter((l) => l.advertiserId === adv.id));
    setPayments(state.payments.filter((p) => p.advertiserId === adv.id));
    if (!phoneOrEmail) {
      setPhoneOrEmail(adv.phone);
    }
  };

  useEffect(() => {
    loadWalletData();
    const handler = () => loadWalletData();
    window.addEventListener("earnora_ads_state_updated", handler);
    return () => window.removeEventListener("earnora_ads_state_updated", handler);
  }, [user?.id]);

  const handleInitiateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    if (!advertiser || !wallet) return;

    const cleanAmount = Math.trunc(Number(amountInput));
    if (!Number.isSafeInteger(cleanAmount) || cleanAmount < 100) {
      setErrorMsg("Minimum top-up amount is KES 100 (whole integer KES).");
      return;
    }

    setIsInitiating(true);
    try {
      const payment = createPendingTopUpPayment({
        advertiserId: advertiser.id,
        walletId: wallet.id,
        provider,
        amountKes: cleanAmount,
        phoneOrEmail:
          phoneOrEmail ||
          (provider === "mpesa_stk" ? advertiser.phone : advertiser.email),
      });

      setPendingPayment(payment);
      setStatusMsg(
        provider === "mpesa_stk"
          ? `Sandbox M-Pesa Daraja STK Push initiated (${payment.gatewayReference}). Click "Confirm Sandbox Webhook Callback" below to credit KES ${cleanAmount.toLocaleString()}.`
          : `Sandbox ${provider.toUpperCase()} Card Checkout initialized (${payment.gatewayReference}). Click "Confirm Sandbox Webhook Callback" below to credit KES ${cleanAmount.toLocaleString()}.`
      );
      loadWalletData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to initiate top-up.");
    } finally {
      setIsInitiating(false);
    }
  };

  const handleSimulateWebhookCallback = (payment: PaymentRecord) => {
    setErrorMsg("");
    try {
      const res = confirmTopUpPaymentCallback({
        gatewayReference: payment.gatewayReference,
        rawPayload: {
          simulatedSandboxCallback: true,
          provider: payment.provider,
          gatewayReference: payment.gatewayReference,
          amountKes: payment.amountKes,
        },
      });

      if (res.idempotent) {
        setStatusMsg(
          `Idempotent Callback Verified: Reference ${payment.gatewayReference} was already credited. Wallet balance unchanged at KES ${res.wallet.balanceKes.toLocaleString()} (no double credit).`
        );
      } else {
        setStatusMsg(
          `Webhook Confirmed! KES ${payment.amountKes.toLocaleString()} credited to your Campaign Wallet. New Balance: KES ${res.wallet.balanceKes.toLocaleString()}.`
        );
      }
      setPendingPayment(res.payment);
      loadWalletData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Callback confirmation failed.");
    }
  };

  const handleDownloadInvoice = (entry: AdvertiserLedgerEntry) => {
    if (!advertiser) return;
    const invoiceCode = entry.invoiceNumber || `REC-${entry.id.slice(-6).toUpperCase()}`;
    const receiptText = [
      "============================================================",
      "                 EARNORA KENYA — OFFICIAL RECEIPT           ",
      "============================================================",
      `Invoice / Receipt No : ${invoiceCode}`,
      `Transaction Reference: ${entry.referenceId}`,
      `Date & Time (EAT)    : ${new Date(entry.createdAt).toLocaleString()}`,
      `Business Name        : ${advertiser.businessName}`,
      `Contact Person       : ${advertiser.contactPerson} (${advertiser.email})`,
      "------------------------------------------------------------",
      `Transaction Type     : ${entry.txType.toUpperCase()}`,
      `Description          : ${entry.description}`,
      `Direction            : ${entry.direction.toUpperCase()}`,
      `Amount (Integer KES) : KES ${entry.amountKes.toLocaleString()}`,
      `Balance Before       : KES ${entry.balanceBeforeKes.toLocaleString()}`,
      `Balance After        : KES ${entry.balanceAfterKes.toLocaleString()}`,
      "------------------------------------------------------------",
      "Status               : COMPLETED (APPEND-ONLY VERIFIED LEDGER)",
      "Note                 : Sandbox / Pre-Live Receipt.",
      "============================================================",
    ].join("\n");

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceCode}-Earnora.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AdvertiserNav />

      {/* Wallet Hero Summary Card */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Sandbox Mode Active (No Real Charges)
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-display mt-2">
              Campaign Escrow Wallet
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Top up via Safaricom M-Pesa Daraja STK Push or Card (Paystack / Flutterwave). All balances are stored in whole integer KES.
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-[var(--text-muted)] font-medium block">
              Available Balance
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--accent-green)] numeral-bold font-display">
              KES {(wallet?.balanceKes ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-muted)] font-medium block">
              Held in Campaign Escrow
            </span>
            <span className="text-base font-extrabold text-[var(--accent-gold)] numeral-bold mt-0.5 block">
              KES {(wallet?.heldKes ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-muted)] font-medium block">
              Total Top-Ups Funded
            </span>
            <span className="text-base font-extrabold text-[var(--text-primary)] numeral-bold mt-0.5 block">
              KES {(wallet?.totalFundedKes ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-muted)] font-medium block">
              Total Campaign Spend
            </span>
            <span className="text-base font-extrabold text-[var(--brand-blue)] numeral-bold mt-0.5 block">
              KES {(wallet?.totalSpentKes ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Top-Up Form & Sandbox Webhook Simulator */}
      <Card padding="lg" className="space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-display">
            Top Up Campaign Wallet (Money In)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Select M-Pesa Daraja STK Push or Card Gateway. Wallets are credited only after verified, idempotent webhook confirmation.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-3.5 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--accent-green)] flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Gateway Adapter Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setProvider("mpesa_stk");
              setPhoneOrEmail(advertiser?.phone || "+254722987654");
            }}
            className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer flex items-center gap-3 ${
              provider === "mpesa_stk"
                ? "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)]"
                : "bg-[var(--bg-card-elevated)] border-[var(--border-subtle)]"
            }`}
          >
            <Phone className="w-5 h-5 text-[var(--accent-green)] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                M-Pesa Daraja STK Push
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Instant Lipa Na M-Pesa prompt
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setProvider("paystack");
              setPhoneOrEmail(advertiser?.email || "billing@company.co.ke");
            }}
            className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer flex items-center gap-3 ${
              provider === "paystack"
                ? "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)]"
                : "bg-[var(--bg-card-elevated)] border-[var(--border-subtle)]"
            }`}
          >
            <CreditCard className="w-5 h-5 text-[var(--brand-blue)] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                Card via Paystack
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Visa, Mastercard & Apple Pay
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setProvider("flutterwave");
              setPhoneOrEmail(advertiser?.email || "billing@company.co.ke");
            }}
            className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer flex items-center gap-3 ${
              provider === "flutterwave"
                ? "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)]"
                : "bg-[var(--bg-card-elevated)] border-[var(--border-subtle)]"
            }`}
          >
            <CreditCard className="w-5 h-5 text-[var(--accent-gold)] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                Card via Flutterwave
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Pan-African card checkout
              </p>
            </div>
          </button>
        </div>

        <form onSubmit={handleInitiateTopUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Top-Up Amount (Whole KES)
            </label>
            <input
              type="number"
              min={100}
              step={1}
              required
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full h-11 px-3.5 text-sm font-bold rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              {provider === "mpesa_stk" ? "M-Pesa Phone Number" : "Billing Email Address"}
            </label>
            <input
              type="text"
              required
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isInitiating}
            fullWidth
          >
            {provider === "mpesa_stk"
              ? "Send STK Push (Sandbox)"
              : `Pay KES ${Number(amountInput || 0).toLocaleString()} (Sandbox)`}
          </Button>
        </form>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {[5000, 10000, 25000, 50000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountInput(String(preset))}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/20 border border-[var(--brand-blue)]/20 cursor-pointer"
            >
              + KES {preset.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Sandbox Webhook Confirmation Box */}
        {pendingPayment && (
          <div className="p-4 rounded-[14px] bg-[var(--bg-card-elevated)] border border-[var(--brand-blue)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-[var(--text-primary)]">
                Sandbox Payment Reference: {pendingPayment.gatewayReference}
              </p>
              <p className="text-[var(--text-muted)]">
                Invoice: {pendingPayment.invoiceNumber} • Amount: KES{" "}
                {pendingPayment.amountKes.toLocaleString()} • Status:{" "}
                <strong className="uppercase">{pendingPayment.status}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleSimulateWebhookCallback(pendingPayment)}
              >
                {pendingPayment.status === "completed"
                  ? "Test Duplicate Webhook (Idempotent)"
                  : "Confirm Sandbox Webhook Callback"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Append-Only Ledger & Downloadable Receipts */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-display">
              Immutable Transaction Ledger & Invoices
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Append-only financial history ({ledger.length} entries). Download official receipts for accounting.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {ledger.map((entry) => {
            const isCredit = entry.direction === "credit";
            return (
              <div
                key={entry.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                      isCredit
                        ? "bg-emerald-500/15 text-[var(--accent-green)]"
                        : "bg-[var(--brand-blue)]/15 text-[var(--brand-blue)]"
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {entry.description}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {new Date(entry.createdAt).toLocaleString()} • Ref: {entry.referenceId} •{" "}
                      <span className="uppercase font-semibold">{entry.txType.replace("_", " ")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-sm font-extrabold numeral-bold block ${
                        isCredit ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {isCredit ? "+" : "-"}KES {entry.amountKes.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] numeral-bold">
                      Balance After: KES {entry.balanceAfterKes.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(entry)}
                    className="px-3 py-1.5 rounded-[10px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Download Receipt / Invoice"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--brand-blue)]" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
