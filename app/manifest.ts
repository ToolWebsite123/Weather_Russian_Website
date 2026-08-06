import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeatherHub — Точный прогноз погоды",
    short_name: "WeatherHub",
    description:
      "Точный прогноз погоды в городах России и мира. Температура, осадки, УФ-индекс, геомагнитная активность и состояние дорог.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f7ff",
    theme_color: "#0c87ea",
    // NOTE: PWA manifest uses public/icon.svg as a scalable vector icon.
    // For maximum compatibility across legacy Android/iOS home screen shortcuts,
    // dedicated 192x192 and 512x512 PNG raster icons can be added in the future.
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
