import localFont from "next/font/local";

/**
 * Type System for EarnOra
 *
 * Local font loader using `next/font/local`:
 * - Exposes `--font-display` and `--font-body` with `display: "swap"`, preloaded,
 *   and adjustFontFallback enabled.
 * - When licensed Aveton font files (.woff2) are provided in `/src/fonts/aveton.woff2`,
 *   swap the src path in `fontDisplay` below to `"../fonts/aveton.woff2"`.
 * - Zero network dependency during `next build` on Vercel or restricted environments.
 */

// Companion body font
export const fontBody = localFont({
  src: [
    {
      path: "../fonts/segoeui.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/segoeuib.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
  preload: true,
  fallback: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

// Display font (Aveton configuration; stand-in mapped locally)
export const fontDisplay = localFont({
  src: [
    {
      path: "../fonts/segoeuib.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: [
    "Outfit",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});
