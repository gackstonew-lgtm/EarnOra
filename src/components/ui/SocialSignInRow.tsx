"use client";

import React from "react";

interface SocialSignInRowProps {
  label?: string;
  onProviderClick?: (provider: "google" | "facebook" | "x" | "apple") => void;
  className?: string;
}

export const SocialSignInRow: React.FC<SocialSignInRowProps> = ({
  label = "Sign Up with",
  onProviderClick,
  className = "",
}) => {
  const handleClick = (provider: "google" | "facebook" | "x" | "apple") => {
    if (onProviderClick) {
      onProviderClick(provider);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center gap-3.5 my-2 ${className}`}>
      {/* Divider */}
      <div className="w-full flex items-center gap-3">
        <div className="h-px bg-slate-200/80 flex-1" />
        <span className="text-xs font-medium text-[#6B7A99] whitespace-nowrap">
          {label}
        </span>
        <div className="h-px bg-slate-200/80 flex-1" />
      </div>

      {/* Social Icon Buttons Row */}
      <div className="flex items-center justify-center gap-4">
        {/* Facebook */}
        <button
          type="button"
          onClick={() => handleClick("facebook")}
          aria-label="Continue with Facebook"
          title="Continue with Facebook"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF3FF] hover:bg-[#E2EDFF] text-[#1877F2] border border-blue-100 shadow-xs hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* X / Twitter */}
        <button
          type="button"
          onClick={() => handleClick("x")}
          aria-label="Continue with X"
          title="Continue with X"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF3FF] hover:bg-[#E2EDFF] text-[#0F1F3D] border border-blue-100 shadow-xs hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Google */}
        <button
          type="button"
          onClick={() => handleClick("google")}
          aria-label="Continue with Google"
          title="Continue with Google"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF3FF] hover:bg-[#E2EDFF] border border-blue-100 shadow-xs hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.9l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
            />
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => handleClick("apple")}
          aria-label="Continue with Apple"
          title="Continue with Apple"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EEF3FF] hover:bg-[#E2EDFF] text-[#0F1F3D] border border-blue-100 shadow-xs hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-1 .04-2.16.66-2.83 1.45-.58.67-1.1 1.77-.96 2.87 1.11.08 2.14-.48 2.8-1.28z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
