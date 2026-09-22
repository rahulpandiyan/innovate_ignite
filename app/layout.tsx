import React from "react";
import "./globals.css";
import AuthContextProvider from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-provider";
import { SiteChrome } from "@/components/SiteChrome";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Playfair_Display, Rajdhani, DM_Sans, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const rajdhani = Rajdhani({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-rajdhani" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata = {
  metadataBase: new URL("https://www.vvitinnovateignite.com"),
  title: {
    default: "Home - VVIT Innovate Ignite",
    template: "%s - VVIT Innovate Ignite",
  },
  description:
    "Vijaya Vittala Institute Of Technology presents Innovate Ignite, a celebration of innovation, creativity, and technology. Explore events, workshops, and performances designed for a memorable experience.",
  keywords: [
    "VVIT Innovate Ignite",
    "VVIT",
    "Innovate Ignite",
    "Vijaya Vittala Institute Of Technology",
    "college fest",
    "tech fest",
    "university festival",
    "innovation",
    "creativity",
    "technology events",
  ],
  authors: [{ name: "Bhuvan S A", url: "https://www.bhuvansa.com/" }],
  creator: "Bhuvan S A",
  publisher: "Vijaya Vittala Institute Of Technology",
  openGraph: {
    url: "https://www.vvitinnovateignite.com",
    siteName: "VVIT Innovate Ignite",
    type: "website",
    title: "VVIT Innovate Ignite",
    description:
      "Join VVIT Innovate Ignite, a celebration of innovation, creativity, and technology with events, workshops, and performances designed for an unforgettable experience.",
    images: [
      {
        url: "https://www.vvitinnovateignite.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VVIT Innovate Ignite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VVIT Innovate Ignite",
    description:
      "Experience the best of innovation and creativity at VVIT Innovate Ignite.",
    site: "@vvitinnovateignite",
    creator: "@bhuvansa",
    images: ["https://www.vvitinnovateignite.com/images/og-image.jpg"],
  },
};

// Global layout for pages
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${rajdhani.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body text-gat-charcoal bg-white antialiased">
        <ThemeProvider>
          <AuthContextProvider>
            <SiteChrome>{children}</SiteChrome>
            <Analytics />
            <SpeedInsights />
            <Toaster
              theme="light"
              toastOptions={{
                style: {
                  background: "#1a3a8b",
                  color: "#ffffff",
                  border: "1px solid #2362ec",
                },
                classNames: {
                  description: "!text-white/80",
                },
              }}
            />
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
