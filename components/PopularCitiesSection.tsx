"use client";

import { useState } from "react";
import Link from "next/link";
import { buildCityUrl } from "@/lib/cities";
import { getAllCatalogCountries } from "@/lib/weather/countries";

export function PopularCitiesSection() {
  const catalogCountries = getAllCatalogCountries();
  const targetIsos = ["PK", "RU", "TR", "AE", "KZ"];
  const countryList = catalogCountries.filter((c) => targetIsos.includes(c.iso));

  const [selectedIso, setSelectedIso] = useState<string>("PK");

  const currentCountry =
    countryList.find((c) => c.iso === selectedIso) ?? countryList[0] ?? catalogCountries[0];

  return (
    <section className="rounded-2xl bg-white p-4 sm:p-6 border border-sky-100 shadow-xs text-slate-900 max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-sky-950 flex items-center gap-2">
          <span>{currentCountry.flag}</span>
          <span>Популярные города ({currentCountry.nameRu})</span>
        </h2>

        {/* Country Selector Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {countryList.map((country) => (
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
              <span>{country.nameRu}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6-Column Unified Cities Grid matching design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs sm:text-sm">
        {currentCountry.cities.map((city) => (
          <Link
            key={city.slug}
            href={buildCityUrl(city)}
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

