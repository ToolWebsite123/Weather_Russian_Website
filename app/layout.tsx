import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { ru } from "@/lib/i18n/ru";
import { config } from "@/lib/config";
import { DomNodeFix } from "@/components/DomNodeFix";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { UnitProvider } from "@/components/UnitContext";
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
  openGraph: {
    type: "website",
    siteName: ru.brand,
    locale: "ru_RU",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "WeatherHub — Точный прогноз погоды без рекламного шума",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        <DomNodeFix />
        <ServiceWorkerRegister />
        <UnitProvider>{children}</UnitProvider>

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {ymId && (
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${ymId}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
