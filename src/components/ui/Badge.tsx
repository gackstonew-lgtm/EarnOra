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
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    blue: "bg-[#EAF3FF] text-[#0A3D91] border border-blue-200/60",
    success: "bg-emerald-50 text-[#16A34A] border border-emerald-200/70 font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/70",
    danger: "bg-red-50 text-red-600 border border-red-200/70",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200/60",
  };

  const dotColors = {
    blue: "bg-[#1E6FD9]",
    success: "bg-[#16A34A]",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full select-none
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
