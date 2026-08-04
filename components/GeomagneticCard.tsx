import type { GeomagneticData } from "@/lib/weather/geomagnetic";

/**
 * Geomagnetic severity badge styles mapped to design system palette tokens (sky & sun color scales).
 */
const BADGE_STYLES: Record<
  GeomagneticData["severity"],
  { badge: string; border: string; text: string }
> = {
  calm: {
    badge: "bg-sky-50 text-sky-800 ring-sky-600/20",
    border: "border-sky-100",
    text: "text-sky-900",
  },
  minor: {
    badge: "bg-sun-100 text-sun-900 ring-sun-600/20",
    border: "border-sun-200",
    text: "text-sun-900",
  },
  storm: {
    badge: "bg-sun-200 text-sun-950 ring-sun-700/20",
    border: "border-sun-300",
    text: "text-sun-950",
  },
  // Generic red fallback: tailwind.config.ts defines sky, sun, cloud, and storm scales,
  // but no dedicated red scale for extreme severe geomagnetic storm hazard warnings.
  severe: {
    badge: "bg-red-50 text-red-800 ring-red-600/20",
    border: "border-red-200",
    text: "text-red-950",
  },
};

export function GeomagneticCard({ data }: { data: GeomagneticData | null }) {
  if (!data) return null;

  const style = BADGE_STYLES[data.severity] ?? BADGE_STYLES.calm;

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-sm ring-1 ring-sky-100/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl" role="img" aria-label="Geomagnetic Activity">
            🧲
          </span>
          <div>
            <h3 className="text-base font-semibold text-cloud-900">
              Геомагнитная активность
            </h3>
            <p className="text-xs text-cloud-500">Данные NOAA (индекс Kp)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-cloud-900">
            {data.kpDisplay} <span className="text-xs text-cloud-400 font-normal">/ 9 Kp</span>
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.badge}`}
          >
            {data.label}
          </span>
        </div>
      </div>

      {data.isElevated && (
        <div className="mt-3 rounded-xl bg-sun-50/80 p-3 text-xs text-sun-950 border border-sun-200">
          <p className="font-medium">⚠️ Повышенный уровень активности</p>
          <p className="mt-0.5 text-sun-900">
            Возможны недомогание и головные боли у метеозависимых людей. Старайтесь избегать переутомления.
          </p>
        </div>
      )}
    </div>
  );
}
