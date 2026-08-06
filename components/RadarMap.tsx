"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

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
  const [host, setHost] = useState<string>("");
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Fetch RainViewer radar frames safely
  useEffect(() => {
    if (!showPrecip) return;

    let isMounted = true;
    async function fetchRadarFrames() {
      try {
        const res = await fetch(
          "https://api.rainviewer.com/public/weather-maps.json",
        );
        if (!res.ok) throw new Error("RainViewer API failed");
        const data = (await res.json()) as RainViewerResponse;

        if (isMounted && data.host && data.radar?.past?.length) {
          setHost(data.host);
          setFrames(data.radar.past);
          setCurrentFrameIdx(data.radar.past.length - 1); // default to latest past frame
        }
      } catch {
        if (isMounted) setHasError(true);
      }
    }

    fetchRadarFrames();
    return () => {
      isMounted = false;
    };
  }, [showPrecip]);

  // Animation timer loop
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % frames.length);
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const currentFrame = frames[currentFrameIdx];
  const currentFrameTimeLabel = currentFrame
    ? new Date(currentFrame.time * 1000).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Custom city marker pin icon
  const cityPinIcon = L.divIcon({
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

  return (
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-h2 font-semibold text-sky-950">
          Карта осадков и радар
        </h2>
        <span className="text-xs text-cloud-500">
          RainViewer & OpenStreetMap
        </span>
      </div>

      <div className="relative h-80 w-full overflow-hidden rounded-xl ring-1 ring-sky-100/80 sm:h-96">
        <MapContainer
          center={[latitude, longitude]}
          zoom={7}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showPrecip && currentFrame && host && (
            <TileLayer
              key={currentFrame.path}
              url={`${host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={0.7}
            />
          )}

          <Marker position={[latitude, longitude]} icon={cityPinIcon}>
            <Popup className="font-sans font-medium text-sky-950">
              {cityName}
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Animation Control Overlay */}
        {showPrecip && frames.length > 0 && !hasError && (
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
              <p className="text-[11px] tabular-nums text-cloud-600">
                {currentFrameTimeLabel}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
