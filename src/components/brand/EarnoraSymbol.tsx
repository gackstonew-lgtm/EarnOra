"use client";

import React from "react";

interface EarnoraSymbolProps {
  className?: string;
  size?: number;
  useWhiteBg?: boolean;
}

export const EarnoraSymbol: React.FC<EarnoraSymbolProps> = ({
  className = "",
  size = 48,
  useWhiteBg = true,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 ${
        useWhiteBg
          ? "bg-white shadow-[0_4px_16px_rgba(30,111,217,0.14)] border border-blue-100/70"
          : "bg-transparent"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[62%] h-[62%] select-none pointer-events-none"
        aria-label="EarnOra rocket brand mark"
      >
        {/* Right Wing / Fin */}
        <path
          d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
          fill="#1E6FD9"
          stroke="#1E6FD9"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left Wing / Fin */}
        <path
          d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"
          fill="#1E6FD9"
          stroke="#1E6FD9"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main Rocket Fuselage */}
        <path
          d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"
          fill="#1E6FD9"
          stroke="#1E6FD9"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Porthole Window */}
        <circle cx="15.2" cy="8.8" r="1.6" fill="#FFFFFF" />
        {/* Thrust Flame / Exhaust Plume */}
        <path
          d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"
          fill="#1E6FD9"
          stroke="#1E6FD9"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
