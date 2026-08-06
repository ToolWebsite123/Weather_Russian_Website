import type { CurrentWeather } from "@/types/weather";
import { getRoadCondition, type RoadConditionType } from "@/lib/weather/road-conditions";

function RoadIcon({ type }: { type: RoadConditionType }) {
  if (type === "snow") {
    return (
      <svg
        className="h-5 w-5 shrink-0 text-sky-600 sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="20" y1="12" x2="4" y2="12" />
        <line x1="17.65" y1="5.65" x2="6.35" y2="18.35" />
        <line x1="17.65" y1="18.35" x2="6.35" y2="5.65" />
      </svg>
    );
  }
  if (type === "icy_risk") {
    return (
      <svg
        className="h-5 w-5 shrink-0 text-amber-600 sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (type === "wet") {
    return (
      <svg
        className="h-5 w-5 shrink-0 text-sky-600 sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 14.89 12 3ms8 11.89a5.5 5.5 0 1 1-11 0Z" />
      </svg>
    );
  }
  return (
    <svg
      className="h-5 w-5 shrink-0 text-emerald-600 sm:h-6 sm:w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="8" rx="2" />
      <path d="M7 11V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
    </svg>
  );
}

export function RoadConditionCard({ current }: { current: CurrentWeather }) {
  const road = getRoadCondition(current);

  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <RoadIcon type={road.type} />
          <div>
            <h3 className="text-h3 font-semibold text-cloud-900">
              Состояние дорог
            </h3>
            <p className="text-xs text-cloud-500">{road.description}</p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${road.badgeClass}`}
        >
          {road.label}
        </span>
      </div>
    </div>
  );
}
