export type PollutantType =
  | "pm25"
  | "pm10"
  | "ozone"
  | "no2"
  | "so2"
  | "co";

/**
 * Standard WHO / EPA air pollutant concentration thresholds (in µg/m³).
 * Color classes are aligned with the site's brand palette (sky & sun color scales).
 */
export function getPollutantLevel(
  pollutant: PollutantType,
  value: number,
): { label: string; colorClass: string } {
  const v = Math.max(0, value);

  switch (pollutant) {
    case "pm25": {
      if (v <= 12) return { label: "Отлично", colorClass: "bg-sky-100 text-sky-800" };
      if (v <= 35.4) return { label: "Умеренно", colorClass: "bg-sun-100 text-sun-900" };
      if (v <= 55.4) return { label: "Чувствит.", colorClass: "bg-sun-200 text-sun-950" };
      return { label: "Вредно", colorClass: "bg-sun-500 text-white" };
    }
    case "pm10": {
      if (v <= 54) return { label: "Отлично", colorClass: "bg-sky-100 text-sky-800" };
      if (v <= 154) return { label: "Умеренно", colorClass: "bg-sun-100 text-sun-900" };
      if (v <= 254) return { label: "Чувствит.", colorClass: "bg-sun-200 text-sun-950" };
      return { label: "Вредно", colorClass: "bg-sun-500 text-white" };
    }
    case "ozone": {
      if (v <= 100) return { label: "Отлично", colorClass: "bg-sky-100 text-sky-800" };
      if (v <= 160) return { label: "Умеренно", colorClass: "bg-sun-100 text-sun-900" };
      if (v <= 240) return { label: "Чувствит.", colorClass: "bg-sun-200 text-sun-950" };
      return { label: "Вредно", colorClass: "bg-sun-500 text-white" };
    }
    case "no2": {
      if (v <= 40) return { label: "Отлично", colorClass: "bg-sky-100 text-sky-800" };
      if (v <= 90) return { label: "Умеренно", colorClass: "bg-sun-100 text-sun-900" };
      if (v <= 180) return { label: "Чувствит.", colorClass: "bg-sun-200 text-sun-950" };
      return { label: "Вредно", colorClass: "bg-sun-500 text-white" };
    }
    case "so2": {
      if (v <= 40) return { label: "Отлично", colorClass: "bg-sky-100 text-sky-800" };
      if (v <= 100) return { label: "Умеренно", colorClass: "bg-sun-100 text-sun-900" };
      if (v <= 200) return { label: "Чувствит.", colorClass: "bg-sun-200 text-sun-950" };
      return { label: "Вредно", colorClass: "bg-sun-500 text-white" };
    }
    case "co": {
      if (v <= 4400) return { label: "Отлично", colorClass: "bg-sky-100 text-sky-800" };
      if (v <= 9400) return { label: "Умеренно", colorClass: "bg-sun-100 text-sun-900" };
      if (v <= 12400) return { label: "Чувствит.", colorClass: "bg-sun-200 text-sun-950" };
      return { label: "Вредно", colorClass: "bg-sun-500 text-white" };
    }
    default:
      return { label: "Норма", colorClass: "bg-sky-100 text-sky-800" };
  }
}

/**
 * Pollen concentration severity levels (in grains/m³).
 */
export function getPollenLevel(value: number): {
  label: string;
  colorClass: string;
} {
  if (value <= 10) {
    return { label: "Низкий", colorClass: "bg-sky-100 text-sky-800" };
  }
  if (value <= 50) {
    return { label: "Умеренный", colorClass: "bg-sun-100 text-sun-900" };
  }
  return { label: "Высокий", colorClass: "bg-sun-500 text-white" };
}
