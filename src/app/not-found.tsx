"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-8 text-center space-y-5 shadow-sm">
        <div className="flex justify-center">
          <EarnoraLogo size="md" href={isAuthenticated ? "/dashboard" : "/auth/login"} />
        </div>

        <div className="space-y-2">
          <span className="text-4xl sm:text-5xl font-black text-[var(--brand-blue)] font-display block">
            404
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-display">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been moved, or requires authentication.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-bold hover:opacity-95 transition-opacity"
            >
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] bg-[var(--brand-blue)] text-white text-xs font-bold hover:opacity-95 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </Link>
          )}

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
