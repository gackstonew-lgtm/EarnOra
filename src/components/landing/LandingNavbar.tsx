"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { EarnoraLogo } from "@/components/brand/EarnoraLogo";
import { useAuth } from "@/components/providers/AuthProvider";

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Earn", href: "#categories" },
    { label: "Why EarnOra", href: "#why-earnora" },
    { label: "For Businesses", href: "#for-businesses" },
    { label: "Levels", href: "#levels" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-blue-100/80 shadow-[0_4px_20px_rgba(15,31,61,0.04)]"
          : "bg-white/70 backdrop-blur-xs border-b border-blue-50/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <EarnoraLogo size="md" showTagline={false} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#6B7A99]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#1E6FD9] transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-bold text-xs flex items-center gap-1.5 shadow-blue-btn hover:brightness-105 active:scale-95 transition-all"
            >
              <span>Go to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2.5 rounded-[12px] text-xs font-bold text-[#0F1F3D] hover:bg-[#EEF3FF] transition-all"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-bold text-xs flex items-center gap-1.5 shadow-blue-btn hover:brightness-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="w-10 h-10 rounded-[12px] bg-[#EEF3FF] border border-blue-100 text-[#0F1F3D] flex items-center justify-center hover:bg-[#E2EDFF]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-blue-100/80 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-[#0F1F3D] hover:bg-[#EEF3FF] rounded-[10px] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-[12px] bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-blue-btn text-center"
              >
                <span>Go to App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-[12px] text-xs font-bold text-[#0F1F3D] bg-[#EEF3FF] text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-[12px] bg-gradient-to-r from-[#1E6FD9] to-[#0B4FB3] text-white font-bold text-xs shadow-blue-btn text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
