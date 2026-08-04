import type { Metadata, Viewport } from "next";
import { Outfit, Source_Serif_4 } from "next/font/google";
import { ru } from "@/lib/i18n/ru";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
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
    <html lang="ru">
      <body
        className={`${outfit.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
