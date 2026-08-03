/**
 * Standard WHO UV Index Scale mapping in Russian.
 * Aligned with the brand design system palette from tailwind.config.ts (sky & sun color scales).
 */
export function getUvCategory(uvIndex: number): {
  label: string;
  colorClass: string;
} {
  const rounded = Math.round(uvIndex);

  if (rounded <= 2) {
    return {
      label: "Низкий",
      colorClass: "bg-sky-100 text-sky-800",
    };
  }
  if (rounded <= 5) {
    return {
      label: "Умеренный",
      colorClass: "bg-sun-100 text-sun-900",
    };
  }
  if (rounded <= 7) {
    return {
      label: "Высокий",
      colorClass: "bg-sun-200 text-sun-950",
    };
  }
  if (rounded <= 10) {
    return {
      label: "Очень высокий",
      colorClass: "bg-sun-500 text-white",
    };
  }
  // Generic purple fallback: tailwind.config.ts defines sky, sun, cloud, and storm scales,
  // but no purple scale for the WHO extreme UV hazard level.
  return {
    label: "Экстремальный",
    colorClass: "bg-purple-100 text-purple-800",
  };
}
