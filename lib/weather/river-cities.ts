export type RiverCityInfo = {
  slug: string;
  name: string;
  river: string;
};

export const RIVER_CITIES: Record<string, RiverCityInfo> = {
  moscow: { slug: "moscow", name: "Москва", river: "Москва" },
  "saint-petersburg": { slug: "saint-petersburg", name: "Санкт-Петербург", river: "Нева" },
  novosibirsk: { slug: "novosibirsk", name: "Новосибирск", river: "Обь" },
  yekaterinburg: { slug: "yekaterinburg", name: "Екатеринбург", river: "Исеть" },
  kazan: { slug: "kazan", name: "Казань", river: "Волга" },
  "nizhny-novgorod": { slug: "nizhny-novgorod", name: "Нижний Новгород", river: "Волга" },
  chelyabinsk: { slug: "chelyabinsk", name: "Челябинск", river: "Миасс" },
  samara: { slug: "samara", name: "Самара", river: "Волга" },
  omsk: { slug: "omsk", name: "Омск", river: "Иртыш" },
  "rostov-on-don": { slug: "rostov-on-don", name: "Ростов-на-Дону", river: "Дон" },
  ufa: { slug: "ufa", name: "Уфа", river: "Белая" },
  krasnoyarsk: { slug: "krasnoyarsk", name: "Красноярск", river: "Енисей" },
  voronezh: { slug: "voronezh", name: "Воронеж", river: "Воронеж" },
  perm: { slug: "perm", name: "Пермь", river: "Кама" },
  volgograd: { slug: "volgograd", name: "Волгоград", river: "Волга" },
  saratov: { slug: "saratov", name: "Саратов", river: "Волга" },
  tyumen: { slug: "tyumen", name: "Тюмень", river: "Тура" },
  tolyatti: { slug: "tolyatti", name: "Тольятти", river: "Волга" },
  barnaul: { slug: "barnaul", name: "Барнаул", river: "Обь" },
  ulyanovsk: { slug: "ulyanovsk", name: "Ульяновск", river: "Волга" },
  irkutsk: { slug: "irkutsk", name: "Иркутск", river: "Ангара" },
  tomsk: { slug: "tomsk", name: "Томск", river: "Томь" },
  orenburg: { slug: "orenburg", name: "Оренбург", river: "Урал" },
  kemerovo: { slug: "kemerovo", name: "Кемерово", river: "Томь" },
  ryazan: { slug: "ryazan", name: "Рязань", river: "Ока" },
  penza: { slug: "penza", name: "Пенза", river: "Сура" },
  lipetsk: { slug: "lipetsk", name: "Липецк", river: "Воронеж" },
  kirov: { slug: "kirov", name: "Киров", river: "Вятка" },
  cheboksary: { slug: "cheboksary", name: "Чебоксары", river: "Волга" },
  tula: { slug: "tula", name: "Тула", river: "Упа" },
  kursk: { slug: "kursk", name: "Курск", river: "Сейм" },
  yaroslavl: { slug: "yaroslavl", name: "Ярославль", river: "Волга" },
};

export function getRiverCityBySlug(slug?: string): RiverCityInfo | undefined {
  if (!slug) return undefined;
  return RIVER_CITIES[slug.toLowerCase().trim()];
}

export function isRiverCity(slug?: string): boolean {
  return Boolean(getRiverCityBySlug(slug));
}
