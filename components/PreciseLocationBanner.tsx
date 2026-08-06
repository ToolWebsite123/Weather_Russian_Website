"use client";

import { useState } from "react";
import { UseMyLocation } from "@/components/UseMyLocation";
import { ru } from "@/lib/i18n/ru";

export function PreciseLocationBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-sm text-sky-900 shadow-sm backdrop-blur-sm transition">
      <div className="flex items-center gap-2.5">
        <svg
          className="h-5 w-5 shrink-0 text-sky-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>{ru.preciseLocationBanner}</span>
      </div>

      <div className="flex items-center gap-2">
        <UseMyLocation
          buttonText={ru.preciseLocationAction}
          className="rounded-lg bg-sky-600 px-3 py-1 font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-60 text-sm"
        />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-sky-700 transition hover:bg-sky-200/50 focus:outline-none"
          aria-label="Закрыть"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
