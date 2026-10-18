"use client";

import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated" | "interactive";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = "",
      variant = "default",
      padding = "md",
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: "p-0",
      sm: "p-3.5",
      md: "p-5",
      lg: "p-6 sm:p-7",
      xl: "p-8 sm:p-10",
    };

    const variantStyles = {
      default:
        "bg-white border border-blue-100/60 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.06)]",
      flat:
        "bg-[#EEF3FF]/70 border border-blue-100/40",
      elevated:
        "bg-white border border-blue-100/70 shadow-[0_10px_30px_-4px_rgba(15,31,61,0.1)]",
      interactive:
        "bg-white border border-blue-100/60 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.06)] hover:shadow-[0_8px_25px_-2px_rgba(30,111,217,0.12)] hover:border-blue-200 transition-all duration-200 cursor-pointer",
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-[20px]
          text-[#0F1F3D]
          ${paddingStyles[padding]}
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
