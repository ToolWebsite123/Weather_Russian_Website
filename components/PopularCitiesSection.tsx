"use client";

import { useState } from "react";
import Link from "next/link";

const COUNTRY_DATA = [
  {
    iso: "PK",
    name: "Пакистан",
    flag: "🇵🇰",
    cities: [
      { name: "Карачи", slug: "karachi-sind" },
      { name: "Лахор", slug: "lahore-pendzhab" },
      { name: "Исламабад", slug: "islamabad-islamabad" },
      { name: "Равалпинди", slug: "rawalpindi-pendzhab" },
      { name: "Фейсалабад", slug: "faisalabad-pendzhab" },
      { name: "Пешавар", slug: "peshawar-khayber-pakhtunkhva" },
      { name: "Мультан", slug: "multan-pendzhab" },
      { name: "Гуджранвала", slug: "gujranwala-pendzhab" },
      { name: "Сиалкот", slug: "sialkot-pendzhab" },
      { name: "Кветта", slug: "quetta-beludzhistan" },
      { name: "Хайдарабад", slug: "hyderabad-sind" },
      { name: "Бахавалпур", slug: "bahawalpur-pendzhab" },
      { name: "Саргодха", slug: "sargodha-pendzhab" },
      { name: "Суккур", slug: "sukkur-sind" },
      { name: "Абботтабад", slug: "abbottabad-khayber-pakhtunkhva" },
      { name: "Мардан", slug: "mardan-khayber-pakhtunkhva" },
      { name: "Гуджрат", slug: "gujrat-pendzhab" },
      { name: "Сахивал", slug: "sahiwal-pendzhab" },
    ],
  },
  {
    iso: "RU",
    name: "Россия",
    flag: "🇷🇺",
    cities: [
      { name: "Москва", slug: "moscow" },
      { name: "Санкт-Петербург", slug: "saint-petersburg" },
      { name: "Новосибирск", slug: "novosibirsk" },
      { name: "Екатеринбург", slug: "yekaterinburg" },
      { name: "Казань", slug: "kazan" },
      { name: "Нижний Новгород", slug: "nizhny-novgorod" },
      { name: "Челябинск", slug: "chelyabinsk" },
      { name: "Самара", slug: "samara" },
      { name: "Омск", slug: "omsk" },
      { name: "Ростов-на-Дону", slug: "rostov-on-don" },
      { name: "Уфа", slug: "ufa" },
      { name: "Красноярск", slug: "krasnoyarsk" },
      { name: "Воронеж", slug: "voronezh" },
      { name: "Пермь", slug: "perm" },
      { name: "Волгоград", slug: "volgograd" },
      { name: "Краснодар", slug: "krasnodar" },
      { name: "Саратов", slug: "saratov" },
      { name: "Тюмень", slug: "tyumen" },
      { name: "Тольятти", slug: "tolyatti" },
      { name: "Ижевск", slug: "izhevsk" },
      { name: "Ульяновск", slug: "ulyanovsk" },
      { name: "Иркутск", slug: "irkutsk" },
      { name: "Хабаровск", slug: "khabarovsk" },
      { name: "Ярославль", slug: "yaroslavl" },
    ],
  },
  {
    iso: "TR",
    name: "Турция",
    flag: "🇹🇷",
    cities: [
      { name: "Стамбул", slug: "istanbul-stambul" },
      { name: "Анталья", slug: "antalya-antalya" },
      { name: "Анкара", slug: "ankara-ankara" },
      { name: "Измир", slug: "izmir-izmir" },
      { name: "Бодрум", slug: "bodrum-mugla" },
      { name: "Аланья", slug: "alanya-antalya" },
    ],
  },
  {
    iso: "AE",
    name: "ОАЭ",
    flag: "🇦🇪",
    cities: [
      { name: "Дубай", slug: "dubai-dubai" },
      { name: "Абу-Даби", slug: "abu-dhabi-abu-dhabi" },
      { name: "Шарджа", slug: "sharjah-shardzha" },
    ],
  },
  {
    iso: "KZ",
    name: "Казахстан",
    flag: "🇰🇿",
    cities: [
      { name: "Алматы", slug: "almaty-almaty" },
      { name: "Астана", slug: "astana-astana" },
      { name: "Шымкент", slug: "shymkent-shymkent" },
      { name: "Караганда", slug: "karaganda-karagandinskaya-oblast" },
      { name: "Актобе", slug: "aktobe-aktyubinskaya-oblast" },
    ],
  },
];

export function PopularCitiesSection() {
  const [selectedIso, setSelectedIso] = useState<string>("PK");

  const currentCountry =
    COUNTRY_DATA.find((c) => c.iso === selectedIso) ?? COUNTRY_DATA[0];

  return (
    <section className="rounded-2xl bg-white p-4 sm:p-6 border border-sky-100 shadow-xs text-slate-900 max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-sky-950 flex items-center gap-2">
          <span>{currentCountry.flag}</span>
          <span>Популярные города ({currentCountry.name})</span>
        </h2>

        {/* Country Selector Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {COUNTRY_DATA.map((country) => (
            <button
              key={country.iso}
              onClick={() => setSelectedIso(country.iso)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedIso === country.iso
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-sky-50 text-sky-900 hover:bg-sky-100"
              }`}
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6-Column Unified Cities Grid matching Image 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs sm:text-sm">
        {currentCountry.cities.map((city) => (
          <Link
            key={city.slug}
            href={`/pogoda/${city.slug}`}
            prefetch={true}
            className="block text-[#0077ff] hover:underline transition-colors font-normal truncate"
          >
            {city.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
