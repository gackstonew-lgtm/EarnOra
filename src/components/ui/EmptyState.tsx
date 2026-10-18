"use client";

import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-white rounded-[20px] border border-blue-100/60 shadow-[0_4px_20px_-2px_rgba(15,31,61,0.04)] ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[#EAF3FF] flex items-center justify-center text-[#1E6FD9] mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h4 className="text-base font-bold text-[#0F1F3D] mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-[#6B7A99] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
