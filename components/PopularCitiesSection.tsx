import Link from "next/link";

const CITIES_GRID = [
  [
    { name: "Барнаул", slug: "barnaul" },
    { name: "Екатеринбург", slug: "yekaterinburg" },
    { name: "Красноярск", slug: "krasnoyarsk" },
    { name: "Омск", slug: "omsk" },
    { name: "Ростов-на-Дону", slug: "rostov-on-don" },
    { name: "Тольятти", slug: "tolyatti" },
  ],
  [
    { name: "Белгород", slug: "belgorod" },
    { name: "Казань", slug: "kazan" },
    { name: "Москва", slug: "moscow" },
    { name: "Оренбург", slug: "orenburg" },
    { name: "Самара", slug: "samara" },
    { name: "Томск", slug: "tomsk" },
  ],
  [
    { name: "Волгоград", slug: "volgograd" },
    { name: "Калининград", slug: "kaliningrad" },
    { name: "Нижний Новгород", slug: "nizhny-novgorod" },
    { name: "Пенза", slug: "penza" },
    { name: "Санкт-Петербург", slug: "saint-petersburg" },
    { name: "Тюмень", slug: "tyumen" },
  ],
  [
    { name: "Воронеж", slug: "voronezh" },
    { name: "Краснодар", slug: "krasnodar" },
    { name: "Новосибирск", slug: "novosibirsk" },
    { name: "Пермь", slug: "perm" },
    { name: "Саратов", slug: "saratov" },
    { name: "Уфа", slug: "ufa" },
  ],
];

export function PopularCitiesSection() {
  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs text-slate-900 max-w-4xl mx-auto">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
        Популярные пункты в России
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-6 text-xs sm:text-sm">
        {CITIES_GRID.map((column, colIdx) => (
          <div key={colIdx} className="space-y-2">
            {column.map((city) => (
              <Link
                key={city.slug}
                href={`/pogoda/${city.slug}`}
                className="block text-[#0077ff] hover:underline transition-colors font-normal"
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
