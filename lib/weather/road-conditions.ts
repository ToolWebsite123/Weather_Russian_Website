import type { CurrentWeather } from "@/types/weather";

// Threshold constants for road condition evaluation
export const FREEZING_TEMP_C = 0;
export const BLACK_ICE_TEMP_MIN_C = -2;
export const BLACK_ICE_TEMP_MAX_C = 2;
export const SNOW_TEMP_MAX_C = -2;

// WMO codes representing snow or freezing rain
const SNOW_WMO_CODES = new Set([71, 73, 75, 77, 85, 86, 56, 57, 66, 67]);

export type RoadConditionType = "dry" | "wet" | "icy_risk" | "snow";

export type RoadConditionInfo = {
  type: RoadConditionType;
  label: string;
  description: string;
  icon: string;
  badgeClass: string;
};

export function getRoadCondition(current: CurrentWeather): RoadConditionInfo {
  const { temperature, precipitation, weatherCode } = current;
  const isSnowCode = SNOW_WMO_CODES.has(weatherCode);

  // 1. Snow condition ("Снежный накат")
  if (isSnowCode || (precipitation > 0 && temperature <= SNOW_TEMP_MAX_C)) {
    return {
      type: "snow",
      label: "Снежный накат",
      description: "На дорогах возможен снежный покров или заносы. Будьте осторожны на поворотах.",
      icon: "❄️",
      badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
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
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
    };
  }

  // 3. Wet condition ("Мокрая дорога")
  if (precipitation > 0 && temperature > FREEZING_TEMP_C) {
    return {
      type: "wet",
      label: "Мокрая дорога",
      description: "Дорожное покрытие влажное, увеличен тормозной путь.",
      icon: "🌧️",
      badgeClass: "bg-sky-100 text-sky-900 border-sky-200",
    };
  }

  // 4. Dry condition ("Сухая дорога")
  return {
    type: "dry",
    label: "Сухая дорога",
    description: "Благоприятное состояние дорожного покрытия.",
    icon: "🚗",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
}
