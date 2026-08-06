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

const RADAR_HUBS = [
  { name: "Москва и Центр", slug: "moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Санкт-Петербург", slug: "saint-petersburg", lat: 59.9343, lon: 30.3351 },
  { name: "Сочи и Юг", slug: "sochi", lat: 43.6028, lon: 39.7342 },
  { name: "Екатеринбург и Урал", slug: "yekaterinburg", lat: 56.8389, lon: 60.6057 },
];

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
  showPrecip = true,
}: {
  latitude: number;
  longitude: number;
  cityName: string;
  showPrecip?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [precipError, setPrecipError] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);

  const { hub: nearestHub, dist } = findNearestHub(latitude, longitude);
  // Strictly check if location is outside covered geographic regions
  const isOutside =
    dist > 25 && (latitude < 30 || latitude > 75 || longitude < 15 || longitude > 180);

  // Initialize Leaflet map safely in client effect
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
      } catch {
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [latitude, longitude, cityName, isOutside]);

  // Fetch RainViewer radar frames safely
  useEffect(() => {
    if (!showPrecip || isOutside) return;

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
  }, [showPrecip, isOutside]);

  // Animation loop
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

  return (
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-h2 font-semibold text-sky-950">
          Карта осадков и радар
        </h2>
        <span className="text-xs text-cloud-500">RainViewer & OpenStreetMap</span>
      </div>

      <div className="relative h-80 w-full overflow-hidden rounded-xl ring-1 ring-sky-100/80 sm:h-96">
        <div ref={containerRef} className="h-full w-full z-0" />

        {showPrecip && frames.length > 0 && !precipError && (
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
      </div>
    </section>
  );
}
