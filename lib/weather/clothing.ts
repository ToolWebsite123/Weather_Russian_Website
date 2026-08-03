import type { CurrentWeather, DailyPoint } from "@/types/weather";

export type ClothingRecommendation = {
  icon: string;
  headline: string;
  layers: string[];
  note?: string;
};

export function getClothingRecommendation(
  current: CurrentWeather,
  today?: DailyPoint,
): ClothingRecommendation {
  const t = current.feelsLike;

  let icon = "🧥";
  let headline = "";
  let layers: string[] = [];

  if (t < -20) {
    icon = "❄️";
    headline = "Экстремальный холод — минимум времени на улице";
    layers = [
      "Термобельё",
      "Свитер",
      "Зимний пуховик",
      "Шапка-ушанка",
      "Варежки",
      "Шарф",
    ];
  } else if (t < -10) {
    icon = "🧥";
    headline = "Тёплая зимняя куртка";
    layers = ["Термобельё", "Свитер", "Пуховик", "Шапка", "Перчатки"];
  } else if (t < 0) {
    icon = "🧥";
    headline = "Зимняя куртка";
    layers = ["Свитер", "Пальто или куртка", "Шапка"];
  } else if (t < 10) {
    icon = "🧥";
    headline = "Демисезонная куртка";
    layers = ["Кофта", "Куртка", "Лёгкий шарф"];
  } else if (t < 18) {
    icon = "🧥";
    headline = "Лёгкая куртка или кардиган";
    layers = ["Кофта", "Ветровка"];
  } else if (t < 25) {
    icon = "👕";
    headline = "Лёгкая одежда";
    layers = ["Футболка", "Лёгкие брюки или юбка"];
  } else {
    icon = "🧢";
    headline = "Летняя одежда, головной убор от солнца";
    layers = ["Футболка", "Шорты", "Панама"];
  }

  const notes: string[] = [];

  if (current.windGusts != null && current.windGusts > 10) {
    notes.push("Ветрено — выбирайте ветронепроницаемую куртку");
  }
  if (today?.precipitationSum != null && today.precipitationSum > 1) {
    notes.push("Возможен дождь — возьмите зонт");
  }
  if (current.uvIndex != null && current.uvIndex > 5) {
    notes.push("Высокий УФ — не забудьте солнцезащитный крем");
  }

  const note = notes.length > 0 ? notes.join(" · ") : undefined;

  return {
    icon,
    headline,
    layers,
    note,
  };
}
