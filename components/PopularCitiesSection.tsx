import Link from "next/link";

const CITIES_GRID = [
  [
    { name: "Москва", slug: "moscow" },
    { name: "Санкт-Петербург", slug: "saint-petersburg" },
    { name: "Новосибирск", slug: "novosibirsk" },
    { name: "Екатеринбург", slug: "yekaterinburg" },
    { name: "Казань", slug: "kazan" },
    { name: "Нижний Новгород", slug: "nizhny-novgorod" },
  ],
  [
    { name: "Челябинск", slug: "chelyabinsk" },
    { name: "Самара", slug: "samara" },
    { name: "Омск", slug: "omsk" },
    { name: "Ростов-на-Дону", slug: "rostov-on-don" },
    { name: "Уфа", slug: "ufa" },
    { name: "Красноярск", slug: "krasnoyarsk" },
  ],
  [
    { name: "Воронеж", slug: "voronezh" },
    { name: "Пермь", slug: "perm" },
    { name: "Волгоград", slug: "volgograd" },
    { name: "Краснодар", slug: "krasnodar" },
    { name: "Саратов", slug: "saratov" },
    { name: "Тюмень", slug: "tyumen" },
  ],
  [
    { name: "Тольятти", slug: "tolyatti" },
    { name: "Ижевск", slug: "izhevsk" },
    { name: "Ульяновск", slug: "ulyanovsk" },
    { name: "Иркутск", slug: "irkutsk" },
    { name: "Хабаровск", slug: "khabarovsk" },
    { name: "Ярославль", slug: "yaroslavl" },
  ],
  [
    { name: "Барнаул", slug: "barnaul" },
    { name: "Владивосток", slug: "vladivostok" },
    { name: "Махачкала", slug: "makhachkala" },
    { name: "Томск", slug: "tomsk" },
    { name: "Оренбург", slug: "orenburg" },
    { name: "Пенза", slug: "penza" },
  ],
  [
    { name: "Кемерово", slug: "kemerovo" },
    { name: "Рязань", slug: "ryazan" },
    { name: "Астрахань", slug: "astrakhan" },
    { name: "Набережные Челны", slug: "naberezhnye-chelny" },
    { name: "Киров", slug: "kirov" },
    { name: "Тверь", slug: "tver" },
  ],
];

export function PopularCitiesSection() {
  return (
    <section className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-xs text-slate-900 max-w-4xl mx-auto">
      <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-3">
        Популярные пункты в России
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-1.5 text-xs sm:text-sm">
        {CITIES_GRID.map((column, colIdx) => (
          <div key={colIdx} className="space-y-1.5">
            {column.map((city) => (
              <Link
                key={city.slug}
                href={`/pogoda/${city.slug}`}
                className="block text-[#0077ff] hover:underline transition-colors font-normal truncate"
              >
                {city.name}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
