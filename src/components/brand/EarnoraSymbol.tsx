"use client";

import React from "react";

interface EarnoraSymbolProps {
  className?: string;
  size?: number;
  useImage?: boolean;
}

export const EarnoraSymbol: React.FC<EarnoraSymbolProps> = ({
  className = "w-9 h-9",
  size = 36,
  useImage = false,
}) => {
  if (useImage) {
    return (
      <img
        src="/assets/earnora-logo-light.jpg"
        alt="Earnora Symbol"
        width={size}
        height={size}
        className={`rounded-full object-cover dark:hidden ${className}`}
      />
    );
  }

  // High-fidelity vector SVG reproducing the exact dual-circle interlocking checkmark identity
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: (size * 3) / 4 }}
      aria-label="Earnora brand mark"
    >
      <g>
        {/* Deep Teal Left Ring */}
        <path
          d="M 85 25
             C 45 25 15 55 15 95
             C 15 135 45 165 85 165
             C 105 165 122 157 135 144
             L 108 117
             C 101 124 93 128 85 128
             C 67 128 52 113 52 95
             C 52 77 67 62 85 62
             C 97 62 107 68 113 78
             L 135 56
             C 122 37 105 25 85 25 Z"
          fill="#005F73"
        />

        {/* Vibrant Emerald Right Ring */}
        <path
          d="M 155 25
             C 135 25 118 33 105 46
             L 132 73
             C 139 66 147 62 155 62
             C 173 62 188 77 188 95
             C 188 113 173 128 155 128
             C 143 128 133 122 127 112
             L 105 134
             C 118 153 135 165 155 165
             C 195 165 225 135 225 95
             C 225 55 195 25 155 25 Z"
          fill="#00E676"
        />

        {/* Dynamic Connected Checkmark Overlay */}
        <path
          d="M 75 92 
             L 108 125 
             C 114 131 124 131 130 125 
             L 190 65"
          stroke="currentColor"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white dark:text-[#070C18]"
        />
      </g>
    </svg>
  );
};
