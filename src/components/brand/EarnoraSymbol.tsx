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
          <linearGradient id="earnora-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#00D26A" />
          </linearGradient>
        </defs>

        {/* Dual interlocking brand mark: Value circle + growth circle */}
        <circle
          cx="20"
          cy="24"
          r="14"
          stroke="url(#earnora-blue-grad)"
          strokeWidth="3.5"
          className="drop-shadow-xs"
        />

        <circle
          cx="28"
          cy="24"
          r="13"
          stroke="url(#earnora-green-grad)"
          strokeWidth="3.5"
          className="drop-shadow-xs"
        />

        {/* Crisp checkmark verifying reviews */}
        <path
          d="M 18 24.5 L 23 29.5 L 32 17"
          stroke="#16A34A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
