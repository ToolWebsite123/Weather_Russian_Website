import type { AirQuality } from "@/types/weather";
import { getPollutantLevel, getPollenLevel } from "@/lib/weather/pollutant-scale";

export function AirQualityBlock({ aqi }: { aqi: AirQuality }) {
  const usAqi = Math.round(aqi.usAqi);

  const level =
    usAqi <= 50
      ? {
          label: "Хорошо",
          color: "text-sky-900 bg-sky-100",
          recommendation:
            "Качество воздуха отличное, никаких ограничений для прогулок и спорта.",
        }
      : usAqi <= 100
        ? {
            label: "Умеренно",
            color: "text-sun-900 bg-sun-100",
            recommendation:
              "Качество воздуха приемлемое. Чувствительным людям стоит следить за самочувствием.",
          }
        : usAqi <= 150
          ? {
              label: "Вредно для чувствительных",
              color: "text-sun-950 bg-sun-200",
              recommendation:
                "Чувствительным группам рекомендуется сократить длительные нагрузки на улице.",
            }
          : {
              label: "Вредно",
              color: "text-white bg-sun-500",
              recommendation:
                "Воздух вреден для здоровья. Рекомендуется ограничить время на открытом воздухе.",
            };

  const pollutants = [
    { key: "pm25" as const, name: "PM2.5", val: aqi.pm25 },
    { key: "pm10" as const, name: "PM10", val: aqi.pm10 },
    { key: "ozone" as const, name: "O₃", val: aqi.ozone },
    { key: "no2" as const, name: "NO₂", val: aqi.nitrogenDioxide },
    { key: "so2" as const, name: "SO₂", val: aqi.sulphurDioxide },
    { key: "co" as const, name: "CO", val: aqi.carbonMonoxide },
  ].filter((p) => typeof p.val === "number");

  const pollenItems = [
    { name: "Ольха", val: aqi.pollen?.alder },
    { name: "Берёза", val: aqi.pollen?.birch },
    { name: "Злаки", val: aqi.pollen?.grass },
    { name: "Амброзия", val: aqi.pollen?.ragweed },
  ].filter(
    (item): item is { name: string; val: number } =>
      typeof item.val === "number",
  );

  return (
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="font-serif text-h2 font-semibold text-sky-950">
          Качество воздуха
        </h2>
        {aqi.uvIndex != null && (
          <span className="text-xs text-cloud-600">
            УФ-индекс:{" "}
            <strong className="text-sky-950 font-semibold tabular-nums">
              {aqi.uvIndex.toFixed(1)}
            </strong>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div>
          <p className="text-4xl font-bold tabular-nums text-sky-950">
            {usAqi}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-cloud-500 font-medium">
            Индекс US AQI
          </p>
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${level.color}`}
          >
            {level.label}
          </span>
          <p className="text-xs text-cloud-600 leading-relaxed">
            {level.recommendation}
          </p>
        </div>
      </div>

      {pollutants.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-sky-100/80 sm:grid-cols-3 sm:gap-2 md:grid-cols-6">
          {pollutants.map((p) => {
            const levelInfo = getPollutantLevel(p.key, p.val!);
            return (
              <div
                key={p.key}
                className="rounded-xl bg-sky-50/50 p-2 ring-1 ring-sky-100/60"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-cloud-600">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-medium text-cloud-500">
                    {levelInfo.label}
                  </span>
                </div>
                <p className="mt-0.5 text-base font-bold tabular-nums text-sky-950">
                  {p.val! < 10 ? p.val!.toFixed(1) : Math.round(p.val!)}
                  <span className="text-[10px] font-normal text-cloud-400 ml-0.5">
                    мкг/м³
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {pollenItems.length > 0 && (
        <div className="pt-2.5 border-t border-sky-100/80">
          <h3 className="text-h3 font-semibold text-cloud-900 mb-1.5">
            Пыльца и аллергены
          </h3>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
            {pollenItems.map((item) => {
              const pollenLevel = getPollenLevel(item.val);
              return (
                <div
                  key={item.name}
                  className="rounded-xl bg-sun-50/40 p-2 ring-1 ring-sun-100/60"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-sun-950">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-medium text-sun-900">
                      {pollenLevel.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-sun-950">
                    {Math.round(item.val)}
                    <span className="text-[10px] font-normal text-sun-800 ml-0.5">
                      зер/м³
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
