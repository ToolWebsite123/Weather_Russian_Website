import {
  fetchHistoricalRange,
  getClimateNormal,
  getYearsAgoComparison,
  type ClimateNormal,
  type HistoricalDailyPoint,
} from "@/lib/weather/historical";
import { formatTemp } from "@/lib/cities";

const MONTH_NAMES_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export async function HistoricalArchivePanel({
  latitude,
  longitude,
  cityName,
}: {
  latitude: number;
  longitude: number;
  cityName: string;
}) {
  let history: HistoricalDailyPoint[] = [];
  let fetchError = false;

  try {
    history = await fetchHistoricalRange(latitude, longitude);
  } catch {
    fetchError = true;
  }

  if (fetchError || history.length === 0) {
    return (
      <section className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-sm">
        <h2 className="font-serif text-h2 text-sky-950 mb-2">
          Архив погоды и климат в {cityName}
        </h2>
        <p className="text-sm text-cloud-500">
          Данные метеонаблюдений временно недоступны. Попробуйте обновить страницу позже.
        </p>
      </section>
    );
  }

  // Calculate climate normals for all 12 months
  const monthlyNormals: ClimateNormal[] = Array.from({ length: 12 }, (_, i) =>
    getClimateNormal(history, i + 1)
  );

  // Get multi-year comparison for today's date
  const todayISO = new Date().toISOString().slice(0, 10);
  const yearsAgoList = [1, 2, 3, 5, 10];
  const comparisons = yearsAgoList
    .map((years) => getYearsAgoComparison(history, todayISO, years))
    .filter(Boolean);

  // Get last 14 days of recorded historical points
  const recentHistory = history.slice(-14).reverse();

  return (
    <div className="space-y-8">
      {/* Overview & Intro */}
      <section className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-h2 text-sky-950">
              Архив погоды и климат — {cityName}
            </h2>
            <p className="mt-1 text-sm text-cloud-500">
              Метеорологическая статистика и архив наблюдений за 10 лет
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-200">
            📊 10 лет наблюдений
          </span>
        </div>
      </section>

      {/* 1. Same-Day Multi-Year Comparison */}
      {comparisons.length > 0 && (
        <section className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl text-sky-950 flex items-center gap-2">
            <span>📅 Погода в {cityName} в этот день в прошлые года</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {comparisons.map((c) => {
              if (!c) return null;
              return (
                <div
                  key={c.yearsAgo}
                  className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 text-center space-y-1 transition hover:bg-sky-50"
                >
                  <div className="text-xs font-medium text-cloud-500">
                    {c.yearsAgo} {c.yearsAgo === 1 ? "год" : c.yearsAgo < 5 ? "года" : "лет"} назад ({c.date.slice(0, 4)})
                  </div>
                  <div className="text-lg font-bold text-sky-950">
                    {formatTemp(c.tempMax)}
                  </div>
                  <div className="text-xs text-cloud-500">
                    ночью {formatTemp(c.tempMin)}
                  </div>
                  {c.precipitationSum > 0 && (
                    <div className="text-[11px] text-sky-600 font-medium pt-1">
                      💧 {c.precipitationSum} мм
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. 12-Month Climate Normals Table */}
      <section className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-xl text-sky-950">
          Климатическая норма по месяца ({cityName})
        </h3>
        <p className="text-xs text-cloud-500">
          Средние температуры и абсолютные температурные рекорды по данным 10-летнего архива наблюдений.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-sky-100 bg-sky-50/70 text-xs font-semibold text-sky-900">
                <th className="py-2.5 px-3 rounded-l-lg">Месяц</th>
                <th className="py-2.5 px-3">Ср. макс.</th>
                <th className="py-2.5 px-3">Ср. мин.</th>
                <th className="py-2.5 px-3 text-red-600">Рекорд макс.</th>
                <th className="py-2.5 px-3 text-blue-600 rounded-r-lg">Рекорд мин.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60">
              {monthlyNormals.map((norm, idx) => (
                <tr key={norm.month} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-sky-950">
                    {MONTH_NAMES_RU[idx]}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-amber-700">
                    {formatTemp(norm.avgTempMax)}
                  </td>
                  <td className="py-2.5 px-3 text-sky-800">
                    {formatTemp(norm.avgTempMin)}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-red-700">
                    {formatTemp(norm.recordTempMax)} ({norm.recordTempMaxYear})
                  </td>
                  <td className="py-2.5 px-3 text-xs text-blue-700">
                    {formatTemp(norm.recordTempMin)} ({norm.recordTempMinYear})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Recent Daily Archive Log */}
      <section className="rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-sm space-y-4">
        <h3 className="font-serif text-xl text-sky-950">
          Архив наблюдений за последние дни
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {recentHistory.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/40 p-3.5"
            >
              <div>
                <div className="text-xs font-semibold text-sky-950">{day.date}</div>
                <div className="text-xs text-cloud-500">
                  {day.precipitationSum > 0 ? `Осадки: ${day.precipitationSum} мм` : "Без осадков"}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-700">{formatTemp(day.tempMax)}</span>
                <span className="text-xs text-cloud-400 mx-1">/</span>
                <span className="text-sm font-medium text-sky-700">{formatTemp(day.tempMin)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
