"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

import type L from "leaflet";

type RadarFrame = {
  time: number;
  path: string;
};

type RainViewerResponse = {
  host: string;
  radar?: {
    past?: RadarFrame[];
    nowcast?: RadarFrame[];
  };
};

type MapLayer = "precip" | "temp" | "wind" | "clouds";

const RADAR_HUBS = [
  { name: "Москва и Центр", slug: "moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Санкт-Петербург", slug: "saint-petersburg", lat: 59.9343, lon: 30.3351 },
  { name: "Сочи и Юг", slug: "sochi", lat: 43.6028, lon: 39.7342 },
  { name: "Екатеринбург и Урал", slug: "yekaterinburg", lat: 56.8389, lon: 60.6057 },
];

const LAYER_LABELS: Record<MapLayer, string> = {
  precip: "Радар осадков",
  temp: "Температура",
  wind: "Ветер",
  clouds: "Облачность",
};

function findNearestHub(lat: number, lon: number) {
  let nearest = RADAR_HUBS[0];
  let minDist = Infinity;
  for (const hub of RADAR_HUBS) {
    const dist = Math.hypot(lat - hub.lat, lon - hub.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = hub;
    }
  }
  return { hub: nearest, dist: minDist };
}

export default function RadarMap({
  latitude,
  longitude,
  cityName,
  layer = "precip",
  showPrecip = true,
}: {
  latitude: number;
  longitude: number;
  cityName: string;
  layer?: MapLayer;
  showPrecip?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [precipError, setPrecipError] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(7);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.Layer | null>(null);

  const { hub: nearestHub, dist } = findNearestHub(latitude, longitude);
  const isOutside =
    dist > 25 && (latitude < 30 || latitude > 75 || longitude < 15 || longitude > 180);

  useEffect(() => {
    if (isOutside || !containerRef.current) return;

    let mapInstance: L.Map | null = null;

    async function initMap() {
      try {
        const LModule = (await import("leaflet")).default;
        if (!containerRef.current) return;

        mapInstance = LModule.map(containerRef.current, {
          center: [latitude, longitude],
          zoom: 7,
          scrollWheelZoom: false,
        });

        LModule.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapInstance);

        const cityPinIcon = LModule.divIcon({
          className: "custom-city-pin",
          html: `<div style="display:flex;align-items:center;justify-content:center;transform:translate(-50%,-100%);">
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="#006bc8"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          </div>`,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        });

        LModule.marker([latitude, longitude], { icon: cityPinIcon })
          .addTo(mapInstance)
          .bindPopup(cityName);

        mapRef.current = mapInstance;
      } catch {
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, cityName, isOutside]);

  useEffect(() => {
    if (!mapRef.current || !showPrecip || isOutside || layer !== "precip") return;

    let isMounted = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (isMounted) setPrecipError(true);
      controller.abort();
    }, 10000);

    async function fetchRadarFrames() {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error("RainViewer API failed");
        const data = (await res.json()) as RainViewerResponse;

        if (isMounted && data.radar?.past?.length) {
          setFrames(data.radar.past);
          setCurrentFrameIdx(data.radar.past.length - 1);
        } else if (isMounted) {
          setPrecipError(true);
        }
      } catch {
        if (isMounted) setPrecipError(true);
      }
    }

    fetchRadarFrames();
    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [showPrecip, isOutside, layer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isOutside) return;

    async function loadOverlay(targetMap: L.Map) {
      try {
        const LModule = await import("leaflet");

        if (layer === "precip" && frames.length > 0 && !precipError) {
          const currentFrame = frames[currentFrameIdx];
          if (currentFrame) {
            const tileLayer = LModule.tileLayer(currentFrame.path, {
              opacity: 0.65,
              zIndex: 1000,
            });
            if (tileLayer) {
              tileLayer.addTo(targetMap);
              overlayRef.current = tileLayer;
            }
          }
        } else if (layer === "temp") {
          const tileLayer = LModule.tileLayer(
            "https://tile.open-meteo.com/static/out/visualt.png",
            {
              opacity: 0.7,
              zIndex: 1000,
            }
          );
          if (tileLayer) {
            tileLayer.addTo(targetMap);
            overlayRef.current = tileLayer;
          }
        } else if (layer === "wind") {
          const tileLayer = LModule.tileLayer(
            "https://tile.open-meteo.com/static/out/wind.png",
            {
              opacity: 0.7,
              zIndex: 1000,
            }
          );
          if (tileLayer) {
            tileLayer.addTo(targetMap);
            overlayRef.current = tileLayer;
          }
        } else if (layer === "clouds") {
          const tileLayer = LModule.tileLayer(
            "https://tile.open-meteo.com/static/out/clouds.png",
            {
              opacity: 0.7,
              zIndex: 1000,
            }
          );
          if (tileLayer) {
            tileLayer.addTo(targetMap);
            overlayRef.current = tileLayer;
          }
        }
      } catch {
        // Overlay load failed silently
      }
    }

    loadOverlay(map);

    return () => {
      if (overlayRef.current && map) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [layer, frames, currentFrameIdx, precipError, isOutside]);

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % frames.length);
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  if (isOutside || mapError) {
    return (
      <section className="rounded-2xl bg-white/80 p-6 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-8 space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100/80 text-sky-700">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-sky-950">{ru.radarUnavailable}</h3>
          <p className="text-xs text-cloud-500">
            Локация «{cityName}» находится вне зоны покрытия метеорадара.
          </p>
        </div>
        {nearestHub && nearestHub.name !== cityName && (
          <div>
            <Link
              href={`/pogoda/${nearestHub.slug}`}
              className="inline-flex items-center gap-1 rounded-xl bg-sky-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-800"
            >
              {ru.viewNearestRadar(nearestHub.name)} &rarr;
            </Link>
          </div>
        )}
      </section>
    );
  }

  const currentFrame = frames[currentFrameIdx];
  const currentFrameTimeLabel = currentFrame
    ? new Date(currentFrame.time * 1000).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  const isPrecipLayer = layer === "precip";

  return (
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-h2 font-semibold text-sky-950">
            Карта погоды
          </h2>
          <p className="text-xs text-cloud-500">
            {LAYER_LABELS[layer]} · OpenStreetMap
          </p>
        </div>

        {/* Regional Zoom Control Presets */}
        <div className="flex items-center gap-1 rounded-xl bg-sky-50/80 p-1 ring-1 ring-sky-100">
          <button
            type="button"
            onClick={() => handleZoomChange(8)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              zoomLevel >= 7
                ? "bg-sky-700 text-white shadow-sm"
                : "text-sky-900 hover:bg-sky-100"
            }`}
          >
            📍 Город
          </button>
          <button
            type="button"
            onClick={() => handleZoomChange(5)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              zoomLevel >= 5 && zoomLevel < 7
                ? "bg-sky-700 text-white shadow-sm"
                : "text-sky-900 hover:bg-sky-100"
            }`}
          >
            🗺️ Регион
          </button>
          <button
            type="button"
            onClick={() => handleZoomChange(4)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              zoomLevel < 5
                ? "bg-sky-700 text-white shadow-sm"
                : "text-sky-900 hover:bg-sky-100"
            }`}
          >
            🌐 Вся страна
          </button>
        </div>
      </div>

      <div className="relative h-80 w-full overflow-hidden rounded-xl ring-1 ring-sky-100/80 sm:h-96">
        <div ref={containerRef} className="h-full w-full z-0" />

        {isPrecipLayer && frames.length > 0 && !precipError && (
          <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 rounded-xl bg-white/95 px-3 py-2 text-xs shadow-md ring-1 ring-sky-100/80 backdrop-blur">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700 font-bold text-white transition hover:bg-sky-800"
              aria-label={isPlaying ? "Пауза" : "Воспроизведение"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <div>
              <p className="font-semibold text-sky-950">Радар осадков</p>
              <p className="text-[11px] tabular-nums text-cloud-600 font-medium">
                {currentFrameTimeLabel}
              </p>
            </div>
          </div>
        )}

        {!isPrecipLayer && (
          <div className="absolute top-3 left-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-[10px] font-medium text-cloud-600 shadow-sm ring-1 ring-sky-100/80 backdrop-blur">
            {LAYER_LABELS[layer]}
          </div>
        )}
      </div>
    </section>
  );
}
