export function buildCityUrl(city: { slug: string; id?: number | string }, tab?: string): string {
  const cleanSlug = city.slug.toLowerCase().replace(/^weather-/, "").replace(/--/g, "-").replace(/-+$/, "");
  let path = `/weather-${cleanSlug}`;
  if (city.id != null) {
    const numId = typeof city.id === "number" ? city.id : parseInt(String(city.id), 10);
    if (typeof numId === "number" && !isNaN(numId) && numId > 0) {
      const idStr = String(numId);
      if (!cleanSlug.endsWith(`-${idStr}`)) {
        path += `-${idStr}`;
      }
    }
  }
  if (tab) {
    const cleanTab = tab.replace(/^\//, "");
    path += `/${cleanTab}`;
  }
  return path;
}

export function slugifyCity(name: string, admin1?: string): string {
  const includeAdmin = Boolean(
    admin1 && admin1.trim().toLowerCase() !== name.trim().toLowerCase(),
  );
  const raw = includeAdmin ? `${name}-${admin1}` : name;
  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ё/g, "е");

  const transliterated = transliterateRu(normalized);
  const cleaned = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (cleaned) return cleaned;

  const hash = Array.from(name).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) | 0,
    0,
  );
  return `city-${Math.abs(hash)}`;
}

const RU_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function transliterateRu(input: string): string {
  return input
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      const mapped = RU_MAP[lower];
      if (mapped === undefined) return /[a-z0-9-]/.test(lower) ? lower : "-";
      return mapped;
    })
    .join("");
}

