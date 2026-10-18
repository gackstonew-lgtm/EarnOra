import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PwaInstallBanner } from "@/components/ui/PwaInstallBanner";

export const metadata: Metadata = {
  title: "Earnora — Review. Earn. Grow. | Real M-Pesa Earnings",
  description:
    "Turn your honest opinions into real M-Pesa earnings. Review verified hotels, apps, local services, and fintechs in Kenya.",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/earnora-logo-dark.jpg",
    apple: "/assets/earnora-logo-dark.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#070C18",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col selection:bg-emerald-500 selection:text-black">
        <ThemeProvider>
          <AuthProvider>
            <PwaInstallBanner />
            <AppHeader />
            <main className="flex-1 pb-24 max-w-4xl w-full mx-auto px-4 pt-4">
              {children}
            </main>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
