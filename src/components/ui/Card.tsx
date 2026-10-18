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
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs",
      flat:
        "bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)]",
      elevated:
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-md",
      interactive:
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-blue)] hover:shadow-md transition-all duration-200 cursor-pointer",
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-[20px]
          text-[var(--text-primary)]
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
