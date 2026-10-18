import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { fontBody, fontDisplay } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "EarnOra — Review. Earn. Grow. | Real M-Pesa Earnings",
    template: "%s | EarnOra Kenya",
  },
  description:
    "Turn your honest opinions into real M-Pesa earnings in Kenya. Review hotels, apps, local businesses, telcos, and products. Verified bounties, transparent moderation, and instant Daraja B2C payouts.",
  applicationName: "EarnOra",
  authors: [{ name: "EarnOra Engineering Team" }],
  keywords: [
    "EarnOra",
    "Earn Money Kenya",
    "M-Pesa Earnings",
    "Review and Earn Kenya",
    "Daraja M-Pesa B2C",
    "Paid Surveys Nairobi",
    "App Reviews Kenya",
    "Make Money Online Kenya",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://earnora.co.ke",
    siteName: "EarnOra",
    title: "EarnOra — Turn your honest opinions into real M-Pesa earnings",
    description:
      "Join thousands of Kenyans earning real M-Pesa cash by submitting genuine reviews of restaurants, apps, and local businesses.",
    images: [
      {
        url: "/assets/earnora-logo-dark.jpg",
        width: 1200,
        height: 630,
        alt: "EarnOra Review and Earn Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EarnOra — Review. Earn. Grow.",
    description: "Turn your honest opinions into real M-Pesa earnings across Kenya.",
    images: ["/assets/earnora-logo-dark.jpg"],
    creator: "@EarnOraKE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E6FD9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontBody.variable} ${fontDisplay.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('earnora_theme');
                var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-body selection:bg-[#1E6FD9] selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
