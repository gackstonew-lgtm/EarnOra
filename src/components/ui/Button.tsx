"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gradient" | "secondary" | "outline" | "ghost" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-[12px] transition-all duration-200 select-none cursor-pointer focus:outline-hidden disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.985]";

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-6 text-base gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[var(--brand-blue)] text-white hover:opacity-95 transition-opacity shadow-xs",
      gradient:
        "bg-[var(--brand-blue)] text-white hover:opacity-95 transition-opacity shadow-xs",
      secondary:
        "bg-[var(--bg-card-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)]",
      outline:
        "border border-[var(--brand-blue)] text-[var(--brand-blue)] bg-transparent hover:bg-[var(--brand-blue)]/10",
      ghost:
        "text-[#6B7A99] hover:text-[#0F1F3D] hover:bg-[#EEF3FF] bg-transparent",
      success:
        "bg-[#16A34A] text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] hover:bg-[#15803D]",
      danger:
        "bg-[#EF4444] text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-[#DC2626]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
