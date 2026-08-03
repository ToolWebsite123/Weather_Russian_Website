import type {
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  AirQuality,
} from "@/types/weather";
import type { WeatherAlert } from "@/lib/weather/alerts";

export type ActivityLevel =
  | "Плохо"
  | "Удовлетворительно"
  | "Хорошо"
  | "Отлично"
  | "Идеально";

export type ActivityIndexResult = {
  level: ActivityLevel;
  score: number; // 0-100
  colorClass: string;
  reasons: string[];
};

export type ComfortPenaltyResult = {
  score: number;
  penalties: { reason: string; penalty: number }[];
  comfortLevel: { label: string; colorClass: string };
};

export function computeComfortPenalties(
  current: CurrentWeather,
  hourly?: HourlyPoint[],
  aqi?: AirQuality | null,
): ComfortPenaltyResult {
  let score = 100;
  const penalties: { reason: string; penalty: number }[] = [];

  // 1. Temperature comfort band (18–24°C feelsLike)
  const t = current.feelsLike;
  if (t < 18) {
    const dist = 18 - t;
    const pen = Math.min(40, Math.round(dist * 2));
    score -= pen;
    penalties.push({
      reason: t < 0 ? "Морозная погода" : "Прохладно или холодно на улице",
      penalty: pen,
    });
  } else if (t > 24) {
    const dist = t - 24;
    const pen = Math.min(40, Math.round(dist * 2));
    score -= pen;
    penalties.push({
      reason: "Жаркая погода",
      penalty: pen,
    });
  }

  // 2. Wind speed & gusts
  if (current.windSpeed > 10) {
    score -= 15;
    penalties.push({ reason: "Сильный ветер", penalty: 15 });
  }
  if (current.windGusts != null && current.windGusts > 15) {
    score -= 10;
    penalties.push({ reason: "Порывистый ветер", penalty: 10 });
  }

  // 3. Precipitation chance in next 3-6 hours
  if (hourly && hourly.length > 0) {
    const nextHours = hourly.slice(0, 6);
    const maxPrecipProb = Math.max(
      ...nextHours.map((h) => h.precipitationProbability ?? 0),
    );
    if (maxPrecipProb > 40) {
      score -= 20;
      penalties.push({ reason: "Высокая вероятность дождя", penalty: 20 });
    }
  }

  // 4. UV index
  if (current.uvIndex != null && current.uvIndex > 8) {
    score -= 15;
    penalties.push({
      reason: "Избегайте прямого солнца в полдень",
      penalty: 15,
    });
  }

  // 5. Air Quality
  if (aqi != null && aqi.usAqi > 100) {
    score -= 20;
    penalties.push({
      reason: "Качество воздуха не подходит для интенсивных нагрузок",
      penalty: 20,
    });
  }

  score = Math.max(0, Math.min(100, score));

  let comfortLevel: { label: string; colorClass: string };
  if (score >= 70) {
    comfortLevel = { label: "Комфортно", colorClass: "bg-sky-100 text-sky-800" };
  } else if (score >= 40) {
    comfortLevel = { label: "Терпимо", colorClass: "bg-sun-100 text-sun-900" };
  } else {
    comfortLevel = {
      label: "Некомфортно",
      colorClass: "bg-red-100 text-red-800",
    };
  }

  return {
    score,
    penalties,
    comfortLevel,
  };
}

export function getActivityIndex(
  current: CurrentWeather,
  today: DailyPoint | undefined,
  hourly: HourlyPoint[] | undefined,
  aqi: AirQuality | null,
  activeAlerts: WeatherAlert[],
): ActivityIndexResult {
  // Severe weather alert safety override
  const severeAlert = activeAlerts.find((a) => a.severity === "severe");
  if (severeAlert) {
    return {
      level: "Плохо",
      score: 0,
      colorClass: "bg-red-100 text-red-800",
      reasons: [severeAlert.title],
    };
  }

  const { score, penalties } = computeComfortPenalties(current, hourly, aqi);

  let level: ActivityLevel;
  let colorClass: string;

  if (score >= 85) {
    level = "Идеально";
    colorClass = "bg-sky-100 text-sky-800";
  } else if (score >= 70) {
    level = "Отлично";
    colorClass = "bg-sky-100 text-sky-800";
  } else if (score >= 50) {
    level = "Хорошо";
    colorClass = "bg-sky-50 text-sky-700";
  } else if (score >= 30) {
    level = "Удовлетворительно";
    colorClass = "bg-sun-100 text-sun-900";
  } else {
    level = "Плохо";
    colorClass = "bg-red-100 text-red-800";
  }

  const reasons =
    penalties.length > 0
      ? penalties.slice(0, 3).map((p) => p.reason)
      : ["Отличные условия для прогулки"];

  return {
    level,
    score,
    colorClass,
    reasons,
  };
}
