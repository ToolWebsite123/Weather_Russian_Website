import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeatherHub — Точный прогноз погоды",
    short_name: "WeatherHub",
    description: "Точный прогноз погоды в городах России и мира. Температура, осадки, УФ-индекс, геомагнитная активность и состояние дорог.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f7ff",
    theme_color: "#0c87ea",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
