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
          ? "bg-white shadow-[0_4px_16px_rgba(11,79,179,0.12)] border border-blue-50/80"
          : "bg-transparent"
      } ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[62%] h-[62%]"
        aria-label="EarnOra logo symbol"
      >
        <defs>
          <linearGradient id="earnora-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E6FD9" />
            <stop offset="100%" stopColor="#0B4FB3" />
          </linearGradient>
          <linearGradient id="earnora-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1E6FD9" />
          </linearGradient>
        </defs>

        {/* Outer Coin / Dialogue Ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="url(#earnora-blue-grad)"
          strokeWidth="3.5"
          className="drop-shadow-xs"
        />

        {/* Dynamic verified opinion & earning checkmark / star motif */}
        <path
          d="M 16 24.5 L 21.5 30 L 32 18"
          stroke="url(#earnora-blue-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Mini Accent Sparkle / Coin Star */}
        <path
          d="M 32 11 L 33 13.5 L 35.5 14.5 L 33 15.5 L 32 18 L 31 15.5 L 28.5 14.5 L 31 13.5 Z"
          fill="url(#earnora-star-grad)"
        />
      </svg>
    </div>
  );
};
