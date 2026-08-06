import type { CurrentWeather } from "@/types/weather";
import { getRoadCondition } from "@/lib/weather/road-conditions";

export function RoadConditionCard({ current }: { current: CurrentWeather }) {
  const road = getRoadCondition(current);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-sm ring-1 ring-sky-100/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl" role="img" aria-label="Road Condition">
            {road.icon}
          </span>
          <div>
            <h3 className="text-h3 font-semibold text-cloud-900">
              Состояние дорог
            </h3>
            <p className="text-xs text-cloud-500">{road.description}</p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${road.badgeClass}`}
        >
          {road.label}
        </span>
      </div>
    </div>
  );
}
