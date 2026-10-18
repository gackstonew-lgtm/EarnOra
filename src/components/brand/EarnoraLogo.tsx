"use client";

import React from "react";
import Link from "next/link";
import { EarnoraSymbol } from "./EarnoraSymbol";

interface EarnoraLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: "horizontal" | "vertical";
  variant?: "light" | "dark"; // 'light' is white text for blue backgrounds, 'dark' is navy text for light backgrounds
  href?: string;
  className?: string;
}

export const EarnoraLogo: React.FC<EarnoraLogoProps> = ({
  showTagline = false,
  size = "md",
  layout = "horizontal",
  variant = "dark",
  href = "/",
  className = "",
}) => {
  const symbolSizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const isLight = variant === "light";
  const textColor = isLight ? "text-white" : "text-[var(--text-primary)]";
  const accentColor = "text-[var(--brand-blue)]";
  const taglineColor = isLight ? "text-white/80" : "text-[var(--text-muted)]";

  const content = (
    <div
      className={`select-none ${
        layout === "vertical"
          ? "flex flex-col items-center text-center gap-3"
          : "inline-flex items-center gap-3"
      } ${className}`}
    >
      <EarnoraSymbol
        size={symbolSizes[size]}
        useWhiteBg={true}
      />

      <div className={`flex flex-col ${layout === "vertical" ? "items-center" : "leading-none"}`}>
        <div className="flex items-center">
          <span className={`font-extrabold tracking-tight font-display ${textColor} ${textSizes[size]}`}>
            Earn<span className={accentColor}>Ora</span>
          </span>
          <span className={`ml-1 w-1.5 h-1.5 rounded-full ${isLight ? "bg-white" : "bg-[#1E6FD9]"} self-baseline mt-1`} />
        </div>
        {showTagline && (
          <span className={`text-[10px] tracking-wider font-semibold uppercase mt-1 ${taglineColor}`}>
            Review. Earn. Grow.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
};
