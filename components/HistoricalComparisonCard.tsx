import {
  fetchHistoricalRange,
  getYearsAgoComparison,
  getClimateNormal,
  getAnomaly,
} from "@/lib/weather/historical";

const MONTH_NAMES_GENITIVE: Record<number, string> = {
  1: "января",
  2: "февраля",
  3: "марта",
  4: "апреля",
  5: "мая",
  6: "июня",
  7: "июля",
  8: "августа",
  9: "сентября",
  10: "октября",
  11: "ноября",
  12: "декабря",
};

function formatTemp(t: number): string {
  const rounded = Math.round(t);
  if (rounded > 0) return `+${rounded}°`;
  return `${rounded}°`;
}

function getAnomalyBadge(direction: "warmer" | "colder" | "normal"): {
  label: string;
  colorClass: string;
} {
  switch (direction) {
    case "warmer":
      return { label: "Теплее нормы", colorClass: "bg-sun-200 text-sun-950" };
    case "colder":
      return { label: "Холоднее нормы", colorClass: "bg-sky-100 text-sky-800" };
    case "normal":
    default:
      return {
        label: "В пределах нормы",
        colorClass: "bg-cloud-100 text-cloud-700",
      };
  }
}

export async function HistoricalComparisonCard({
  todayTempMax,
  todayDate,
  latitude,
  longitude,
}: {
  todayTempMax: number;
  todayDate: string;
  latitude: number;
  longitude: number;
}) {
  let history;
  try {
    history = await fetchHistoricalRange(latitude, longitude);
  } catch {
    return null;
  }

  if (!history || history.length === 0) return null;

  // Comparison for 1, 5, 10 years ago
  const comp1 = getYearsAgoComparison(history, todayDate, 1);
  const comp5 = getYearsAgoComparison(history, todayDate, 5);
  const comp10 = getYearsAgoComparison(history, todayDate, 10);

  const comparisons = [comp1, comp5, comp10].filter(
    (c): c is NonNullable<typeof c> => c !== null,
  );

  const month = Number(todayDate.split("-")[1]) || 1;
  const normal = getClimateNormal(history, month);
  const anomaly = getAnomaly(todayTempMax, normal);
  const badge = getAnomalyBadge(anomaly.direction);

  const monthGenitive = MONTH_NAMES_GENITIVE[month] || "";
  const diffFormatted =
    anomaly.diffFromNormalMax > 0
      ? `+${anomaly.diffFromNormalMax.toFixed(1)}°`
      : `${anomaly.diffFromNormalMax.toFixed(1)}°`;

  return (
    <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6 space-y-5">
      {/* Section 1: Past Years Comparison */}
      {comparisons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
            В этот день в прошлые годы
          </h3>
          <div
            className={`grid gap-2 text-center ${
              comparisons.length === 3
                ? "grid-cols-3"
                : comparisons.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-1"
            }`}
          >
            {comparisons.map((c) => {
              const year = c.date.split("-")[0];
              return (
                <div
                  key={c.yearsAgo}
                  className="rounded-xl bg-sky-50/70 p-3 ring-1 ring-sky-100/60"
                >
                  <p className="text-[11px] font-medium text-cloud-500">
                    {year} ({c.yearsAgo}{" "}
                    {c.yearsAgo === 1 ? "год" : c.yearsAgo === 5 ? "лет" : "лет"}{" "}
                    назад)
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-sky-950">
                    {formatTemp(c.tempMax)} / {formatTemp(c.tempMin)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-cloud-500 tabular-nums">
                    осадки: {c.precipitationSum.toFixed(1)} мм
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Climate Normal & Anomaly */}
      <div className="space-y-3 border-t border-sky-100/80 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
            Норма для {monthGenitive}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.colorClass}`}
            >
              {badge.label}
            </span>
            <span className="text-xs font-bold tabular-nums text-sky-950">
              ({diffFormatted})
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-sky-50/40 p-3 text-xs ring-1 ring-sky-100/50 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-cloud-600 font-medium">
              Средняя температура месяца:
            </span>
            <span className="font-semibold tabular-nums text-sky-950">
              {formatTemp(normal.avgTempMax)} / {formatTemp(normal.avgTempMin)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-cloud-600 font-medium">
              Рекорды {monthGenitive}:
            </span>
            <span className="font-medium tabular-nums text-sky-950">
              макс: <strong>{formatTemp(normal.recordTempMax)}</strong> (
              {normal.recordTempMaxYear}) · мин:{" "}
              <strong>{formatTemp(normal.recordTempMin)}</strong> (
              {normal.recordTempMinYear})
            </span>
          </div>
        </div>

        <p className="text-[10px] text-cloud-400">
          по данным архива за {normal.yearsOfData} лет
        </p>
      </div>
    </section>
  );
}
