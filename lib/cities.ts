export function slugifyCity(name: string, admin1?: string): string {
  const base = `${name}-${admin1 ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  // Prefer latin transliteration for URL stability on RU names
  return transliterateRu(base).replace(/-+/g, "-").replace(/^-|-$/g, "") || "city";
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
