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
  const moonrise = moonTimes.rise ? moonTimes.rise.toISOString() : null;
  const moonset = moonTimes.set ? moonTimes.set.toISOString() : null;

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
  if (!d || isNaN(d.getTime())) return fallback.toISOString();
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

  const sunriseDate = times.sunrise || date;
  const sunsetDate = times.sunset || date;
  const prevSunriseDate = prevTimes.sunrise || yesterday;
  const prevSunsetDate = prevTimes.sunset || yesterday;

  const todayLen = Math.max(
    0,
    (sunsetDate.getTime() - sunriseDate.getTime()) / 60000,
  );
  const prevLen = Math.max(
    0,
    (prevSunsetDate.getTime() - prevSunriseDate.getTime()) / 60000,
  );

  const dayLengthDiffMinutes = Math.round(todayLen - prevLen);

  return {
    sunrise: toIso(times.sunrise, date),
    sunset: toIso(times.sunset, date),
    solarNoon: toIso(times.solarNoon, date),
    dayLengthMinutes: Math.round(todayLen),
    dayLengthDiffMinutes,
    goldenHourMorningEnd: toIso(times.goldenHourEnd || times.sunrise, date),
    goldenHourEveningStart: toIso(times.goldenHour || times.sunset, date),
    blueHourMorningStart: toIso(
      times.dawn || times.nightEnd || times.sunrise,
      date,
    ),
    blueHourMorningEnd: toIso(times.sunrise, date),
    blueHourEveningStart: toIso(times.sunset, date),
    blueHourEveningEnd: toIso(
      times.dusk || times.nauticalDusk || times.sunset,
      date,
    ),
  };
}
