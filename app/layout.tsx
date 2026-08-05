import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { ru } from "@/lib/i18n/ru";
import { config } from "@/lib/config";
import { DomNodeFix } from "@/components/DomNodeFix";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-outfit",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "cyrillic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0c87ea",
};

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${ru.brand} — ${ru.homeTitle}`,
    template: `%s`,
  },
  description: ru.homeSubtitle,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        <DomNodeFix />
        {children}
      </body>
    </html>
  );
}