export function formatTemp(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}°`;
}

export function formatWindDir(degrees: number): string {
  const dirs = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  const idx = Math.round(degrees / 45) % 8;
  return dirs[idx];
}

export function formatPressureMmHg(hPa: number): string {
  const mmHg = Math.round(hPa * 0.750062);
  return `${mmHg} мм рт. ст.`;
}

export function formatTimeAgo(isoString?: string): string | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "обновлено только что";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) {
    return "обновлено меньше минуты назад";
  }
  if (diffMins < 60) {
    const mod10 = diffMins % 10;
    const mod100 = diffMins % 100;
    let unitStr = "минут";
    if (mod10 === 1 && mod100 !== 11) {
      unitStr = "минуту";
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      unitStr = "минуты";
    }
    return `обновлено ${diffMins} ${unitStr} назад`;
  }

  const diffHours = Math.floor(diffMins / 60);
  let hStr = "часов";
  const mod10 = diffHours % 10;
  const mod100 = diffHours % 100;
  if (mod10 === 1 && mod100 !== 11) {
    hStr = "час";
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    hStr = "часа";
  }
  return `обновлено ${diffHours} ${hStr} назад`;
}

export function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2 || countryCode === "XX" || countryCode === "UNKNOWN") return "🌐";
  const code = countryCode.toUpperCase();
  const first = code.charCodeAt(0) - 65 + 0x1f1e6;
  const second = code.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(first, second);
}

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  US: "США",
  USA: "США",
  GB: "Великобритания",
  AE: "ОАЭ",
  RU: "Россия",
  TR: "Турция",
  KZ: "Казахстан",
  BY: "Беларусь",
  UA: "Украина",
  DE: "Германия",
  FR: "Франция",
  ES: "Испания",
  IT: "Италия",
  EG: "Египет",
  TH: "Таиланд",
  CN: "Китай",
  JP: "Япония",
  GE: "Грузия",
  AM: "Армения",
  AZ: "Азербайджан",
  UZ: "Узбекистан",
  KG: "Кыргызстан",
  TJ: "Таджикистан",
  VN: "Вьетнам",
  CY: "Кипр",
  GR: "Греция",
  RS: "Сербия",
  ME: "Черногория",
  IN: "Индия",
};

export function getCountryNameRu(countryCode?: string): string {
  if (!countryCode || countryCode === "UNKNOWN") return "";
  const upper = countryCode.toUpperCase();
  if (COUNTRY_NAME_OVERRIDES[upper]) return COUNTRY_NAME_OVERRIDES[upper];
  try {
    const regionNames = new Intl.DisplayNames(["ru"], { type: "region" });
    return regionNames.of(upper) ?? upper;
  } catch {
    return upper;
  }
}

export function getCityTimezone(
  cityName: string,
  region?: string,
  longitude?: number,
): string {
  const r = (region || "").toLowerCase();
  const n = (cityName || "").toLowerCase();

  if (r.includes("калининград")) return "Europe/Kaliningrad";
  if (
    r.includes("самар") ||
    r.includes("саратов") ||
    r.includes("ульяновск") ||
    r.includes("удмурт") ||
    r.includes("астрахан")
  ) {
    return "Europe/Samara";
  }
  if (
    r.includes("свердловск") ||
    r.includes("челябинск") ||
    r.includes("перм") ||
    r.includes("тюмен") ||
    r.includes("башкортостан") ||
    r.includes("оренбург") ||
    r.includes("ханты-манси") ||
    r.includes("курган") ||
    r.includes("ямало-ненец")
  ) {
    return "Asia/Yekaterinburg";
  }
  if (r.includes("омск")) return "Asia/Omsk";
  if (r.includes("новосибирск")) return "Asia/Novosibirsk";
  if (r.includes("алтай")) return "Asia/Barnaul";
  if (r.includes("томск")) return "Asia/Tomsk";
  if (r.includes("кемеров")) return "Asia/Kemerovo";
  if (r.includes("красноярск") || r.includes("хакаси")) return "Asia/Krasnoyarsk";
  if (r.includes("иркутск") || r.includes("буряти")) return "Asia/Irkutsk";
  if (r.includes("забайкал")) return "Asia/Chita";
  if (r.includes("якути") || n.includes("якутск")) return "Asia/Yakutsk";
  if (r.includes("примор") || r.includes("хабаровск") || r.includes("амурск")) {
    return "Asia/Vladivostok";
  }
  if (r.includes("сахалин")) return "Asia/Sakhalin";
  if (r.includes("камчат")) return "Asia/Kamchatka";
  if (r.includes("магадан")) return "Asia/Magadan";

  // Longitude fallback bounds for Russian regions
  if (longitude !== undefined) {
    if (longitude < 24) return "Europe/Kaliningrad";
    if (longitude < 49.5) return "Europe/Moscow";
    if (longitude < 54) return "Europe/Samara";
    if (longitude < 70) return "Asia/Yekaterinburg";
    if (longitude < 78) return "Asia/Omsk";
    if (longitude < 88) return "Asia/Novosibirsk";
    if (longitude < 98) return "Asia/Krasnoyarsk";
    if (longitude < 110) return "Asia/Irkutsk";
    if (longitude < 120) return "Asia/Chita";
    if (longitude < 132) return "Asia/Yakutsk";
    if (longitude < 145) return "Asia/Vladivostok";
    if (longitude < 155) return "Asia/Magadan";
    return "Asia/Kamchatka";
  }

  return "Europe/Moscow";
}

export function shouldIndexCity(city: {
  isCurated?: boolean;
  population?: number | null;
}): boolean {
  if (city.isCurated) return true;
  if (typeof city.population === "number" && city.population >= 15000) {
    return true;
  }
  return false;
}

export function latinToCyrillicRu(input: string): string {
  if (!input) return "";
  let str = input.toLowerCase().trim();

  const phraseMap: Record<string, string> = {
    "nha trang": "нячанг",
    "phu quoc": "фукуок",
    "sharm el sheikh": "шарм-эшь-шейх",
    "st petersburg": "санкт-петербург",
    pattaya: "паттайя",
  };

  if (phraseMap[str]) return phraseMap[str];

  const multiMap: [RegExp, string][] = [
    [/shch|sch/g, "щ"],
    [/sh/g, "ш"],
    [/ch/g, "ч"],
    [/zh/g, "ж"],
    [/ts/g, "ц"],
    [/yu/g, "ю"],
    [/ya/g, "я"],
    [/kh/g, "х"],
    [/ye|yo/g, "е"],
    [/iy|yy/g, "ий"],
    [/ph/g, "ф"],
  ];

  for (const [pattern, repl] of multiMap) {
    str = str.replace(pattern, repl);
  }

  const singleMap: Record<string, string> = {
    a: "а", b: "б", v: "в", g: "г", d: "д", e: "е", z: "з", i: "и",
    j: "й", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", r: "р",
    s: "с", t: "т", u: "у", f: "ф", h: "х", y: "ы", c: "к", q: "к",
    x: "кс", w: "в",
  };

  return str
    .split("")
    .map((ch) => singleMap[ch] ?? ch)
    .join("");
}

export function formatDateTimeRu(isoString?: string, timeZone?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";

  try {
    const formatter = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || "Europe/Moscow",
    });
    return formatter.format(d).replace(/\u202f/g, " ").replace(/\u00a0/g, " ");
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}





