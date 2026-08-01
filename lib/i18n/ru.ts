import { getCityLocative, getCityGenitive } from "./declension";

export const ru = {
  brand: "WeatherHub",
  tagline: "Прогноз погоды — ясно и быстро",
  searchPlaceholder: "Город или населённый пункт",
  search: "Найти",
  useMyLocation: "Мой город",
  locating: "Определяем…",
  popularCities: "Популярные города",
  current: "Сейчас",
  hourly: "По часам",
  daily: "По дням",
  feelsLike: "Ощущается",
  humidity: "Влажность",
  wind: "Ветер",
  pressure: "Давление",
  precipitation: "Осадки",
  clouds: "Облачность",
  sunrise: "Восход",
  sunset: "Закат",
  tomorrow: "Завтра",
  days3: "3 дня",
  days7: "7 дней",
  days10: "10 дней",
  days14: "14 дней",
  today: "Сегодня",
  map: "Карта",
  favorites: "Избранное",
  addFavorite: "В избранное",
  removeFavorite: "Убрать",
  noResults: "Ничего не найдено",
  attribution: "Данные погоды: Open-Meteo",
  errorGeneric: "Не удалось загрузить погоду. Попробуйте позже.",
  homeTitle: "Погода в России и мире",
  homeSubtitle:
    "Актуальный прогноз по городам: сейчас, по часам и на 14 дней вперёд.",
  forecastFor: (city: string) => `Погода ${getCityLocative(city)}`,
  forecastGenitive: (city: string) => `Погода ${getCityGenitive(city)}`,
  metaDescription: (city: string) =>
    `Точный прогноз погоды ${getCityLocative(city)} на сегодня и 14 дней: температура сейчас, по часам, влажность, давление и ветер.`,
  daylightDuration: "Долгота дня",
} as const;


export type RuDict = typeof ru;
