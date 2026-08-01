import type { AirQuality } from "@/types/weather";

export function AirQualityBlock({ aqi }: { aqi: AirQuality }) {
  const level =
    aqi.usAqi <= 50
      ? { label: "Хорошо", color: "text-emerald-700 bg-emerald-50" }
      : aqi.usAqi <= 100
        ? { label: "Умеренно", color: "text-sun-800 bg-sun-50" }
        : aqi.usAqi <= 150
          ? { label: "Вредно для чувствительных", color: "text-orange-800 bg-orange-50" }
          : { label: "Вредно", color: "text-red-800 bg-red-50" };

  return (
    <section className="rounded-xl bg-white/80 p-4 ring-1 ring-sky-100 sm:p-5">
      <h2 className="font-serif text-xl text-sky-950">Качество воздуха</h2>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-3xl font-semibold tabular-nums text-sky-950">
            {Math.round(aqi.usAqi)}
          </p>
          <p className="text-xs text-cloud-500">US AQI</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${level.color}`}
        >
          {level.label}
        </span>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-cloud-600 sm:grid-cols-4">
          <span>PM2.5: {(aqi.pm25 ?? 0).toFixed(1)}</span>
          <span>PM10: {(aqi.pm10 ?? 0).toFixed(1)}</span>
          <span>O₃: {(aqi.ozone ?? 0).toFixed(0)}</span>
          <span>NO₂: {(aqi.nitrogenDioxide ?? 0).toFixed(0)}</span>
        </div>
      </div>
      {aqi.uvIndex != null && (
        <p className="mt-3 text-sm text-cloud-600">
          УФ-индекс: <strong className="text-sky-950">{aqi.uvIndex.toFixed(1)}</strong>
        </p>
      )}
    </section>
  );
}
