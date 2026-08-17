import Link from "next/link";
import { getRelatedCountryCities } from "@/lib/weather/countries";

export function CountryRelatedCities({
  city,
}: {
  city: { slug: string; name: string; country?: string };
}) {
  const data = getRelatedCountryCities(city);
  if (!data || data.cities.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white/90 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
        <h2 className="text-base sm:text-lg font-bold text-sky-950 flex items-center gap-2">
          <span>{data.flag}</span>
          <span>Погода в других городах ({data.countryNameRu})</span>
        </h2>
        <Link
          href={`/gorod#country-${data.countryIso}`}
          className="text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline transition-colors"
        >
          Все города {data.countryNameRu} →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs sm:text-sm">
        {data.cities.map((c) => {
          const isCurrent = c.slug.toLowerCase() === city.slug.toLowerCase();
          return (
            <Link
              key={c.slug}
              href={`/pogoda/${c.slug}`}
              prefetch={true}
              className={`block truncate transition-colors ${
                isCurrent
                  ? "font-bold text-sky-950 underline"
                  : "text-[#0077ff] hover:underline font-normal"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
