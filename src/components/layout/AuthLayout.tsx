"use client";

import React from "react";
import Link from "next/link";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";
import { CloudDivider } from "@/components/brand/CloudDivider";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  activeTab?: "register" | "login" | "otp" | "forgot";
  pitch?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  activeTab = "login",
  pitch = "Turn your honest reviews into real M-Pesa earnings.",
}) => {
  return (
    <div className="min-h-screen bg-[#F0F5FC] flex items-center justify-center p-0 sm:p-4 md:p-8">
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-white sm:rounded-[28px] shadow-[0_15px_50px_rgba(15,31,61,0.1)] border border-blue-100/70 overflow-hidden min-h-screen sm:min-h-[660px] flex flex-col lg:flex-row">
        
        {/* ========================================================= */}
        {/* LEFT PANEL (DESKTOP) / TOP HEADER (MOBILE) - BLUE GRADIENT */}
        {/* ========================================================= */}
        <div className="relative bg-gradient-to-br from-[#1E6FD9] via-[#165FC4] to-[#0B4FB3] text-white flex flex-col justify-between shrink-0 lg:w-[45%] xl:w-[42%] overflow-hidden">
          
          {/* Mobile Header View */}
          <div className="lg:hidden flex flex-col items-center justify-center pt-10 pb-12 px-6 text-center relative z-10">
            <span className="text-xs uppercase tracking-widest font-semibold text-white/80 mb-2">
              Welcome to
            </span>
            <EarnoraLogo
              layout="vertical"
              variant="light"
              size="lg"
              showTagline={false}
              href="/"
            />
            <p className="text-xs text-blue-100 max-w-xs mt-3 leading-relaxed">
              {pitch}
            </p>
          </div>

          {/* Desktop Left Side View */}
          <div className="hidden lg:flex flex-col justify-between h-full p-10 xl:p-12 relative z-10">
            <div className="space-y-6">
              <span className="text-sm uppercase tracking-widest font-semibold text-white/80">
                Welcome to
              </span>
              <div className="pt-2">
                <EarnoraLogo
                  layout="vertical"
                  variant="light"
                  size="xl"
                  showTagline={false}
                  href="/"
                />
              </div>
              <p className="text-sm text-blue-100 leading-relaxed max-w-xs pt-4">
                {pitch}
              </p>
            </div>

            {/* Bottom Footer Links */}
            <div className="pt-8 border-t border-white/15 flex items-center gap-4 text-xs font-semibold tracking-wider uppercase text-white/80">
              <Link
                href="/auth/register"
                className={`transition-colors hover:text-white ${
                  activeTab === "register" ? "text-white underline underline-offset-4" : ""
                }`}
              >
                Create Account
              </Link>
              <span>|</span>
              <Link
                href="/"
                className="transition-colors hover:text-white"
              >
                Discover
              </Link>
            </div>
          </div>

          {/* Cloud Divider - Horizontal on mobile, Vertical on desktop */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 z-20">
            <CloudDivider orientation="horizontal" />
          </div>

          <div className="hidden lg:block absolute top-0 bottom-0 right-0 z-20 h-full">
            <CloudDivider orientation="vertical" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL (DESKTOP) / BOTTOM CONTENT (MOBILE) - WHITE  */}
        {/* ========================================================= */}
        <div className="flex-1 bg-white p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F1F3D]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#6B7A99] mt-1.5">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
