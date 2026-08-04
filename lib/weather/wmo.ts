/** WMO weather interpretation codes (Open-Meteo) → RU labels */
const WMO_RU: Record<number, string> = {
  0: "Ясно",
  1: "Преимущественно ясно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Изморозь",
  51: "Морось",
  53: "Морось",
  55: "Сильная морось",
  56: "Ледяная морось",
  57: "Сильная ледяная морось",
  61: "Небольшой дождь",
  63: "Дождь",
  65: "Сильный дождь",
  66: "Ледяной дождь",
  67: "Сильный ледяной дождь",
  71: "Небольшой снег",
  73: "Снег",
  75: "Сильный снег",
  77: "Снежные зёрна",
  80: "Ливень",
  81: "Ливень",
  82: "Сильный ливень",
  85: "Снегопад",
  86: "Сильный снегопад",
  95: "Гроза",
  96: "Гроза с градом",
  99: "Гроза с сильным градом",
};

export function weatherCodeLabel(code: number): string {
  return WMO_RU[code] ?? "Переменная погода";
}

export function weatherCodeEmoji(code: number, isDay = true): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 2) return isDay ? "🌤" : "☁️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫";
  if (code >= 51 && code <= 67) return "🌧";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦";
  if (code >= 85 && code <= 86) return "🌨";
  if (code >= 95) return "⛈";
  return "🌤";
}

/**
 * Checks if a WMO weather code represents snow or freezing precipitation.
 * Covers snow/grains (71-77), snow showers (85-86), and freezing drizzle/rain (56, 57, 66, 67).
 */
export function isSnowOrIcyPrecipitationCode(code: number): boolean {
  if (code === 56 || code === 57 || code === 66 || code === 67) return true;
  if (code >= 71 && code <= 77) return true;
  if (code >= 85 && code <= 86) return true;
  return false;
}
