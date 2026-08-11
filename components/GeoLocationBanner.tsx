"use client";
import { useState } from "react";
import { UseMyLocation } from "@/components/UseMyLocation";

export function GeoLocationBanner({ cityName }: { cityName: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-sm text-sky-950 shadow-2xs backdrop-blur-xs">
      <div className="flex items-center gap-2">
        <span className="text-base" role="img" aria-label="location pin">
          📍
        </span>
        <span>
          Определено местоположение: <strong className="font-semibold">{cityName}</strong> (по IP-адресу)
        </span>
      </div>
      <div className="flex items-center gap-3">
        <UseMyLocation />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-sky-600 hover:bg-sky-100 hover:text-sky-900 transition-colors"
          aria-label="Закрыть"
          title="Закрыть"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
