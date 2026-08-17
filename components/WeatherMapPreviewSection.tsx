"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ru } from "@/lib/i18n/ru";
import { buildCityUrl } from "@/lib/cities";
import { SectionHeading } from "@/components/SectionHeading";

const DynamicRadarMap = dynamic(() => import("@/components/RadarMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:h-96 animate-pulse flex flex-col items-center justify-center gap-2 text-xs text-cloud-500">
      <div className="h-6 w-6 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      <span>Загрузка интерактивной карты…</span>
    </div>
  ),
});

const REGIONAL_HUBS = [
  { id: "moscow", name: "Москва и Центр", slug: "moscow", lat: 55.7558, lon: 37.6173 },
  { id: "spb", name: "Санкт-Петербург", slug: "saint-petersburg", lat: 59.9343, lon: 30.3351 },
  { id: "sochi", name: "Сочи и Юг", slug: "sochi", lat: 43.6028, lon: 39.7342 },
  { id: "ekaterinburg", name: "Екатеринбург и Урал", slug: "yekaterinburg", lat: 56.8389, lon: 60.6057 },
];

const MAP_LAYERS = [
  { id: "precip", label: "Осадки", icon: "🌧️" },
  { id: "temp", label: "Температура", icon: "🌡️" },
  { id: "wind", label: "Ветер", icon: "💨" },
  { id: "clouds", label: "Облачность", icon: "☁️" },
];

export function WeatherMapPreviewSection() {
  const [selectedHub, setSelectedHub] = useState(REGIONAL_HUBS[0]);
  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS[0].id);

  return (
    <section id="weather-map" className="scroll-mt-24 rounded-3xl bg-white/95 p-6 border border-sky-200/90 shadow-lg shadow-sky-900/5 backdrop-blur-md ring-1 ring-white/80 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading
          action={
            <Link
              href={buildCityUrl(selectedHub)}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline transition-colors"
            >
              Карта погоды {selectedHub.name} &rarr;
            </Link>
          }
        >
          {ru.weatherOnMap}
        </SectionHeading>

        {/* Map Layer Switcher Tabs matching Gismeteo */}
        <div className="flex items-center gap-1 rounded-xl bg-sky-100/70 p-1 text-xs font-medium">
          {MAP_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                activeLayer === layer.id
                  ? "bg-white text-sky-950 font-bold shadow-2xs ring-1 ring-sky-200"
                  : "text-sky-800 hover:text-sky-950 hover:bg-sky-200/50"
              }`}
            >
              <span>{layer.icon}</span>
              <span>{layer.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {REGIONAL_HUBS.map((hub) => {
          const isSelected = hub.id === selectedHub.id;
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHub(hub)}
              className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ring-1 ${
                isSelected
                  ? "bg-sky-700 text-white ring-sky-800 shadow-sm"
                  : "bg-sky-50/70 text-sky-950 ring-sky-100 hover:bg-sky-100/70"
              }`}
            >
              <span className="text-xs font-semibold leading-tight">{hub.name}</span>
              <span
                className={`mt-1 text-[10px] ${
                  isSelected ? "text-sky-100" : "text-cloud-500"
                }`}
              >
                Карта: {MAP_LAYERS.find((l) => l.id === activeLayer)?.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[18rem] sm:min-h-[24rem] w-full overflow-hidden rounded-xl ring-1 ring-sky-100/80">
        <DynamicRadarMap
          key={`${selectedHub.id}-${activeLayer}`}
          latitude={selectedHub.lat}
          longitude={selectedHub.lon}
          cityName={selectedHub.name}
          layer={activeLayer as "precip" | "temp" | "wind" | "clouds"}
        />
      </div>
    </section>
  );
}
