"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Headphones, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { sanitizeText } from "@/lib/ads/validation";

export default function ContactSupportPage() {
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("reviewer_support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanitizeText(subject) || !sanitizeText(message)) return;
    setSubmitted(true);
  };

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[var(--brand-blue)] hover:underline"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-display tracking-tight mt-2">
          Contact & Support Desk
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Reach our support team for reviewer assistance, advertiser billing inquiries, or policy reports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Card padding="md" className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h2 className="font-bold text-[var(--text-primary)]">Reviewer Support</h2>
            <p className="text-[var(--text-muted)] mt-0.5">
              Task moderation questions & M-Pesa withdrawal assistance.
            </p>
            <p className="font-semibold text-[var(--brand-blue)] mt-1">
              support@earnora.co.ke
            </p>
          </div>
        </Card>

        <Card padding="md" className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-emerald-500/10 text-[var(--accent-green)] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h2 className="font-bold text-[var(--text-primary)]">Advertiser & Business Desk</h2>
            <p className="text-[var(--text-muted)] mt-0.5">
              Campaign approvals, wallet top-ups & billing invoices.
            </p>
            <p className="font-semibold text-[var(--accent-green)] mt-1">
              business@earnora.co.ke
            </p>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[var(--accent-green)] mx-auto" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Support Ticket Logged
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Thank you for contacting EarnOra Support. Our team will respond to{" "}
              <strong>{email}</strong> shortly.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--brand-blue)]" />
              <span>Send a Support Request</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Inquiry Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="reviewer_support">Reviewer Task / Payout Help</option>
                  <option value="advertiser_billing">Advertiser Wallet & Campaigns</option>
                  <option value="policy_report">Report Policy Violation / Fake Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question"
                className="w-full h-11 px-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include relevant campaign or transaction reference if applicable..."
                className="w-full p-3.5 text-sm rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>

            <Button type="submit" variant="primary">
              Submit Support Ticket
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
