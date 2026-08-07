export interface CityClimateProfile {
  climateType: string;
  pressureNorm: string;
  specialNote: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export const CITY_CLIMATE_MAP: Record<string, CityClimateProfile> = {
  "saint-petersburg": {
    climateType: "умеренный и влажный (переходный от морского к континентальному)",
    pressureNorm: "758–762 мм рт. ст. (город расположен на уровне моря у Финского залива)",
    specialNote:
      "Погода в Санкт-Петербурге славится повышенной влажностью воздуха, частыми ветрами с Балтики и знаменитым периодом Белых ночей в начале лета.",
    faqs: [
      {
        question: "Почему в Санкт-Петербурге ощущается холоднее, чем на термометре?",
        answer:
          "Из-за высокой относительной влажности и ветров с Финского залива и Невы показатель 'ощущается как' в СПб часто на 3–5°C ниже фактической температуры.",
      },
      {
        question: "Когда в Санкт-Петербурге проходят Белые ночи?",
        answer:
          "Период Белых ночей в Санкт-Петербурге длится с конца мая по середину июля. Пик продолжительности светового дня (около 18 часов 50 минут) приходится на 21–22 июня.",
      },
    ],
  },
  moscow: {
    climateType: "умеренно-континентальный с чёткой сезонностью",
    pressureNorm: "745–749 мм рт. ст. (из-за средней высоты 130–150 м над уровнем моря)",
    specialNote:
      "Погода в Москве формируется под влиянием атлантических и арктических циклонов, вызывая быструю смену температурных режимов.",
  },
};

export function getCityClimateProfile(slug: string, cityName: string): CityClimateProfile {
  const profile = CITY_CLIMATE_MAP[slug.toLowerCase()];
  if (profile) return profile;

  return {
    climateType: "умеренно-континентальный",
    pressureNorm: "748–755 мм рт. ст.",
    specialNote: `Погода в городе ${cityName} формируется под воздействием региональных атмосферных фронтов с сезонной сменностью температур.`,
  };
}
