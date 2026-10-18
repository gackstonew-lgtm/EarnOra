"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (targetTheme: Theme) => {
    let resolved: "light" | "dark" = "light";
    if (targetTheme === "system") {
      const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      resolved = prefersDark ? "dark" : "light";
    } else {
      resolved = targetTheme;
    }
    setResolvedTheme(resolved);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", resolved === "dark");
      // Update meta theme-color to match active background token
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.setAttribute("name", "theme-color");
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute("content", resolved === "dark" ? "#070C18" : "#FFFFFF");
    }
  };

  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem("earnora_theme") as Theme) || "light";
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } catch {
      applyTheme("light");
    }

    // Listen to OS system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentSaved = (localStorage.getItem("earnora_theme") as Theme) || "light";
      if (currentSaved === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    setMounted(true);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("earnora_theme", newTheme);
      applyTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
