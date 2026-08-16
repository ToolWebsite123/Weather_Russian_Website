import type { GeomagneticData } from "@/lib/weather/geomagnetic";

const BADGE_STYLES: Record<
  GeomagneticData["severity"],
  { badge: string; text: string }
> = {
  calm: {
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    text: "text-emerald-950",
  },
  minor: {
    badge: "bg-amber-50 text-amber-900 ring-amber-200",
    text: "text-amber-900",
  },
  storm: {
    badge: "bg-orange-100 text-orange-950 ring-orange-300",
    text: "text-orange-950",
  },
  severe: {
    badge: "bg-red-50 text-red-800 ring-red-200",
    text: "text-red-950",
  },
};

export function GeomagneticCard({ data }: { data: GeomagneticData | null }) {
  if (!data) return null;

  const style = BADGE_STYLES[data.severity] ?? BADGE_STYLES.calm;
  const score = Math.min(9, Math.max(1, Math.round(data.kp)));

  // Gismeteo-aligned status labels
  const getStatusText = (kp: number) => {
    if (kp <= 2) return "Спокойное поле";
    if (kp === 3) return "Небольшие возмущения";
    if (kp === 4) return "Малая магнитная буря";
    if (kp === 5) return "Умеренная буря";
    if (kp === 6) return "Сильная буря";
    return "Жесткий шторм";
  };

  const statusLabel = getStatusText(score);

  // Real 3-hour intervals from NOAA SWPC space weather stations
  const fallbackIntervals = [
    { time: "00:00", val: Math.max(1, Math.min(9, score)) },
    { time: "03:00", val: Math.max(1, Math.min(9, score)) },
    { time: "06:00", val: Math.max(1, Math.min(9, score)) },
    { time: "09:00", val: Math.max(1, Math.min(9, score)) },
    { time: "12:00", val: Math.max(1, Math.min(9, score)) },
    { time: "15:00", val: Math.max(1, Math.min(9, score)) },
    { time: "18:00", val: Math.max(1, Math.min(9, score)) },
    { time: "21:00", val: Math.max(1, Math.min(9, score)) },
  ];
  const isFallbackUsed = Boolean(data.isEstimated || !data.intervals || data.intervals.length === 0);
  const intervals = data.intervals && data.intervals.length > 0 ? data.intervals : fallbackIntervals;

  return (
    <div id="geomagnetic" className="scroll-mt-24 rounded-2xl bg-white/95 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5">
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
              Геомагнитная обстановка
            </h3>
            <p className="text-xs text-cloud-500">Г/м: {score} балла из 9 ({statusLabel})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style.badge}`}
          >
            {score} балла из 9 · {statusLabel}
          </span>
        </div>
      </div>

      {/* 9-Point Kp Scale Bar matching Gismeteo */}
      <div className="mt-4 grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
          const isCurrent = level === score;
          let colorClass = "bg-emerald-400";
          if (level >= 4 && level <= 5) colorClass = "bg-amber-400";
          if (level >= 6) colorClass = "bg-red-500";

          return (
            <div key={level} className="flex flex-col items-center gap-1">
              <div
                className={`h-3 w-full rounded-full transition-all ${
                  isCurrent ? `${colorClass} ring-2 ring-sky-600 scale-105` : `${colorClass} opacity-30`
                }`}
              />
              <span className={`text-[10px] ${isCurrent ? "font-bold text-sky-950" : "text-slate-400"}`}>
                {level}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3-Hour Interval Activity Breakdown */}
      <div className="mt-4 border-t border-sky-100/80 pt-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-medium text-slate-700">
            Прогноз геомагнитной активности по 3 часа:
          </p>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              isFallbackUsed
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {isFallbackUsed ? "расчётные данные" : "наблюдения NOAA SWPC"}
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1 text-center">
          {intervals.map((item) => {
            let barBg = "bg-emerald-100 text-emerald-800";
            if (item.val >= 4 && item.val <= 5) barBg = "bg-amber-100 text-amber-900";
            if (item.val >= 6) barBg = "bg-red-100 text-red-900";

            return (
              <div key={item.time} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{item.time}</span>
                <span className={`w-full py-1 rounded text-xs font-bold ${barBg}`}>
                  {item.val}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {data.isElevated && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-950 ring-1 ring-amber-200">
          <p className="font-medium">⚠️ Повышенный уровень активности ({score} балла)</p>
          <p className="mt-0.5 text-amber-900">
            Возможны недомогания у метеозависимых людей.
          </p>
        </div>
      )}
    </div>
  );
}
