"use client";

import React from "react";
import Link from "next/link";
import { EarnoraSymbol } from "./EarnoraSymbol";

interface EarnoraLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export const EarnoraLogo: React.FC<EarnoraLogoProps> = ({
  showTagline = false,
  size = "md",
  href = "/",
  className = "",
}) => {
  const symbolSizes = {
    sm: 32,
    md: 40,
    lg: 52,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <EarnoraSymbol size={symbolSizes[size]} />
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span
            className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}
          >
            Earn<span className="text-emerald-500">ora</span>
          </span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-500 self-baseline mt-1.5" />
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-500 dark:text-slate-400 mt-0.5">
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
