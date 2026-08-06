"use client";

import { useState } from "react";
import { ru } from "@/lib/i18n/ru";

export function LocationFallbackBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function focusSearch() {
    const input = document.getElementById("city-search-input");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 shadow-sm backdrop-blur-sm transition">
      <div className="flex items-center gap-2.5">
        <svg
          className="h-5 w-5 shrink-0 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{ru.geoFallbackBanner}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={focusSearch}
          className="shrink-0 rounded-lg bg-amber-200/60 px-3 py-1 font-medium text-amber-900 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          {ru.search}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-amber-700 transition hover:bg-amber-200/50 focus:outline-none"
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
