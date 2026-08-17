import type { CurrentWeather } from "@/types/weather";
import { isSnowOrIcyPrecipitationCode } from "@/lib/weather/wmo";

// Threshold constants for road condition evaluation
export const FREEZING_TEMP_C = 0;
export const BLACK_ICE_TEMP_MIN_C = -2;
export const BLACK_ICE_TEMP_MAX_C = 2;
export const SNOW_TEMP_MAX_C = -2;

export type RoadConditionType = "dry" | "wet" | "icy_risk" | "snow";

export type RoadConditionInfo = {
  type: RoadConditionType;
  label: string;
  description: string;
  icon: string;
  badgeClass: string;
  safetyScore: number;
  safetyLabel: string;
  gripPercent: number;
  brakingFactor: string;
  visibilityLabel: string;
  windAdvisory: string;
  estimatedSurfaceTempC: number;
  advisory: string;
};

export function getRoadCondition(current: CurrentWeather): RoadConditionInfo {
  const { temperature, precipitation, weatherCode, windSpeed, windGusts, visibility, isDay } = current;
  const isSnowCode = isSnowOrIcyPrecipitationCode(weatherCode);

  const effectiveWind = Math.max(windSpeed || 0, windGusts || 0);

  // Surface temp estimation based on solar heating during day or cooling at night
  const estimatedSurfaceTempC = Math.round(isDay ? temperature + 2 : temperature - 1);

  // Visibility label
  let visibilityLabel = "10+ км (Отличная)";
  if (typeof visibility === "number" && !isNaN(visibility)) {
    const km = Math.round(visibility / 1000);
    if (km < 1) {
      visibilityLabel = "< 1 км (Густой туман)";
    } else if (km < 4) {
      visibilityLabel = `${km} км (Плохая видимость)`;
    } else if (km < 10) {
      visibilityLabel = `${km} км (Умеренная)`;
    } else {
      visibilityLabel = "10+ км (Отличная)";
    }
  }

  // Wind advisory
  let windAdvisory = `Спокойный (${Math.round(windSpeed || 0)} м/с)`;
  if (effectiveWind >= 15) {
    windAdvisory = `Шквалистый (${Math.round(effectiveWind)} м/с)`;
  } else if (effectiveWind >= 8) {
    windAdvisory = `Умеренный (${Math.round(effectiveWind)} м/с)`;
  }

  // 1. Snow condition ("Снежный накат")
  if (isSnowCode || (precipitation > 0 && temperature <= SNOW_TEMP_MAX_C)) {
    return {
      type: "snow",
      label: "Снежный накат",
      description: "На дорогах снежный покров или заносы. Соблюдайте дистанцию.",
      icon: "❄️",
      badgeClass: "bg-sky-100 text-sky-950 ring-sky-300 font-semibold",
      safetyScore: 4,
      safetyLabel: "Сниженное сцепление",
      gripPercent: 45,
      brakingFactor: "Увеличен (2.5x)",
      visibilityLabel,
      windAdvisory,
      estimatedSurfaceTempC,
      advisory: "Избегайте резкого торможения и маневров на поворотах. Держите увеличенную дистанцию.",
    };
  }

  // 2. Icy risk condition ("Риск гололёда")
  if (
    (temperature >= BLACK_ICE_TEMP_MIN_C && temperature <= BLACK_ICE_TEMP_MAX_C) ||
    (precipitation > 0 && temperature <= FREEZING_TEMP_C)
  ) {
    return {
      type: "icy_risk",
      label: "Риск гололёда",
      description: "Температура около 0°C. На асфальте и мостах возможна скользкая корка льда.",
      icon: "⚠️",
      badgeClass: "bg-amber-100 text-amber-950 ring-amber-300 font-bold",
      safetyScore: 2,
      safetyLabel: "Высокая опасность гололедицы",
      gripPercent: 30,
      brakingFactor: "Критически увеличен (3.5x)",
      visibilityLabel,
      windAdvisory,
      estimatedSurfaceTempC,
      advisory: "Снизьте скорость перед мостами, эстакадами и теневыми участками трассы.",
    };
  }

  // 3. Wet condition ("Мокрая дорога")
  if (precipitation > 0 && temperature > FREEZING_TEMP_C) {
    const isHeavy = precipitation > 4;
    return {
      type: "wet",
      label: isHeavy ? "Сильно мокрая дорога" : "Мокрая дорога",
      description: isHeavy
        ? "Интенсивные осадки. Риск аквапланирования на высокой скорости."
        : "Влажное дорожное покрытие, сцепление слегка снижено.",
      icon: "🌧️",
      badgeClass: "bg-sky-50 text-sky-900 ring-sky-200 font-medium",
      safetyScore: isHeavy ? 6 : 7,
      safetyLabel: isHeavy ? "Риск аквапланирования" : "Удовлетворительные условия",
      gripPercent: isHeavy ? 65 : 80,
      brakingFactor: isHeavy ? "Увеличен (1.8x)" : "Слегка увеличен (1.3x)",
      visibilityLabel,
      windAdvisory,
      estimatedSurfaceTempC,
      advisory: "Соблюдайте безопасный скоростной режим, включите ближний свет фар.",
    };
  }

  // 4. Dry condition ("Сухая дорога")
  return {
    type: "dry",
    label: "Сухая дорога",
    description: "Благоприятное состояние дорожного покрытия. Отличное сцепление с асфальтом.",
    icon: "🚗",
    badgeClass: "bg-emerald-50 text-emerald-900 ring-emerald-200 font-medium",
    safetyScore: effectiveWind >= 15 ? 8 : 10,
    safetyLabel: effectiveWind >= 15 ? "Хорошие (ветер)" : "Идеальные условия",
    gripPercent: 100,
    brakingFactor: "Стандартный (1.0x)",
    visibilityLabel,
    windAdvisory,
    estimatedSurfaceTempC,
    advisory: "Благоприятные условия для любых поездок. Соблюдайте стандартный скоростной режим.",
  };
}
