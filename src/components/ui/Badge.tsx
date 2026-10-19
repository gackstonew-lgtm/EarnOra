"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "blue" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "blue",
  size = "md",
  dot = false,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "text-xs px-2.5 py-0.5 gap-1",
    md: "text-xs sm:text-sm px-3 py-1 gap-1.5",
  };

  const variantStyles = {
    blue: "bg-blue-100 text-blue-900 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-500/40 font-semibold",
    success:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 border border-emerald-500/40 font-semibold",
    warning:
      "bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-200 border border-amber-500/40 font-semibold",
    danger:
      "bg-red-100 text-red-900 dark:bg-red-950/90 dark:text-red-200 border border-red-500/40 font-semibold",
    neutral:
      "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-400/40 font-semibold",
  };

  const dotColors = {
    blue: "bg-blue-600 dark:bg-blue-400",
    success: "bg-emerald-600 dark:bg-emerald-400",
    warning: "bg-amber-600 dark:bg-amber-400",
    danger: "bg-red-600 dark:bg-red-400",
    neutral: "bg-slate-600 dark:bg-slate-400",
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full select-none whitespace-nowrap
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`}
        />
      )}
      {children}
    </span>
  );
};
