import type {
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  AirQuality,
} from "@/types/weather";
import type { WeatherAlert } from "@/lib/weather/alerts";
import { getClothingRecommendation } from "@/lib/weather/clothing";
import { getActivityIndex } from "@/lib/weather/activity-index";

export function RecommendationsCard({
  current,
  today,
  hourly,
  aqi,
  activeAlerts,
}: {
  current: CurrentWeather;
  today?: DailyPoint;
  hourly?: HourlyPoint[];
  aqi?: AirQuality | null;
  activeAlerts: WeatherAlert[];
}) {
  const clothing = getClothingRecommendation(current, today);
  const activity = getActivityIndex(current, today, hourly, aqi || null, activeAlerts);

  return (
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5 space-y-4">
      {/* Section 1: Clothing Recommendation */}
      <div className="space-y-2.5">
        <h3 className="text-h3 font-semibold text-cloud-900">
          Что надеть
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{clothing.icon}</span>
          <h2 className="font-serif text-h2 font-semibold text-sky-950 leading-snug">
            {clothing.headline}
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {clothing.layers.map((layer) => (
            <span
              key={layer}
              className="rounded-full bg-sky-50/70 px-2.5 py-0.5 text-xs font-medium text-sky-900 ring-1 ring-sky-100"
            >
              {layer}
            </span>
          ))}
        </div>

        {clothing.note && (
          <div className="flex items-start gap-2 rounded-xl bg-sun-50/80 p-2.5 text-xs text-sun-950 ring-1 ring-sun-200/70 font-medium leading-relaxed">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-sun-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <span>{clothing.note}</span>
          </div>
        )}
      </div>

      {/* Section 2: Outdoor Activity Index */}
      <div className="border-t border-sky-100/80 pt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-h3 font-semibold text-cloud-900">
            Активность на улице
          </h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.colorClass}`}
          >
            {activity.level}
          </span>
        </div>

        <ul className="space-y-1.5 text-xs text-cloud-600">
          {activity.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-sky-500 font-bold">•</span>
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
