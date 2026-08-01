"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { ru } from "@/lib/i18n/ru";
import type { GeocodingResult } from "@/types/weather";

export function CitySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { results: GeocodingResult[] };
      setResults(data.results);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function goTo(slug: string) {
    startTransition(() => {
      router.push(`/pogoda/${slug}`);
      setOpen(false);
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (results[0]) {
      goTo(results[0].slug);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { results: GeocodingResult[] };
    if (data.results[0]) goTo(data.results[0].slug);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={ru.searchPlaceholder}
          className="w-full rounded-xl border border-sky-200/80 bg-white/90 px-4 py-3 text-sky-950 shadow-sm outline-none ring-sun-400/40 placeholder:text-cloud-400 focus:ring-2"
          autoComplete="off"
          aria-label={ru.searchPlaceholder}
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-sky-700 px-5 py-3 font-medium text-white transition hover:bg-sky-800 disabled:opacity-60"
        >
          {ru.search}
        </button>
      </form>
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-cloud-200 bg-white py-1 shadow-lg">
          {results.map((r) => (
            <li key={`${r.id}-${r.slug}`}>
              <button
                type="button"
                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-sky-50"
                onClick={() => goTo(r.slug)}
              >
                <span className="font-medium text-sky-950">{r.name}</span>
                <span className="text-sm text-cloud-500">
                  {[r.admin1, r.country].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <p className="absolute z-20 mt-2 w-full rounded-xl border border-cloud-200 bg-white px-4 py-3 text-sm text-cloud-500 shadow-lg">
          {ru.noResults}
        </p>
      )}
    </div>
  );
}

export function PopularCityLinks({
  cities,
}: {
  cities: { slug: string; name: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {cities.map((c) => (
        <Link
          key={c.slug}
          href={`/pogoda/${c.slug}`}
          className="rounded-full border border-sky-200/70 bg-white/70 px-3 py-1.5 text-sm text-sky-900 transition hover:border-sun-400 hover:bg-sun-50"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
