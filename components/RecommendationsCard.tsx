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
  aqi: AirQuality | null;
  activeAlerts: WeatherAlert[];
}) {
  const clothing = getClothingRecommendation(current, today);
  const activity = getActivityIndex(current, today, hourly, aqi, activeAlerts);

  return (
    <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6 space-y-5">
      {/* Section 1: Clothing Recommendation */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
          Что надеть
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{clothing.icon}</span>
          <h2 className="font-serif text-lg font-semibold text-sky-950 leading-snug">
            {clothing.headline}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {clothing.layers.map((layer) => (
            <span
              key={layer}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-sky-900 ring-1 ring-sky-100 shadow-xs"
            >
              {layer}
            </span>
          ))}
        </div>

        {clothing.note && (
          <p className="text-xs text-amber-900 bg-amber-50/80 rounded-xl p-2.5 ring-1 ring-amber-200/70 leading-relaxed font-medium">
            💡 {clothing.note}
          </p>
        )}
      </div>

      {/* Section 2: Outdoor Activity Index */}
      <div className="border-t border-sky-100/80 pt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
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
