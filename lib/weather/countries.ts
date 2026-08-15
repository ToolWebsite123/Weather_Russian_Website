import type { GeocodingResult } from "@/types/weather";
import { getCountryFlag, getCountryNameRu, slugifyCity } from "@/lib/cities";

export type CountryData = {
  iso: string;
  nameRu: string;
  aliases: string[];
  cities: Array<{
    name: string;
    nameEn: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone: string;
    population?: number;
  }>;
};

export const POPULAR_COUNTRIES: CountryData[] = [
  {
    iso: "TR",
    nameRu: "Турция",
    aliases: ["турция", "turkey", "turkiye", "тёрция", "тр"],
    cities: [
      { name: "Стамбул", nameEn: "Istanbul", admin1: "Стамбул", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul", population: 15460000 },
      { name: "Анталья", nameEn: "Antalya", admin1: "Анталья", latitude: 36.8969, longitude: 30.7133, timezone: "Europe/Istanbul", population: 1200000 },
      { name: "Анкара", nameEn: "Ankara", admin1: "Анкара", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul", population: 5663000 },
      { name: "Измир", nameEn: "Izmir", admin1: "Измир", latitude: 38.4237, longitude: 27.1428, timezone: "Europe/Istanbul", population: 2966000 },
      { name: "Бодрум", nameEn: "Bodrum", admin1: "Мугла", latitude: 37.0344, longitude: 27.4305, timezone: "Europe/Istanbul", population: 175000 },
      { name: "Аланья", nameEn: "Alanya", admin1: "Анталья", latitude: 36.5438, longitude: 31.9998, timezone: "Europe/Istanbul", population: 333000 },
    ],
  },
  {
    iso: "KZ",
    nameRu: "Казахстан",
    aliases: ["казахстан", "kazakhstan", "каз", "kz"],
    cities: [
      { name: "Алматы", nameEn: "Almaty", admin1: "Алматы", latitude: 43.222, longitude: 76.8512, timezone: "Asia/Almaty", population: 2000000 },
      { name: "Астана", nameEn: "Astana", admin1: "Астана", latitude: 51.1694, longitude: 71.4491, timezone: "Asia/Almaty", population: 1200000 },
      { name: "Шымкент", nameEn: "Shymkent", admin1: "Шымкент", latitude: 42.3417, longitude: 69.5901, timezone: "Asia/Almaty", population: 1100000 },
      { name: "Караганда", nameEn: "Karaganda", admin1: "Карагандинская область", latitude: 49.8019, longitude: 73.1021, timezone: "Asia/Almaty", population: 500000 },
      { name: "Актобе", nameEn: "Aktobe", admin1: "Актюбинская область", latitude: 50.2839, longitude: 57.167, timezone: "Asia/Aqtobe", population: 512000 },
    ],
  },
  {
    iso: "EG",
    nameRu: "Египет",
    aliases: ["египет", "egypt", "египт"],
    cities: [
      { name: "Хургада", nameEn: "Hurghada", admin1: "Красное море", latitude: 27.2579, longitude: 33.8116, timezone: "Africa/Cairo", population: 260000 },
      { name: "Шарм-эш-Шейх", nameEn: "Sharm el-Sheikh", admin1: "Южный Синай", latitude: 27.9158, longitude: 34.3299, timezone: "Africa/Cairo", population: 73000 },
      { name: "Каир", nameEn: "Cairo", admin1: "Каир", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo", population: 9600000 },
      { name: "Александрия", nameEn: "Alexandria", admin1: "Александрия", latitude: 31.2001, longitude: 29.9187, timezone: "Africa/Cairo", population: 5200000 },
    ],
  },
  {
    iso: "AE",
    nameRu: "ОАЭ",
    aliases: ["оаэ", "эмираты", "объединенные арабские эмираты", "дубай", "uae", "emirates", "dubai"],
    cities: [
      { name: "Дубай", nameEn: "Dubai", admin1: "Дубай", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai", population: 3330000 },
      { name: "Абу-Даби", nameEn: "Abu Dhabi", admin1: "Абу-Даби", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai", population: 1480000 },
      { name: "Шарджа", nameEn: "Sharjah", admin1: "Шарджа", latitude: 25.3463, longitude: 55.4209, timezone: "Asia/Dubai", population: 1270000 },
    ],
  },
  {
    iso: "US",
    nameRu: "США",
    aliases: ["сша", "соединенные штаты", "америка", "usa", "us", "america"],
    cities: [
      { name: "Нью-Йорк", nameEn: "New York", admin1: "Нью-Йорк", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York", population: 8800000 },
      { name: "Лос-Анджелес", nameEn: "Los Angeles", admin1: "Калифорния", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles", population: 3890000 },
      { name: "Майами", nameEn: "Miami", admin1: "Флорида", latitude: 25.7617, longitude: -80.1918, timezone: "America/New_York", population: 442000 },
      { name: "Чикаго", nameEn: "Chicago", admin1: "Иллинойс", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago", population: 2740000 },
      { name: "Сан-Франциско", nameEn: "San Francisco", admin1: "Калифорния", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles", population: 873000 },
    ],
  },
  {
    iso: "DE",
    nameRu: "Германия",
    aliases: ["германия", "germany", "deutschland", "де"],
    cities: [
      { name: "Берлин", nameEn: "Berlin", admin1: "Берлин", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin", population: 3640000 },
      { name: "Мюнхен", nameEn: "Munich", admin1: "Бавария", latitude: 48.1351, longitude: 11.582, timezone: "Europe/Berlin", population: 1470000 },
      { name: "Франкфурт-на-Майне", nameEn: "Frankfurt", admin1: "Гессен", latitude: 50.1109, longitude: 8.6821, timezone: "Europe/Berlin", population: 764000 },
      { name: "Гамбург", nameEn: "Hamburg", admin1: "Гамбург", latitude: 53.5511, longitude: 9.9937, timezone: "Europe/Berlin", population: 1840000 },
    ],
  },
  {
    iso: "ES",
    nameRu: "Испания",
    aliases: ["испания", "spain", "espana"],
    cities: [
      { name: "Барселона", nameEn: "Barcelona", admin1: "Каталония", latitude: 41.3851, longitude: 2.1734, timezone: "Europe/Madrid", population: 1620000 },
      { name: "Мадрид", nameEn: "Madrid", admin1: "Мадрид", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid", population: 3220000 },
      { name: "Валенсия", nameEn: "Valencia", admin1: "Валенсия", latitude: 39.4699, longitude: -0.3763, timezone: "Europe/Madrid", population: 791000 },
      { name: "Малага", nameEn: "Malaga", admin1: "Андалусия", latitude: 36.7213, longitude: -4.4214, timezone: "Europe/Madrid", population: 578000 },
      { name: "Аликанте", nameEn: "Alicante", admin1: "Валенсия", latitude: 38.3452, longitude: -0.481, timezone: "Europe/Madrid", population: 337000 },
    ],
  },
  {
    iso: "IT",
    nameRu: "Италия",
    aliases: ["италия", "italy", "italia"],
    cities: [
      { name: "Рим", nameEn: "Rome", admin1: "Лацио", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome", population: 2870000 },
      { name: "Милан", nameEn: "Milan", admin1: "Ломбардия", latitude: 45.4642, longitude: 9.19, timezone: "Europe/Rome", population: 1360000 },
      { name: "Венеция", nameEn: "Venice", admin1: "Венето", latitude: 45.4408, longitude: 12.3155, timezone: "Europe/Rome", population: 261000 },
      { name: "Флоренция", nameEn: "Florence", admin1: "Тоскана", latitude: 43.7696, longitude: 11.2558, timezone: "Europe/Rome", population: 382000 },
    ],
  },
  {
    iso: "FR",
    nameRu: "Франция",
    aliases: ["франция", "france"],
    cities: [
      { name: "Париж", nameEn: "Paris", admin1: "Иль-де-Франс", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris", population: 2160000 },
      { name: "Ницца", nameEn: "Nice", admin1: "Прованс — Альпы — Лазурный Берег", latitude: 43.7102, longitude: 7.262, timezone: "Europe/Paris", population: 342000 },
      { name: "Лион", nameEn: "Lyon", admin1: "Овернь — Рона — Альпы", latitude: 45.764, longitude: 4.8357, timezone: "Europe/Paris", population: 516000 },
      { name: "Марсель", nameEn: "Marseille", admin1: "Прованс — Альпы — Лазурный Берег", latitude: 43.2965, longitude: 5.3698, timezone: "Europe/Paris", population: 870000 },
    ],
  },
  {
    iso: "TH",
    nameRu: "Таиланд",
    aliases: ["таиланд", "тайланд", "thailand", "тай"],
    cities: [
      { name: "Пхукет", nameEn: "Phuket", admin1: "Пхукет", latitude: 7.8804, longitude: 98.3923, timezone: "Asia/Bangkok", population: 79000 },
      { name: "Бангкок", nameEn: "Bangkok", admin1: "Бангкок", latitude: 13.7563, longitude: 100.5018, timezone: "Asia/Bangkok", population: 10500000 },
      { name: "Паттайя", nameEn: "Pattaya", admin1: "Чонбури", latitude: 12.9236, longitude: 100.8825, timezone: "Asia/Bangkok", population: 119000 },
    ],
  },
  {
    iso: "BY",
    nameRu: "Беларусь",
    aliases: ["беларусь", "белоруссия", "belarus", "рб"],
    cities: [
      { name: "Минск", nameEn: "Minsk", admin1: "Минск", latitude: 53.9006, longitude: 27.559, timezone: "Europe/Minsk", population: 2000000 },
      { name: "Брест", nameEn: "Brest", admin1: "Брестская область", latitude: 52.0976, longitude: 23.7341, timezone: "Europe/Minsk", population: 340000 },
      { name: "Гомель", nameEn: "Gomel", admin1: "Гомельская область", latitude: 52.4345, longitude: 30.9754, timezone: "Europe/Minsk", population: 510000 },
      { name: "Гродно", nameEn: "Grodno", admin1: "Гродненская область", latitude: 53.6884, longitude: 23.8258, timezone: "Europe/Minsk", population: 356000 },
      { name: "Витебск", nameEn: "Vitebsk", admin1: "Витебская область", latitude: 55.1904, longitude: 30.2049, timezone: "Europe/Minsk", population: 362000 },
    ],
  },
  {
    iso: "UZ",
    nameRu: "Узбекистан",
    aliases: ["узбекистан", "uzbekistan"],
    cities: [
      { name: "Ташкент", nameEn: "Tashkent", admin1: "Ташкент", latitude: 41.2995, longitude: 69.2401, timezone: "Asia/Tashkent", population: 2500000 },
      { name: "Самарканд", nameEn: "Samarkand", admin1: "Самаркандская область", latitude: 39.6542, longitude: 66.9597, timezone: "Asia/Tashkent", population: 550000 },
      { name: "Бухара", nameEn: "Bukhara", admin1: "Бухарская область", latitude: 39.7747, longitude: 64.4286, timezone: "Asia/Tashkent", population: 280000 },
    ],
  },
  {
    iso: "GE",
    nameRu: "Грузия",
    aliases: ["грузия", "georgia"],
    cities: [
      { name: "Тбилиси", nameEn: "Tbilisi", admin1: "Тбилиси", latitude: 41.7151, longitude: 44.8271, timezone: "Asia/Tbilisi", population: 1100000 },
      { name: "Батуми", nameEn: "Batumi", admin1: "Аджария", latitude: 41.6168, longitude: 41.6367, timezone: "Asia/Tbilisi", population: 170000 },
      { name: "Кутаиси", nameEn: "Kutaisi", admin1: "Имеретия", latitude: 42.2679, longitude: 42.6946, timezone: "Asia/Tbilisi", population: 147000 },
    ],
  },
  {
    iso: "AM",
    nameRu: "Армения",
    aliases: ["армения", "armenia"],
    cities: [
      { name: "Ереван", nameEn: "Yerevan", admin1: "Ереван", latitude: 40.1872, longitude: 44.5152, timezone: "Asia/Yerevan", population: 1080000 },
      { name: "Гюмри", nameEn: "Gyumri", admin1: "Ширакская область", latitude: 40.7929, longitude: 43.8465, timezone: "Asia/Yerevan", population: 112000 },
    ],
  },
  {
    iso: "AZ",
    nameRu: "Азербайджан",
    aliases: ["азербайджан", "azerbaijan"],
    cities: [
      { name: "Баку", nameEn: "Baku", admin1: "Баку", latitude: 40.4093, longitude: 49.8671, timezone: "Asia/Baku", population: 2300000 },
    ],
  },
  {
    iso: "GB",
    nameRu: "Великобритания",
    aliases: ["великобритания", "англия", "uk", "england", "britain", "great britain"],
    cities: [
      { name: "Лондон", nameEn: "London", admin1: "Большой Лондон", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London", population: 8980000 },
      { name: "Манчестер", nameEn: "Manchester", admin1: "Англия", latitude: 53.4808, longitude: -2.2426, timezone: "Europe/London", population: 553000 },
      { name: "Эдинбург", nameEn: "Edinburgh", admin1: "Шотландия", latitude: 55.9533, longitude: -3.1883, timezone: "Europe/London", population: 527000 },
    ],
  },
  {
    iso: "CN",
    nameRu: "Китай",
    aliases: ["китай", "china"],
    cities: [
      { name: "Пекин", nameEn: "Beijing", admin1: "Пекин", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai", population: 21540000 },
      { name: "Шанхай", nameEn: "Shanghai", admin1: "Шанхай", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai", population: 24870000 },
      { name: "Гуанчжоу", nameEn: "Guangzhou", admin1: "Гуандун", latitude: 23.1291, longitude: 113.2644, timezone: "Asia/Shanghai", population: 15300000 },
    ],
  },
  {
    iso: "JP",
    nameRu: "Япония",
    aliases: ["япония", "japan"],
    cities: [
      { name: "Токио", nameEn: "Tokyo", admin1: "Токио", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo", population: 13960000 },
      { name: "Осака", nameEn: "Osaka", admin1: "Осака", latitude: 34.6937, longitude: 135.5023, timezone: "Asia/Tokyo", population: 2690000 },
      { name: "Киото", nameEn: "Kyoto", admin1: "Киото", latitude: 35.0116, longitude: 135.7681, timezone: "Asia/Tokyo", population: 1470000 },
    ],
  },
  {
    iso: "VN",
    nameRu: "Вьетнам",
    aliases: ["вьетнам", "vietnam"],
    cities: [
      { name: "Ханой", nameEn: "Hanoi", admin1: "Ханой", latitude: 21.0285, longitude: 105.8542, timezone: "Asia/Ho_Chi_Minh", population: 8050000 },
      { name: "Нячанг", nameEn: "Nha Trang", admin1: "Кханьхоа", latitude: 12.2388, longitude: 109.1967, timezone: "Asia/Ho_Chi_Minh", population: 535000 },
      { name: "Хошимин", nameEn: "Ho Chi Minh City", admin1: "Хошимин", latitude: 10.8231, longitude: 106.6297, timezone: "Asia/Ho_Chi_Minh", population: 8990000 },
    ],
  },
];

export function findCitiesByCountryQuery(query: string): GeocodingResult[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  const matched = POPULAR_COUNTRIES.find(
    (c) =>
      c.nameRu.toLowerCase() === normalized ||
      c.aliases.some((alias) => alias === normalized || (alias.length >= 4 && normalized.startsWith(alias))),
  );

  if (!matched) return [];

  return matched.cities.map((city, index) => {
    const slug = slugifyCity(city.name, city.admin1);
    return {
      id: `country-${matched.iso}-${index}`,
      name: city.name,
      nameEn: city.nameEn,
      nameRu: city.name,
      country: matched.iso,
      countryNameRu: matched.nameRu,
      countryFlag: getCountryFlag(matched.iso),
      isCountryMatch: true,
      admin1: city.admin1 ?? matched.nameRu,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      population: city.population,
      slug,
    };
  });
}
