import type { CurrentWeather } from "@/types/weather";
import { getRoadCondition } from "@/lib/weather/road-conditions";

export function RoadConditionCard({ current }: { current: CurrentWeather }) {
  const road = getRoadCondition(current);

  return (
    <div
      id="road-conditions"
      className="scroll-mt-24 rounded-2xl bg-white/95 p-4 ring-1 ring-sky-100/80 shadow-xs backdrop-blur sm:p-6 space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl shadow-2xs ring-1 ring-sky-100">
            {road.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-h3 font-bold text-sky-950">
                Состояние дорог для водителей
              </h3>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${road.badgeClass}`}
              >
                {road.label}
              </span>
            </div>
            <p className="text-xs text-cloud-500 mt-0.5">{road.description}</p>
          </div>
        </div>

        {/* Driver Safety Score Pill */}
        <div className="flex items-center gap-2 rounded-xl bg-sky-50/80 px-3 py-1.5 ring-1 ring-sky-100 text-xs font-semibold text-sky-950">
          <span className="text-emerald-700 font-bold">Индекс безопасности:</span>
          <span className="text-sky-900 font-bold tabular-nums">{road.safetyScore}/10</span>
        </div>
      </div>

      {/* Driver Key Metrics 4-Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Grip */}
        <div className="rounded-xl bg-sky-50/50 p-3 ring-1 ring-sky-100/60 space-y-1">
          <p className="text-[11px] font-medium text-cloud-500 flex items-center gap-1">
            <span>🛞</span> Сцепление с дорогой
          </p>
          <p className="text-sm font-bold text-sky-950 tabular-nums">
            {road.gripPercent}% <span className="text-xs font-normal text-cloud-500">({road.gripPercent > 70 ? "Норма" : "Снижено"})</span>
          </p>
        </div>

        {/* Braking Distance */}
        <div className="rounded-xl bg-sky-50/50 p-3 ring-1 ring-sky-100/60 space-y-1">
          <p className="text-[11px] font-medium text-cloud-500 flex items-center gap-1">
            <span>🛑</span> Тормозной путь
          </p>
          <p className="text-sm font-bold text-sky-950 truncate">
            {road.brakingFactor}
          </p>
        </div>

        {/* Visibility */}
        <div className="rounded-xl bg-sky-50/50 p-3 ring-1 ring-sky-100/60 space-y-1">
          <p className="text-[11px] font-medium text-cloud-500 flex items-center gap-1">
            <span>👁️</span> Видимость
          </p>
          <p className="text-sm font-bold text-sky-950 truncate">
            {road.visibilityLabel}
          </p>
        </div>

        {/* Estimated Surface Temp */}
        <div className="rounded-xl bg-sky-50/50 p-3 ring-1 ring-sky-100/60 space-y-1">
          <p className="text-[11px] font-medium text-cloud-500 flex items-center gap-1">
            <span>🌡️</span> Темп. асфальта
          </p>
          <p className="text-sm font-bold text-sky-950 tabular-nums">
            {road.estimatedSurfaceTempC > 0 ? `+${road.estimatedSurfaceTempC}` : road.estimatedSurfaceTempC}°C
          </p>
        </div>
      </div>

      {/* Driver Recommendation */}
      <div className="rounded-xl bg-sky-50/80 p-3 ring-1 ring-sky-100 text-xs text-sky-900 flex items-start gap-2.5 leading-relaxed">
        <span className="text-base shrink-0">💡</span>
        <div>
          <span className="font-semibold text-sky-950">Рекомендация водителю: </span>
          <span>{road.advisory}</span>
        </div>
      </div>
    </div>
  );
}
