import type { DailyPoint } from "@/types/weather";
import { getMoonData, getSunTimesExtended } from "@/lib/weather/astronomy";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";

function formatTime(isoStr?: string | null): string {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDateRu(isoStr?: string | null): string {
  if (!isoStr) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "—";
  }
}

export function AstronomyCard({
  today,
  latitude,
  longitude,
}: {
  today?: DailyPoint;
  latitude: number;
  longitude: number;
}) {
  if (!today?.sunrise || !today?.sunset) return null;

  const dateObj = today?.date ? new Date(today.date + "T12:00:00") : new Date();

  const sun = getSunTimesExtended(dateObj, latitude, longitude);
  const moon = getMoonData(dateObj, latitude, longitude);

  // Format sunrise/sunset and day duration
  const sunriseTime = formatTime(today.sunrise || sun.sunrise);
  const sunsetTime = formatTime(today.sunset || sun.sunset);

  const diffHours = Math.floor(sun.dayLengthMinutes / 60);
  const diffMinutes = Math.round(sun.dayLengthMinutes % 60);
  const durationStr = `${diffHours} ч ${diffMinutes} мин`;

  const diffVal = sun.dayLengthDiffMinutes;

  return (
    <section className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6 space-y-5">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Left Column — Sun & Daylight */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
            Солнце и световой день
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-amber-50/70 p-2.5">
              <p className="text-[11px] font-medium text-amber-800">Восход</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-amber-950">
                🌅 {sunriseTime}
              </p>
            </div>
            <div className="rounded-xl bg-orange-50/70 p-2.5">
              <p className="text-[11px] font-medium text-orange-800">Закат</p>
              <p className="mt-1 text-base font-semibold tabular-nums text-orange-950">
                🌇 {sunsetTime}
              </p>
            </div>
            <div className="rounded-xl bg-sky-50/70 p-2.5">
              <p className="text-[11px] font-medium text-sky-800">Долгота</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-sky-950">
                ☀️ {durationStr}
              </p>
              <p className="mt-0.5 text-[10px] font-medium tabular-nums">
                {diffVal > 0 && (
                  <span className="text-sky-600">↑ +{diffVal} мин</span>
                )}
                {diffVal < 0 && (
                  <span className="text-amber-600">↓ {diffVal} мин</span>
                )}
                {diffVal === 0 && (
                  <span className="text-cloud-500">→ 0 мин</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 rounded-xl bg-sky-50/40 p-3 text-xs ring-1 ring-sky-100/50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-cloud-600 font-medium">Золотой час:</span>
              <span className="tabular-nums text-sky-950 font-medium">
                {formatTime(sun.sunrise)}–{formatTime(sun.goldenHourMorningEnd)} ·{" "}
                {formatTime(sun.goldenHourEveningStart)}–{formatTime(sun.sunset)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-cloud-600 font-medium">Синий час:</span>
              <span className="tabular-nums text-sky-950 font-medium">
                {formatTime(sun.blueHourMorningStart)}–{formatTime(sun.blueHourMorningEnd)} ·{" "}
                {formatTime(sun.blueHourEveningStart)}–{formatTime(sun.blueHourEveningEnd)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column — Moon & Phases */}
        <div className="space-y-3 border-t border-sky-100/80 pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
            Луна и фазы
          </h3>

          <div className="flex items-center gap-3">
            <MoonPhaseIcon
              illumination={moon.illumination}
              waxing={moon.phaseValue < 0.5}
              size={44}
            />
            <div>
              <p className="text-base font-bold text-sky-950 leading-tight">
                {moon.phaseName}
              </p>
              <p className="text-xs text-cloud-600">
                Освещённость:{" "}
                <strong className="text-sky-950 font-semibold">
                  {moon.illumination}%
                </strong>
                {" · "}
                <span className="tabular-nums">{moon.ageDays} дн.</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-xl bg-sky-50/70 p-2.5">
              <p className="text-[11px] font-medium text-sky-800">Восход Луны</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-sky-950">
                {moon.moonrise ? `🌙 ${formatTime(moon.moonrise)}` : "не восходит"}
              </p>
            </div>
            <div className="rounded-xl bg-sky-50/70 p-2.5">
              <p className="text-[11px] font-medium text-sky-800">Заход Луны</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-sky-950">
                {moon.moonset ? `🌘 ${formatTime(moon.moonset)}` : "не заходит"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cloud-600 px-1">
            <span>
              Новолуние:{" "}
              <strong className="text-sky-950 font-semibold">
                {formatDateRu(moon.nextNewMoon)}
              </strong>
            </span>
            <span>
              Полнолуние:{" "}
              <strong className="text-sky-950 font-semibold">
                {formatDateRu(moon.nextFullMoon)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
