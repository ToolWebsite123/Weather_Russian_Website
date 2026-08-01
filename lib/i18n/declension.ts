/**
 * Russian City Name Declension Helper
 * Handles Infinitive (Именительный), Prepositional/Locative (Предложный - "в [городе]"),
 * and Genitive (Родительный - "погода [города]") cases for Russian cities.
 */

interface DeclensionPair {
  locative: string; // "в Москве", "во Владивостоке"
  genitive: string; // "Москвы", "Владивостока"
}

// Dictionary overrides for major Russian cities & special cases
const DICTIONARY: Record<string, DeclensionPair> = {
  москва: { locative: "в Москве", genitive: "Москвы" },
  "санкт-петербург": { locative: "в Санкт-Петербурге", genitive: "Санкт-Петербурга" },
  новосибирск: { locative: "в Новосибирске", genitive: "Новосибирска" },
  екатеринбург: { locative: "в Екатеринбурге", genitive: "Екатеринбурга" },
  казань: { locative: "в Казани", genitive: "Казани" },
  "нижний новгород": { locative: "в Нижнем Новгороде", genitive: "Нижнего Новгорода" },
  челябинск: { locative: "в Челябинске", genitive: "Челябинска" },
  самара: { locative: "в Самаре", genitive: "Самары" },
  омск: { locative: "в Омске", genitive: "Омска" },
  "ростов-на-дону": { locative: "в Ростове-на-Дону", genitive: "Ростова-на-Дону" },
  уфа: { locative: "в Уфе", genitive: "Уфы" },
  красноярск: { locative: "в Красноярске", genitive: "Красноярска" },
  воронеж: { locative: "в Воронеже", genitive: "Воронежа" },
  пермь: { locative: "в Перми", genitive: "Перми" },
  волгоград: { locative: "в Волгограде", genitive: "Волгограда" },
  краснодар: { locative: "в Краснодаре", genitive: "Краснодара" },
  саратов: { locative: "в Саратове", genitive: "Саратова" },
  тюмень: { locative: "в Тюмени", genitive: "Тюмени" },
  тольятти: { locative: "в Тольятти", genitive: "Тольятти" },
  барнаул: { locative: "в Барнауле", genitive: "Барнаула" },
  ижевск: { locative: "в Ижевске", genitive: "Ижевска" },
  ульяновск: { locative: "в Ульяновске", genitive: "Ульяновска" },
  иркутск: { locative: "в Иркутске", genitive: "Иркутска" },
  хабаровск: { locative: "в Хабаровске", genitive: "Хабаровска" },
  ярославль: { locative: "в Ярославле", genitive: "Ярославля" },
  владивосток: { locative: "во Владивостоке", genitive: "Владивостока" },
  махачкала: { locative: "в Махачкале", genitive: "Махачкалы" },
  томск: { locative: "в Томске", genitive: "Томска" },
  оренбург: { locative: "в Оренбурге", genitive: "Оренбурга" },
  кемерово: { locative: "в Кемерово", genitive: "Кемерово" },
  сочи: { locative: "в Сочи", genitive: "Сочи" },
  севастополь: { locative: "в Севастополе", genitive: "Севастополя" },
  симферополь: { locative: "в Симферополе", genitive: "Симферополя" },
};

/**
 * Returns "в [городе]" or "во [городе]" with preposition included.
 */
export function getCityLocative(cityName: string): string {
  if (!cityName) return "в городе";
  const key = cityName.trim().toLowerCase();
  if (DICTIONARY[key]) return DICTIONARY[key].locative;

  // Heuristic rule for unknown Russian city names
  if (cityName.endsWith("а")) {
    return `в ${cityName.slice(0, -1)}е`;
  }
  if (cityName.endsWith("я")) {
    return `в ${cityName.slice(0, -1)}е`;
  }
  if (cityName.endsWith("ь")) {
    return `в ${cityName.slice(0, -1)}и`;
  }
  if (cityName.endsWith("и") || cityName.endsWith("ы") || cityName.endsWith("о") || cityName.endsWith("е")) {
    return `в ${cityName}`;
  }
  // Default masculine consonant ending
  const prep = cityName.toLowerCase().startsWith("вл") ? "во" : "в";
  return `${prep} ${cityName}е`;
}

/**
 * Returns Genitive case "[города]" (e.g. "Москвы", "Санкт-Петербурга").
 */
export function getCityGenitive(cityName: string): string {
  if (!cityName) return "города";
  const key = cityName.trim().toLowerCase();
  if (DICTIONARY[key]) return DICTIONARY[key].genitive;

  if (cityName.endsWith("а")) {
    return `${cityName.slice(0, -1)}ы`;
  }
  if (cityName.endsWith("я")) {
    return `${cityName.slice(0, -1)}и`;
  }
  if (cityName.endsWith("ь")) {
    return `${cityName.slice(0, -1)}и`;
  }
  if (cityName.endsWith("и") || cityName.endsWith("ы") || cityName.endsWith("о") || cityName.endsWith("е")) {
    return cityName;
  }
  return `${cityName}а`;
}
