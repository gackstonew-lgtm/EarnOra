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
        earnora: {
          dark: "#070C18",
          darkNavy: "#0B1528",
          navy: "#0F1E3D",
          navyCard: "#132347",
          navyBorder: "#1C3160",
          teal: "#00647D",
          tealDark: "#004B5D",
          emerald: "#00E676",
          emeraldDark: "#05B85F",
          emeraldLight: "#69F0AE",
          blue: "#2563EB",
          cyan: "#00C2CB",
          gold: "#F59E0B",
          surface: {
            light: "#F8FAFC",
            lightCard: "#FFFFFF",
            lightBorder: "#E2E8F0",
            dark: "#0A101D",
            darkCard: "#0F1A2E",
            darkBorder: "#1B2A4A",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        "22px": "22px",
        "card": "22px",
      },
      boxShadow: {
        "glow-green": "0 0 25px -5px rgba(0, 230, 118, 0.25)",
        "glow-teal": "0 0 25px -5px rgba(0, 100, 125, 0.35)",
        "card-dark": "0 8px 30px rgba(0, 0, 0, 0.4)",
        "card-light": "0 8px 30px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
