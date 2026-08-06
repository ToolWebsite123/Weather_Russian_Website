import * as SunCalc from "suncalc";

export type MoonPhaseName =
  | "Новолуние"
  | "Растущий месяц"
  | "Первая четверть"
  | "Растущая луна"
  | "Полнолуние"
  | "Убывающая луна"
  | "Последняя четверть"
  | "Старый месяц";

export type MoonData = {
  phaseValue: number; // 0..1 from SunCalc.getMoonIllumination(date).phase
  illumination: number; // 0..100, rounded
  phaseName: MoonPhaseName;
  ageDays: number; // phaseValue * 29.53, one decimal
  moonrise: string | null;
  moonset: string | null;
  nextNewMoon: string; // ISO date
  nextFullMoon: string; // ISO date
};

export type SunTimesExtended = {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLengthMinutes: number;
  dayLengthDiffMinutes: number; // vs previous calendar day
  goldenHourMorningEnd: string;
  goldenHourEveningStart: string;
  blueHourMorningStart: string;
  blueHourMorningEnd: string;
  blueHourEveningStart: string;
  blueHourEveningEnd: string;
};

export function isValidDate(d: Date | null | undefined): d is Date {
  return !!d && !isNaN(d.getTime());
}

export function getMoonPhaseName(phase: number): MoonPhaseName {
  const eps = 0.02;
  if (phase < eps || phase > 1 - eps) return "Новолуние";
  if (phase < 0.25 - eps) return "Растущий месяц";
  if (phase <= 0.25 + eps) return "Первая четверть";
  if (phase < 0.5 - eps) return "Растущая луна";
  if (phase <= 0.5 + eps) return "Полнолуние";
  if (phase < 0.75 - eps) return "Убывающая луна";
  if (phase <= 0.75 + eps) return "Последняя четверть";
  return "Старый месяц";
}

export function getMoonData(
  date: Date,
  latitude: number,
  longitude: number,
): MoonData {
  const illum = SunCalc.getMoonIllumination(date);
  const phaseValue = illum.phase;
  const illumination = Math.round(illum.fraction * 100);
  const phaseName = getMoonPhaseName(phaseValue);
  const ageDays = Number((phaseValue * 29.5305877).toFixed(1));

  const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
  const moonrise = isValidDate(moonTimes.rise) ? moonTimes.rise.toISOString() : null;
  const moonset = isValidDate(moonTimes.set) ? moonTimes.set.toISOString() : null;

  // Compute next new moon and next full moon dates within 30 days
  let nextNewMoon = "";
  let nextFullMoon = "";

  const checkDate = new Date(date.getTime());

  for (let i = 0; i <= 30; i++) {
    const d = new Date(checkDate.getTime() + i * 24 * 60 * 60 * 1000);
    const p = SunCalc.getMoonIllumination(d).phase;

    if (!nextNewMoon && (p < 0.04 || p > 0.96)) {
      nextNewMoon = d.toISOString();
    }
    if (!nextFullMoon && Math.abs(p - 0.5) < 0.04) {
      nextFullMoon = d.toISOString();
    }

    if (nextNewMoon && nextFullMoon) break;
  }

  if (!nextNewMoon) nextNewMoon = checkDate.toISOString();
  if (!nextFullMoon) nextFullMoon = checkDate.toISOString();

  return {
    phaseValue,
    illumination,
    phaseName,
    ageDays,
    moonrise,
    moonset,
    nextNewMoon,
    nextFullMoon,
  };
}

function toIso(d: Date | null | undefined, fallback: Date): string {
  if (!isValidDate(d)) return fallback.toISOString();
  return d.toISOString();
}

export function getSunTimesExtended(
  date: Date,
  latitude: number,
  longitude: number,
): SunTimesExtended {
  const times = SunCalc.getTimes(date, latitude, longitude);

  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const prevTimes = SunCalc.getTimes(yesterday, latitude, longitude);

  const sunriseDate = isValidDate(times.sunrise) ? times.sunrise : null;
  const sunsetDate = isValidDate(times.sunset) ? times.sunset : null;
  const prevSunriseDate = isValidDate(prevTimes.sunrise) ? prevTimes.sunrise : null;
  const prevSunsetDate = isValidDate(prevTimes.sunset) ? prevTimes.sunset : null;

  let todayLen = 0;
  if (sunriseDate && sunsetDate) {
    todayLen = Math.max(0, (sunsetDate.getTime() - sunriseDate.getTime()) / 60000);
  } else {
    // Polar Day / Polar Night handling:
    // When SunCalc returns Invalid Date for sunrise/sunset, check solar altitude
    const pos = SunCalc.getPosition(date, latitude, longitude);
    const isPolarDay = pos.altitude >= -0.01;
    todayLen = isPolarDay ? 24 * 60 : 0;
  }

  let prevLen = 0;
  if (prevSunriseDate && prevSunsetDate) {
    prevLen = Math.max(0, (prevSunsetDate.getTime() - prevSunriseDate.getTime()) / 60000);
  } else {
    const prevPos = SunCalc.getPosition(yesterday, latitude, longitude);
    const isPrevPolarDay = prevPos.altitude >= -0.01;
    prevLen = isPrevPolarDay ? 24 * 60 : 0;
  }

  const dayLengthDiffMinutes = Math.round(todayLen - prevLen);

  return {
    sunrise: toIso(times.sunrise, date),
    sunset: toIso(times.sunset, date),
    solarNoon: toIso(times.solarNoon, date),
    dayLengthMinutes: Math.round(todayLen),
    dayLengthDiffMinutes,
    goldenHourMorningEnd: toIso(
      isValidDate(times.goldenHourEnd) ? times.goldenHourEnd : times.sunrise,
      date,
    ),
    goldenHourEveningStart: toIso(
      isValidDate(times.goldenHour) ? times.goldenHour : times.sunset,
      date,
    ),
    blueHourMorningStart: toIso(
      isValidDate(times.dawn)
        ? times.dawn
        : isValidDate(times.nightEnd)
          ? times.nightEnd
          : times.sunrise,
      date,
    ),
    blueHourMorningEnd: toIso(times.sunrise, date),
    blueHourEveningStart: toIso(times.sunset, date),
    blueHourEveningEnd: toIso(
      isValidDate(times.dusk)
        ? times.dusk
        : isValidDate(times.nauticalDusk)
          ? times.nauticalDusk
          : times.sunset,
      date,
    ),
  };
}
