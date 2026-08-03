/**
 * Standard WHO UV Index Scale mapping in Russian.
 */
export function getUvCategory(uvIndex: number): {
  label: string;
  colorClass: string;
} {
  const rounded = Math.round(uvIndex);

  if (rounded <= 2) {
    return {
      label: "Низкий",
      colorClass: "bg-emerald-100 text-emerald-800",
    };
  }
  if (rounded <= 5) {
    return {
      label: "Умеренный",
      colorClass: "bg-amber-100 text-amber-800",
    };
  }
  if (rounded <= 7) {
    return {
      label: "Высокий",
      colorClass: "bg-orange-100 text-orange-800",
    };
  }
  if (rounded <= 10) {
    return {
      label: "Очень высокий",
      colorClass: "bg-red-100 text-red-800",
    };
  }
  return {
    label: "Экстремальный",
    colorClass: "bg-purple-100 text-purple-800",
  };
}
