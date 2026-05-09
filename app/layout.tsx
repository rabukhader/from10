import type { Metadata } from "next";
import { Cairo, DM_Sans, JetBrains_Mono } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { appConfig } from "@/src/config";

import "./globals.css";

/*
 * Google Sans is not published on Google Fonts for third‑party apps.
 * DM Sans is a neutral geometric sans with a similar contemporary feel for Latin UI.
 */
const dmSans = DM_Sans({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
  variable: "--font-sans-ar",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${dmSans.variable} ${cairo.variable} ${jetbrainsMono.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
