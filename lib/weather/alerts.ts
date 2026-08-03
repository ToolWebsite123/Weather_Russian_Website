import type { WeatherBundle } from "@/types/weather";

export type AlertSeverity = "severe" | "moderate";

export type WeatherAlert = {
  severity: AlertSeverity;
  title: string;
  description: string;
};

/**
 * Evaluates current and daily weather conditions against threshold rules
 * to generate active weather alerts in Russian.
 */
export function getActiveAlerts(weather: WeatherBundle): WeatherAlert[] {
  if (!weather || !weather.current) return [];

  const alerts: WeatherAlert[] = [];
  const current = weather.current;
  const today = weather.daily?.[0];

  // 1. Storm / High Wind Warning (Severe)
  const windSpeed = current.windSpeed ?? 0;
  const windGusts = current.windGusts ?? windSpeed;

  if (windSpeed > 20 || windGusts > 25) {
    const maxWind = Math.round(Math.max(windSpeed, windGusts));
    alerts.push({
      severity: "severe",
      title: "Штормовое предупреждение",
      description: `Ожидается сильный ветер со порывами до ${maxWind} м/с. Соблюдайте осторожность на улице.`,
    });
  }

  // 2. Extreme Cold (Severe)
  if (current.temperature < -25) {
    const temp = Math.round(current.temperature);
    alerts.push({
      severity: "severe",
      title: "Экстремальный холод",
      description: `Температура воздуха опустилась до ${temp}°C. Одевайтесь максимально тепло и ограничьте время на улице.`,
    });
  }

  // 3. Extreme Heat (Severe)
  if (current.temperature > 35) {
    const temp = Math.round(current.temperature);
    alerts.push({
      severity: "severe",
      title: "Экстремальная жара",
      description: `Температура воздуха поднялась до +${temp}°C. Пейте достаточно воды и избегайте прямого солнца.`,
    });
  }

  // 4. Heavy Precipitation / Flood Risk (Moderate)
  const dailyPrecip = today?.precipitationSum ?? 0;
  if (dailyPrecip > 30) {
    alerts.push({
      severity: "moderate",
      title: "Возможны подтопления",
      description: `Ожидаются обильные осадки (до ${dailyPrecip.toFixed(1)} мм). Возможны подтопления низинных участков.`,
    });
  }

  // 5. Low Visibility (Moderate)
  if (typeof current.visibility === "number" && current.visibility < 1000) {
    const vis = Math.round(current.visibility);
    alerts.push({
      severity: "moderate",
      title: "Плохая видимость",
      description: `Видимость снижена до ${vis} м. Соблюдайте дистанцию и скоростной режим на дорогах.`,
    });
  }

  // Ensure severe alerts take visual priority (severe first, then moderate)
  return alerts.sort((a, b) => {
    if (a.severity === "severe" && b.severity !== "severe") return -1;
    if (a.severity !== "severe" && b.severity === "severe") return 1;
    return 0;
  });
}
