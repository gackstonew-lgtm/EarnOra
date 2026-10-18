import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E6FD9",
          gradientEnd: "#0B4FB3",
          deep: "#0A3D91",
          sky: "#EAF3FF",
          input: "#EEF3FF",
          navy: "#0F1F3D",
          muted: "#6B7A99",
          success: "#16A34A",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        earnora: {
          blue: "#1E6FD9",
          deepBlue: "#0A3D91",
          darkBlue: "#0B4FB3",
          skyTint: "#EAF3FF",
          inputBg: "#EEF3FF",
          navy: "#0F1F3D",
          muted: "#6B7A99",
          green: "#16A34A",
          emerald: "#16A34A",
          amber: "#F59E0B",
          red: "#EF4444",
          surface: {
            light: "#FFFFFF",
            lightCard: "#FFFFFF",
            lightBorder: "#E2E8F0",
            bg: "#F8FAFC",
            input: "#EEF3FF",
            dark: "#0F1F3D",
            darkCard: "#132347",
            darkBorder: "#1C3160",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "-apple-system", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "-apple-system", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "input": "12px",
        "btn": "12px",
        "card": "20px",
        "device": "24px",
        "20px": "20px",
        "24px": "24px",
      },
      boxShadow: {
        "blue-btn": "0 4px 14px 0 rgba(30, 111, 217, 0.28)",
        "blue-btn-hover": "0 6px 20px 0 rgba(11, 79, 179, 0.35)",
        "soft-card": "0 4px 20px -2px rgba(15, 31, 61, 0.06)",
        "glow-green": "0 0 25px -5px rgba(22, 163, 74, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
