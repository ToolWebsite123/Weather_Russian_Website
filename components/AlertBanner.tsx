"use client";

import { useState } from "react";
import type { WeatherAlert } from "@/lib/weather/alerts";

export function AlertBanner({ alerts }: { alerts?: WeatherAlert[] }) {
  const [dismissedTitles, setDismissedTitles] = useState<string[]>([]);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const activeAlerts = alerts.filter(
    (alert) => !dismissedTitles.includes(alert.title),
  );

  if (activeAlerts.length === 0) {
    return null;
  }

  function dismissAlert(title: string) {
    setDismissedTitles((prev) => [...prev, title]);
  }

  return (
    <div
      role="alert"
      className="w-full space-y-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {activeAlerts.map((alert, idx) => {
        const isSevere = alert.severity === "severe";
        return (
          <div
            key={`${alert.title}-${idx}`}
            className={
              isSevere
                ? "relative flex items-start justify-between gap-3 rounded-xl bg-red-600 px-4 py-3.5 text-white shadow-md ring-1 ring-red-700/50 sm:px-5"
                : "relative flex items-start justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3.5 text-amber-950 ring-1 ring-amber-300 sm:px-5"
            }
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {isSevere ? (
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold leading-tight sm:text-base">
                  {alert.title}
                </h4>
                <p
                  className={
                    isSevere
                      ? "mt-0.5 text-xs text-red-100 sm:text-sm leading-relaxed"
                      : "mt-0.5 text-xs text-amber-900 sm:text-sm leading-relaxed"
                  }
                >
                  {alert.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dismissAlert(alert.title)}
              className={
                isSevere
                  ? "shrink-0 rounded-lg p-1 text-red-200 hover:bg-red-700 hover:text-white transition-colors"
                  : "shrink-0 rounded-lg p-1 text-amber-700 hover:bg-amber-200/60 hover:text-amber-950 transition-colors"
              }
              aria-label={`Закрыть предупреждение: ${alert.title}`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="18" y1="18" x2="6" y2="6" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
