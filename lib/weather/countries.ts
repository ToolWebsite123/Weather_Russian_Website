import type { GeocodingResult } from "@/types/weather";
import { getCountryFlag, slugifyCity } from "@/lib/cities";

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
    iso: "PK",
    nameRu: "Пакистан",
    aliases: ["пакистан", "pakistan", "pk", "пак"],
    cities: [
      { name: "Карачи", nameEn: "Karachi", admin1: "Синд", latitude: 24.8607, longitude: 67.0011, timezone: "Asia/Karachi", population: 14910000 },
      { name: "Лахор", nameEn: "Lahore", admin1: "Пенджаб", latitude: 31.5204, longitude: 74.3587, timezone: "Asia/Karachi", population: 11130000 },
      { name: "Исламабад", nameEn: "Islamabad", admin1: "Исламабад", latitude: 33.6844, longitude: 73.0479, timezone: "Asia/Karachi", population: 1010000 },
      { name: "Равалпинди", nameEn: "Rawalpindi", admin1: "Пенджаб", latitude: 33.5651, longitude: 73.0169, timezone: "Asia/Karachi", population: 2098000 },
      { name: "Фейсалабад", nameEn: "Faisalabad", admin1: "Пенджаб", latitude: 31.4504, longitude: 73.135, timezone: "Asia/Karachi", population: 3204000 },
      { name: "Пешавар", nameEn: "Peshawar", admin1: "Хайбер-Пахтунхва", latitude: 34.0151, longitude: 71.5249, timezone: "Asia/Karachi", population: 1970000 },
      { name: "Мультан", nameEn: "Multan", admin1: "Пенджаб", latitude: 30.1575, longitude: 71.5249, timezone: "Asia/Karachi", population: 1872000 },
      { name: "Гуджранвала", nameEn: "Gujranwala", admin1: "Пенджаб", latitude: 32.1877, longitude: 74.1945, timezone: "Asia/Karachi", population: 2027000 },
      { name: "Сиалкот", nameEn: "Sialkot", admin1: "Пенджаб", latitude: 32.4945, longitude: 74.5229, timezone: "Asia/Karachi", population: 655000 },
      { name: "Кветта", nameEn: "Quetta", admin1: "Белуджистан", latitude: 30.1798, longitude: 66.975, timezone: "Asia/Karachi", population: 1001000 },
      { name: "Хайдарабад", nameEn: "Hyderabad", admin1: "Синд", latitude: 25.396, longitude: 68.3578, timezone: "Asia/Karachi", population: 1732000 },
      { name: "Бахавалпур", nameEn: "Bahawalpur", admin1: "Пенджаб", latitude: 29.3544, longitude: 71.6911, timezone: "Asia/Karachi", population: 762000 },
      { name: "Саргодха", nameEn: "Sargodha", admin1: "Пенджаб", latitude: 32.0836, longitude: 72.6711, timezone: "Asia/Karachi", population: 659000 },
      { name: "Суккур", nameEn: "Sukkur", admin1: "Синд", latitude: 27.7052, longitude: 68.8574, timezone: "Asia/Karachi", population: 499000 },
      { name: "Абботтабад", nameEn: "Abbottabad", admin1: "Хайбер-Пахтунхва", latitude: 34.1688, longitude: 73.2215, timezone: "Asia/Karachi", population: 208000 },
      { name: "Мардан", nameEn: "Mardan", admin1: "Хайбер-Пахтунхва", latitude: 34.1986, longitude: 72.0404, timezone: "Asia/Karachi", population: 358000 },
      { name: "Гуджрат", nameEn: "Gujrat", admin1: "Пенджаб", latitude: 32.5742, longitude: 74.0754, timezone: "Asia/Karachi", population: 390000 },
      { name: "Сахивал", nameEn: "Sahiwal", admin1: "Пенджаб", latitude: 30.6682, longitude: 73.1114, timezone: "Asia/Karachi", population: 389000 },
    ],
  },
  {
    iso: "RU",
    nameRu: "Россия",
    aliases: ["россия", "russia", "ru", "рф"],
    cities: [
      { name: "Москва", nameEn: "Moscow", admin1: "Москва", latitude: 55.7558, longitude: 37.6173, timezone: "Europe/Moscow", population: 12600000 },
      { name: "Санкт-Петербург", nameEn: "Saint Petersburg", admin1: "Санкт-Петербург", latitude: 59.9343, longitude: 30.3351, timezone: "Europe/Moscow", population: 5600000 },
      { name: "Новосибирск", nameEn: "Novosibirsk", admin1: "Новосибирская область", latitude: 55.0084, longitude: 82.9357, timezone: "Asia/Novosibirsk", population: 1625000 },
      { name: "Екатеринбург", nameEn: "Yekaterinburg", admin1: "Свердловская область", latitude: 56.8389, longitude: 60.6057, timezone: "Asia/Yekaterinburg", population: 1540000 },
      { name: "Казань", nameEn: "Kazan", admin1: "Татарстан", latitude: 55.7963, longitude: 49.1088, timezone: "Europe/Moscow", population: 1309000 },
      { name: "Нижний Новгород", nameEn: "Nizhny Novgorod", admin1: "Нижегородская область", latitude: 56.2965, longitude: 43.9361, timezone: "Europe/Moscow", population: 1245000 },
      { name: "Челябинск", nameEn: "Chelyabinsk", admin1: "Челябинская область", latitude: 55.1644, longitude: 61.4368, timezone: "Asia/Yekaterinburg", population: 1190000 },
      { name: "Сочи", nameEn: "Sochi", admin1: "Краснодарский край", latitude: 43.6028, longitude: 39.7342, timezone: "Europe/Moscow", population: 445000 },
      { name: "Краснодар", nameEn: "Krasnodar", admin1: "Краснодарский край", latitude: 45.0355, longitude: 38.9753, timezone: "Europe/Moscow", population: 950000 },
      { name: "Владивосток", nameEn: "Vladivostok", admin1: "Приморский край", latitude: 43.1155, longitude: 131.8855, timezone: "Asia/Vladivostok", population: 600000 },
      { name: "Самара", nameEn: "Samara", admin1: "Самарская область", latitude: 53.2415, longitude: 50.2212, timezone: "Europe/Samara", population: 1156000 },
      { name: "Омск", nameEn: "Omsk", admin1: "Омская область", latitude: 54.9885, longitude: 73.3242, timezone: "Asia/Omsk", population: 1154000 },
      { name: "Ростов-на-Дону", nameEn: "Rostov-on-Don", admin1: "Ростовская область", latitude: 47.2357, longitude: 39.7015, timezone: "Europe/Moscow", population: 1137000 },
      { name: "Уфа", nameEn: "Ufa", admin1: "Башкортостан", latitude: 54.7388, longitude: 55.9721, timezone: "Asia/Yekaterinburg", population: 1128000 },
      { name: "Красноярск", nameEn: "Krasnoyarsk", admin1: "Красноярский край", latitude: 56.0153, longitude: 92.8932, timezone: "Asia/Krasnoyarsk", population: 1093000 },
      { name: "Воронеж", nameEn: "Voronezh", admin1: "Воронежская область", latitude: 51.6755, longitude: 39.2089, timezone: "Europe/Moscow", population: 1058000 },
      { name: "Пермь", nameEn: "Perm", admin1: "Пермский край", latitude: 58.0105, longitude: 56.2502, timezone: "Asia/Yekaterinburg", population: 1055000 },
      { name: "Волгоград", nameEn: "Volgograd", admin1: "Волгоградская область", latitude: 48.708, longitude: 44.5133, timezone: "Europe/Volgograd", population: 1008000 },
    ],
  },
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
      { name: "Бурса", nameEn: "Bursa", admin1: "Бурса", latitude: 40.1885, longitude: 29.061, timezone: "Europe/Istanbul", population: 3100000 },
      { name: "Адана", nameEn: "Adana", admin1: "Адана", latitude: 37.0, longitude: 35.3213, timezone: "Europe/Istanbul", population: 1765000 },
      { name: "Газиантеп", nameEn: "Gaziantep", admin1: "Газиантеп", latitude: 37.0662, longitude: 37.3833, timezone: "Europe/Istanbul", population: 2130000 },
      { name: "Конья", nameEn: "Konya", admin1: "Конья", latitude: 37.8714, longitude: 32.4846, timezone: "Europe/Istanbul", population: 1300000 },
      { name: "Мерсин", nameEn: "Mersin", admin1: "Мерсин", latitude: 36.8, longitude: 34.6333, timezone: "Europe/Istanbul", population: 1040000 },
      { name: "Трабзон", nameEn: "Trabzon", admin1: "Трабзон", latitude: 41.0015, longitude: 39.7178, timezone: "Europe/Istanbul", population: 816000 },
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
      { name: "Тараз", nameEn: "Taraz", admin1: "Жамбылская область", latitude: 42.9, longitude: 71.3667, timezone: "Asia/Almaty", population: 357000 },
      { name: "Павлодар", nameEn: "Pavlodar", admin1: "Павлодарская область", latitude: 52.3, longitude: 76.95, timezone: "Asia/Almaty", population: 333000 },
      { name: "Усть-Каменогорск", nameEn: "Oskemen", admin1: "Восточно-Казахстанская область", latitude: 49.95, longitude: 82.6167, timezone: "Asia/Almaty", population: 335000 },
      { name: "Семей", nameEn: "Semey", admin1: "Абайская область", latitude: 50.4167, longitude: 80.25, timezone: "Asia/Almaty", population: 324000 },
      { name: "Атырау", nameEn: "Atyrau", admin1: "Атырауская область", latitude: 47.1167, longitude: 51.8833, timezone: "Asia/Atyrau", population: 290000 },
      { name: "Костанай", nameEn: "Kostanay", admin1: "Костанайская область", latitude: 53.2167, longitude: 63.6333, timezone: "Asia/Qostanay", population: 240000 },
      { name: "Кызылорда", nameEn: "Kyzylorda", admin1: "Кызылординская область", latitude: 44.85, longitude: 65.5167, timezone: "Asia/Qyzylorda", population: 242000 },
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
      { name: "Гиза", nameEn: "Giza", admin1: "Гиза", latitude: 30.0131, longitude: 31.2089, timezone: "Africa/Cairo", population: 4360000 },
      { name: "Луксор", nameEn: "Luxor", admin1: "Луксор", latitude: 25.6872, longitude: 32.6396, timezone: "Africa/Cairo", population: 506000 },
      { name: "Асуан", nameEn: "Aswan", admin1: "Асуан", latitude: 24.0889, longitude: 32.8998, timezone: "Africa/Cairo", population: 380000 },
      { name: "Порт-Саид", nameEn: "Port Said", admin1: "Порт-Саид", latitude: 31.2565, longitude: 32.2841, timezone: "Africa/Cairo", population: 750000 },
      { name: "Исмаилия", nameEn: "Ismailia", admin1: "Исмаилия", latitude: 30.6043, longitude: 32.2723, timezone: "Africa/Cairo", population: 386000 },
      { name: "Танта", nameEn: "Tanta", admin1: "Гарбия", latitude: 30.7865, longitude: 31.0004, timezone: "Africa/Cairo", population: 544000 },
      { name: "Мансура", nameEn: "Mansoura", admin1: "Дакахлия", latitude: 31.0409, longitude: 31.3785, timezone: "Africa/Cairo", population: 600000 },
      { name: "Суэц", nameEn: "Suez", admin1: "Суэц", latitude: 29.9668, longitude: 32.5498, timezone: "Africa/Cairo", population: 745000 },
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
      { name: "Аджман", nameEn: "Ajman", admin1: "Аджман", latitude: 25.4052, longitude: 55.5136, timezone: "Asia/Dubai", population: 504000 },
      { name: "Рас-эль-Хайма", nameEn: "Ras Al Khaimah", admin1: "Рас-эль-Хайма", latitude: 25.7895, longitude: 55.9432, timezone: "Asia/Dubai", population: 115000 },
      { name: "Эль-Айн", nameEn: "Al Ain", admin1: "Абу-Даби", latitude: 24.2075, longitude: 55.7447, timezone: "Asia/Dubai", population: 766000 },
      { name: "Фуджейра", nameEn: "Fujairah", admin1: "Фуджейра", latitude: 25.1288, longitude: 56.3265, timezone: "Asia/Dubai", population: 97000 },
      { name: "Умм-эль-Кайвайн", nameEn: "Umm Al Quwain", admin1: "Умм-эль-Кайвайн", latitude: 25.5647, longitude: 55.5552, timezone: "Asia/Dubai", population: 49000 },
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
      { name: "Хьюстон", nameEn: "Houston", admin1: "Техас", latitude: 29.7604, longitude: -95.3698, timezone: "America/Chicago", population: 2300000 },
      { name: "Финикс", nameEn: "Phoenix", admin1: "Аризона", latitude: 33.4484, longitude: -112.074, timezone: "America/Phoenix", population: 1600000 },
      { name: "Филадельфия", nameEn: "Philadelphia", admin1: "Пенсильвания", latitude: 39.9526, longitude: -75.1652, timezone: "America/New_York", population: 1600000 },
      { name: "Даллас", nameEn: "Dallas", admin1: "Техас", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago", population: 1300000 },
      { name: "Сиэтл", nameEn: "Seattle", admin1: "Вашингтон", latitude: 47.6062, longitude: -122.3321, timezone: "America/Los_Angeles", population: 737000 },
      { name: "Вашингтон", nameEn: "Washington D.C.", admin1: "Колумбия", latitude: 38.9072, longitude: -77.0369, timezone: "America/New_York", population: 689000 },
      { name: "Лас-Вегас", nameEn: "Las Vegas", admin1: "Невада", latitude: 36.1699, longitude: -115.1398, timezone: "America/Los_Angeles", population: 641000 },
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
      { name: "Кёльн", nameEn: "Cologne", admin1: "Северный Рейн-Вестфалия", latitude: 50.9375, longitude: 6.9603, timezone: "Europe/Berlin", population: 1080000 },
      { name: "Штутгарт", nameEn: "Stuttgart", admin1: "Баден-Вюртемберг", latitude: 48.7758, longitude: 9.1829, timezone: "Europe/Berlin", population: 630000 },
      { name: "Дюссельдорф", nameEn: "Dusseldorf", admin1: "Северный Рейн-Вестфалия", latitude: 51.2277, longitude: 6.7735, timezone: "Europe/Berlin", population: 620000 },
      { name: "Дортмунд", nameEn: "Dortmund", admin1: "Северный Рейн-Вестфалия", latitude: 51.5136, longitude: 7.4653, timezone: "Europe/Berlin", population: 587000 },
      { name: "Дрезден", nameEn: "Dresden", admin1: "Саксония", latitude: 51.0504, longitude: 13.7373, timezone: "Europe/Berlin", population: 556000 },
      { name: "Лейпциг", nameEn: "Leipzig", admin1: "Саксония", latitude: 51.3397, longitude: 12.3731, timezone: "Europe/Berlin", population: 600000 },
      { name: "Ганновер", nameEn: "Hannover", admin1: "Нижняя Саксония", latitude: 52.3759, longitude: 9.732, timezone: "Europe/Berlin", population: 534000 },
      { name: "Нюрнберг", nameEn: "Nuremberg", admin1: "Бавария", latitude: 49.4521, longitude: 11.0767, timezone: "Europe/Berlin", population: 515000 },
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
      { name: "Севилья", nameEn: "Seville", admin1: "Андалусия", latitude: 37.3891, longitude: -5.9845, timezone: "Europe/Madrid", population: 688000 },
      { name: "Сарагоса", nameEn: "Zaragoza", admin1: "Арагон", latitude: 41.6488, longitude: -0.8896, timezone: "Europe/Madrid", population: 675000 },
      { name: "Пальма", nameEn: "Palma", admin1: "Балеарские острова", latitude: 39.5696, longitude: 2.6502, timezone: "Europe/Madrid", population: 416000 },
      { name: "Бильбао", nameEn: "Bilbao", admin1: "Страна Басков", latitude: 43.263, longitude: -2.935, timezone: "Europe/Madrid", population: 345000 },
      { name: "Гранада", nameEn: "Granada", admin1: "Андалусия", latitude: 37.1773, longitude: -3.5986, timezone: "Europe/Madrid", population: 233000 },
      { name: "Кордова", nameEn: "Cordoba", admin1: "Андалусия", latitude: 37.8882, longitude: -4.7794, timezone: "Europe/Madrid", population: 326000 },
      { name: "Мурсия", nameEn: "Murcia", admin1: "Мурсия", latitude: 37.9922, longitude: -1.1307, timezone: "Europe/Madrid", population: 459000 },
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
      { name: "Неаполь", nameEn: "Naples", admin1: "Кампания", latitude: 40.8518, longitude: 14.2681, timezone: "Europe/Rome", population: 967000 },
      { name: "Турин", nameEn: "Turin", admin1: "Пьемонт", latitude: 45.0703, longitude: 7.6869, timezone: "Europe/Rome", population: 870000 },
      { name: "Палермо", nameEn: "Palermo", admin1: "Сицилия", latitude: 38.1157, longitude: 13.3615, timezone: "Europe/Rome", population: 657000 },
      { name: "Генуя", nameEn: "Genoa", admin1: "Лигурия", latitude: 44.4056, longitude: 8.9463, timezone: "Europe/Rome", population: 580000 },
      { name: "Болонья", nameEn: "Bologna", admin1: "Эмилия-Романья", latitude: 44.4949, longitude: 11.3426, timezone: "Europe/Rome", population: 390000 },
      { name: "Бари", nameEn: "Bari", admin1: "Апулия", latitude: 41.1171, longitude: 16.8719, timezone: "Europe/Rome", population: 324000 },
      { name: "Катания", nameEn: "Catania", admin1: "Сицилия", latitude: 37.5079, longitude: 15.083, timezone: "Europe/Rome", population: 311000 },
      { name: "Верона", nameEn: "Verona", admin1: "Венето", latitude: 45.4384, longitude: 10.9916, timezone: "Europe/Rome", population: 257000 },
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
      { name: "Тулуза", nameEn: "Toulouse", admin1: "Окситания", latitude: 43.6047, longitude: 1.4442, timezone: "Europe/Paris", population: 479000 },
      { name: "Бордо", nameEn: "Bordeaux", admin1: "Новая Аквитания", latitude: 44.8378, longitude: -0.5792, timezone: "Europe/Paris", population: 254000 },
      { name: "Страсбург", nameEn: "Strasbourg", admin1: "Гранд-Эст", latitude: 48.5734, longitude: 7.7521, timezone: "Europe/Paris", population: 280000 },
      { name: "Нант", nameEn: "Nantes", admin1: "Земли Луары", latitude: 47.2184, longitude: -1.5536, timezone: "Europe/Paris", population: 309000 },
      { name: "Монпелье", nameEn: "Montpellier", admin1: "Окситания", latitude: 43.6108, longitude: 3.8767, timezone: "Europe/Paris", population: 285000 },
      { name: "Лилль", nameEn: "Lille", admin1: "О-де-Франс", latitude: 50.6292, longitude: 3.0573, timezone: "Europe/Paris", population: 232000 },
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
      { name: "Чиангмай", nameEn: "Chiang Mai", admin1: "Чиангмай", latitude: 18.7883, longitude: 98.9853, timezone: "Asia/Bangkok", population: 131000 },
      { name: "Краби", nameEn: "Krabi", admin1: "Краби", latitude: 8.0863, longitude: 98.9063, timezone: "Asia/Bangkok", population: 52000 },
      { name: "Хуахин", nameEn: "Hua Hin", admin1: "Прачуапкхирикхан", latitude: 12.5684, longitude: 99.9577, timezone: "Asia/Bangkok", population: 84000 },
      { name: "Самуи", nameEn: "Koh Samui", admin1: "Сураттхани", latitude: 9.512, longitude: 100.0136, timezone: "Asia/Bangkok", population: 67000 },
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
      { name: "Могилев", nameEn: "Mogilev", admin1: "Могилевская область", latitude: 53.8981, longitude: 30.3325, timezone: "Europe/Minsk", population: 383000 },
      { name: "Бобруйск", nameEn: "Bobruisk", admin1: "Могилевская область", latitude: 53.1384, longitude: 29.2214, timezone: "Europe/Minsk", population: 212000 },
      { name: "Барановичи", nameEn: "Baranovichi", admin1: "Брестская область", latitude: 53.1327, longitude: 26.0139, timezone: "Europe/Minsk", population: 175000 },
      { name: "Пинск", nameEn: "Pinsk", admin1: "Брестская область", latitude: 52.1153, longitude: 26.1031, timezone: "Europe/Minsk", population: 126000 },
      { name: "Орша", nameEn: "Orsha", admin1: "Витебская область", latitude: 54.5086, longitude: 30.419, timezone: "Europe/Minsk", population: 115000 },
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
      { name: "Наманган", nameEn: "Namangan", admin1: "Наманганская область", latitude: 40.9983, longitude: 71.6726, timezone: "Asia/Tashkent", population: 626000 },
      { name: "Андижан", nameEn: "Andijan", admin1: "Андижанская область", latitude: 40.7821, longitude: 72.3442, timezone: "Asia/Tashkent", population: 441000 },
      { name: "Нукус", nameEn: "Nukus", admin1: "Каракалпакстан", latitude: 42.4602, longitude: 59.6176, timezone: "Asia/Samarkand", population: 319000 },
      { name: "Фергана", nameEn: "Fergana", admin1: "Ферганская область", latitude: 40.3842, longitude: 71.7843, timezone: "Asia/Tashkent", population: 288000 },
      { name: "Карши", nameEn: "Karshi", admin1: "Кашкадарьинская область", latitude: 38.8606, longitude: 65.7894, timezone: "Asia/Samarkand", population: 260000 },
      { name: "Ургенч", nameEn: "Urgench", admin1: "Хорезмская область", latitude: 41.55, longitude: 60.6333, timezone: "Asia/Samarkand", population: 145000 },
      { name: "Джизак", nameEn: "Jizzakh", admin1: "Джизакская область", latitude: 40.1158, longitude: 67.8422, timezone: "Asia/Tashkent", population: 177000 },
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
      { name: "Рустави", nameEn: "Rustavi", admin1: "Квемо-Картли", latitude: 41.5497, longitude: 45.0008, timezone: "Asia/Tbilisi", population: 125000 },
      { name: "Гори", nameEn: "Gori", admin1: "Шида-Картли", latitude: 41.9854, longitude: 44.1158, timezone: "Asia/Tbilisi", population: 48000 },
      { name: "Зугдиди", nameEn: "Zugdidi", admin1: "Самегрело-Земо Сванети", latitude: 42.5088, longitude: 41.8709, timezone: "Asia/Tbilisi", population: 42000 },
      { name: "Поти", nameEn: "Poti", admin1: "Самегрело-Земо Сванети", latitude: 42.1461, longitude: 41.6719, timezone: "Asia/Tbilisi", population: 41000 },
      { name: "Боржоми", nameEn: "Borjomi", admin1: "Самцхе-Джавахети", latitude: 41.8389, longitude: 43.3792, timezone: "Asia/Tbilisi", population: 10500 },
    ],
  },
  {
    iso: "AM",
    nameRu: "Армения",
    aliases: ["армения", "armenia"],
    cities: [
      { name: "Ереван", nameEn: "Yerevan", admin1: "Ереван", latitude: 40.1872, longitude: 44.5152, timezone: "Asia/Yerevan", population: 1080000 },
      { name: "Гюмри", nameEn: "Gyumri", admin1: "Ширакская область", latitude: 40.7929, longitude: 43.8465, timezone: "Asia/Yerevan", population: 112000 },
      { name: "Ванадзор", nameEn: "Vanadzor", admin1: "Лорийская область", latitude: 40.8074, longitude: 44.497, timezone: "Asia/Yerevan", population: 76000 },
      { name: "Вагаршапат", nameEn: "Vagharshapat", admin1: "Армавирская область", latitude: 40.1654, longitude: 44.2933, timezone: "Asia/Yerevan", population: 46000 },
      { name: "Раздан", nameEn: "Hrazdan", admin1: "Котайкская область", latitude: 40.5, longitude: 44.7667, timezone: "Asia/Yerevan", population: 40000 },
      { name: "Абовян", nameEn: "Abovyan", admin1: "Котайкская область", latitude: 40.2731, longitude: 44.6267, timezone: "Asia/Yerevan", population: 44000 },
    ],
  },
  {
    iso: "AZ",
    nameRu: "Азербайджан",
    aliases: ["азербайджан", "azerbaijan"],
    cities: [
      { name: "Баку", nameEn: "Baku", admin1: "Баку", latitude: 40.4093, longitude: 49.8671, timezone: "Asia/Baku", population: 2300000 },
      { name: "Гянджа", nameEn: "Ganja", admin1: "Гянджа", latitude: 40.6828, longitude: 46.3606, timezone: "Asia/Baku", population: 335000 },
      { name: "Сумгаит", nameEn: "Sumqayit", admin1: "Сумгаит", latitude: 40.5897, longitude: 49.6686, timezone: "Asia/Baku", population: 345000 },
      { name: "Мингечевир", nameEn: "Mingachevir", admin1: "Мингечевир", latitude: 40.7703, longitude: 47.0489, timezone: "Asia/Baku", population: 106000 },
      { name: "Ленкорань", nameEn: "Lankaran", admin1: "Ленкорань", latitude: 38.7542, longitude: 48.8506, timezone: "Asia/Baku", population: 83000 },
      { name: "Нахичевань", nameEn: "Nakhchivan", admin1: "Нахичеванская АР", latitude: 39.2089, longitude: 45.4122, timezone: "Asia/Baku", population: 94000 },
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
      { name: "Бирмингем", nameEn: "Birmingham", admin1: "Англия", latitude: 52.4862, longitude: -1.8904, timezone: "Europe/London", population: 1140000 },
      { name: "Глазго", nameEn: "Glasgow", admin1: "Шотландия", latitude: 55.8642, longitude: -4.2518, timezone: "Europe/London", population: 635000 },
      { name: "Ливерпуль", nameEn: "Liverpool", admin1: "Англия", latitude: 53.4084, longitude: -2.9916, timezone: "Europe/London", population: 498000 },
      { name: "Бристоль", nameEn: "Bristol", admin1: "Англия", latitude: 51.4545, longitude: -2.5879, timezone: "Europe/London", population: 467000 },
      { name: "Лидс", nameEn: "Leeds", admin1: "Англия", latitude: 53.8008, longitude: -1.5491, timezone: "Europe/London", population: 793000 },
      { name: "Белфаст", nameEn: "Belfast", admin1: "Северная Ирландия", latitude: 54.5973, longitude: -5.9301, timezone: "Europe/London", population: 343000 },
      { name: "Ньюкасл", nameEn: "Newcastle", admin1: "Англия", latitude: 54.9783, longitude: -1.6178, timezone: "Europe/London", population: 300000 },
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
      { name: "Шэньчжэнь", nameEn: "Shenzhen", admin1: "Гуандун", latitude: 22.5431, longitude: 114.0579, timezone: "Asia/Shanghai", population: 12590000 },
      { name: "Чэнду", nameEn: "Chengdu", admin1: "Сычуань", latitude: 30.5728, longitude: 104.0668, timezone: "Asia/Shanghai", population: 16580000 },
      { name: "Чунцин", nameEn: "Chongqing", admin1: "Чунцин", latitude: 29.563, longitude: 106.5516, timezone: "Asia/Shanghai", population: 30480000 },
      { name: "Ухань", nameEn: "Wuhan", admin1: "Хубэй", latitude: 30.5928, longitude: 114.3055, timezone: "Asia/Shanghai", population: 11210000 },
      { name: "Сиань", nameEn: "Xi'an", admin1: "Шэньси", latitude: 34.3416, longitude: 108.9398, timezone: "Asia/Shanghai", population: 12000000 },
      { name: "Ханчжоу", nameEn: "Hangzhou", admin1: "Чжэцзян", latitude: 30.2741, longitude: 120.1551, timezone: "Asia/Shanghai", population: 10360000 },
      { name: "Нанкин", nameEn: "Nanjing", admin1: "Цзянсу", latitude: 32.0603, longitude: 118.7969, timezone: "Asia/Shanghai", population: 8500000 },
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
      { name: "Йокогама", nameEn: "Yokohama", admin1: "Канагава", latitude: 35.4437, longitude: 139.638, timezone: "Asia/Tokyo", population: 3770000 },
      { name: "Нагоя", nameEn: "Nagoya", admin1: "Айти", latitude: 35.1815, longitude: 136.9066, timezone: "Asia/Tokyo", population: 2300000 },
      { name: "Саппоро", nameEn: "Sapporo", admin1: "Хоккайдо", latitude: 43.0618, longitude: 141.3545, timezone: "Asia/Tokyo", population: 1950000 },
      { name: "Кобе", nameEn: "Kobe", admin1: "Хёго", latitude: 34.6901, longitude: 135.1955, timezone: "Asia/Tokyo", population: 1530000 },
      { name: "Фукуока", nameEn: "Fukuoka", admin1: "Фукуока", latitude: 33.5904, longitude: 130.4017, timezone: "Asia/Tokyo", population: 1600000 },
      { name: "Хиросима", nameEn: "Hiroshima", admin1: "Хиросима", latitude: 34.3853, longitude: 132.4553, timezone: "Asia/Tokyo", population: 1200000 },
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
      { name: "Дананг", nameEn: "Da Nang", admin1: "Дананг", latitude: 16.0544, longitude: 108.2022, timezone: "Asia/Ho_Chi_Minh", population: 1130000 },
      { name: "Хайфон", nameEn: "Haiphong", admin1: "Хайфон", latitude: 20.8449, longitude: 106.6881, timezone: "Asia/Ho_Chi_Minh", population: 2020000 },
      { name: "Кантхо", nameEn: "Can Tho", admin1: "Кантхо", latitude: 10.0452, longitude: 105.7469, timezone: "Asia/Ho_Chi_Minh", population: 1230000 },
      { name: "Хюэ", nameEn: "Hue", admin1: "Тхыатхьен-Хюэ", latitude: 16.4637, longitude: 107.5909, timezone: "Asia/Ho_Chi_Minh", population: 450000 },
      { name: "Вунгтау", nameEn: "Vung Tau", admin1: "Бариа-Вунгтау", latitude: 10.346, longitude: 107.0843, timezone: "Asia/Ho_Chi_Minh", population: 527000 },
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

export type CatalogCity = {
  slug: string;
  name: string;
  admin1?: string;
};

export type CatalogRegion = {
  name: string;
  cities: CatalogCity[];
};

export type CatalogCountryItem = {
  iso: string;
  nameRu: string;
  flag: string;
  regions: CatalogRegion[];
  cities: CatalogCity[];
};

export function getAllCatalogCountries(): CatalogCountryItem[] {
  return POPULAR_COUNTRIES.map((c) => {
    const cities: CatalogCity[] = c.cities.map((city) => ({
      slug: slugifyCity(city.name, city.admin1),
      name: city.name,
      admin1: city.admin1,
    }));

    // Group cities by region/admin1
    const regionMap = new Map<string, CatalogCity[]>();
    for (const city of cities) {
      const regionName = city.admin1 ?? "Общий регион";
      const existing = regionMap.get(regionName) ?? [];
      existing.push(city);
      regionMap.set(regionName, existing);
    }

    const regions: CatalogRegion[] = Array.from(regionMap.entries()).map(
      ([name, regionCities]) => ({
        name,
        cities: regionCities,
      }),
    );

    return {
      iso: c.iso,
      nameRu: c.nameRu,
      flag: getCountryFlag(c.iso),
      regions,
      cities,
    };
  });
}

