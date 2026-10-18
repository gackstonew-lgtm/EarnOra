"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export const ThemeToggle: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Toggle theme: current is ${theme} (${resolvedTheme})`}
      title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
      className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer border border-[var(--border-subtle)] ${className}`}
    >
      {theme === "light" && <Sun className="w-4 h-4 text-amber-500" />}
      {theme === "dark" && <Moon className="w-4 h-4 text-sky-400" />}
      {theme === "system" && <Laptop className="w-4 h-4 text-blue-500" />}
      {showLabel && (
        <span className="ml-2 text-xs font-semibold capitalize text-[var(--text-primary)]">
          {theme}
        </span>
      )}
    </button>
  );
};
