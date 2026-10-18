"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  rounded = "md",
  ...props
}) => {
  const roundedStyles = {
    sm: "rounded-md",
    md: "rounded-[12px]",
    lg: "rounded-[16px]",
    xl: "rounded-[20px]",
    full: "rounded-full",
  };

  return (
    <div
      className={`animate-pulse bg-[#EEF3FF] border border-blue-100/40 ${roundedStyles[rounded]} ${className}`}
      {...props}
    />
  );
};
