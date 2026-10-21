import type { ReactNode } from "react";
import { ProductionScripts } from "@/components/production-scripts";
import { AdsterraDesktopRails } from "@/components/ads/adsterra-desktop-rails";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="fr" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      {/* AdSense remains disabled. */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ProductionScripts />
        <AdsterraDesktopRails />
      </body>
    </html>
  );
}
