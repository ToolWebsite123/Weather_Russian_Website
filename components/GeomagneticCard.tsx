import type { GeomagneticData } from "@/lib/weather/geomagnetic";

/**
 * Geomagnetic severity badge styles mapped to design system palette tokens.
 * Visually quiet outline styling to avoid competing with primary AlertBanner warnings.
 */
const BADGE_STYLES: Record<
  GeomagneticData["severity"],
  { badge: string; text: string }
> = {
  calm: {
    badge: "bg-sky-50/80 text-sky-800 ring-sky-200/60",
    text: "text-sky-900",
  },
  minor: {
    badge: "bg-sun-50 text-sun-900 ring-sun-200/80",
    text: "text-sun-900",
  },
  storm: {
    badge: "bg-sun-100 text-sun-950 ring-sun-300",
    text: "text-sun-950",
  },
  severe: {
    badge: "bg-red-50 text-red-800 ring-red-200",
    text: "text-red-950",
  },
};

export function GeomagneticCard({ data }: { data: GeomagneticData | null }) {
  if (!data) return null;

  const style = BADGE_STYLES[data.severity] ?? BADGE_STYLES.calm;

  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <svg
            className="h-5 w-5 shrink-0 text-sky-700 sm:h-6 sm:w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 15l-4-4 6.75-6.75a4.24 4.24 0 0 1 6 6L11 17" />
            <path d="M9 18l-4-4 6.75-6.75a4.24 4.24 0 0 1 6 6L14 20" />
            <line x1="15" y1="6" x2="18" y2="9" />
            <line x1="12" y1="9" x2="15" y2="12" />
          </svg>
          <div>
            <h3 className="text-h3 font-semibold text-cloud-900">
              Геомагнитная активность
            </h3>
            <p className="text-xs text-cloud-500">Данные NOAA (индекс Kp)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-cloud-900 tabular-nums">
            {data.kpDisplay} <span className="text-xs text-cloud-400 font-normal">/ 9 Kp</span>
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
          >
            {data.label}
          </span>
        </div>
      </div>

      {data.isElevated && (
        <div className="mt-3 rounded-xl bg-sun-50/80 p-3 text-xs text-sun-950 ring-1 ring-sun-200/70">
          <p className="font-medium">⚠️ Повышенный уровень активности</p>
          <p className="mt-0.5 text-sun-900">
            Возможны недомогание и головные боли у метеозависимых людей. Старайтесь избегать переутомления.
          </p>
        </div>
      )}
    </div>
  );
}
