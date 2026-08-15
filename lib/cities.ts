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

export function getCountryNameRu(countryCode?: string): string {
  if (!countryCode || countryCode === "UNKNOWN") return "";
  try {
    const regionNames = new Intl.DisplayNames(["ru"], { type: "region" });
    return regionNames.of(countryCode.toUpperCase()) ?? countryCode;
  } catch {
    return countryCode;
  }
}


