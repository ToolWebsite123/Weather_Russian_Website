"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { getCountryNameRu, getCountryFlag, buildCityUrl } from "@/lib/cities";
import { ru } from "@/lib/i18n/ru";
import type { GeocodingResult } from "@/types/weather";

export function CitySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
    const normalizedQuery = query.normalize("NFC").trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { results: GeocodingResult[] };
        setResults(data.results);
        setActiveIndex(-1);
        setOpen(true);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  function goTo(slug: string, id?: number | string) {
    startTransition(() => {
      router.push(buildCityUrl({ slug, id }));
      setOpen(false);
      setActiveIndex(-1);
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open && results.length > 0) {
        setOpen(true);
        setActiveIndex(0);
      } else if (results.length > 0) {
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open && results.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
      }
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        goTo(results[activeIndex].slug, results[activeIndex].id);
      }
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (open && activeIndex >= 0 && results[activeIndex]) {
      goTo(results[activeIndex].slug, results[activeIndex].id);
      return;
    }
    if (results[0]) {
      goTo(results[0].slug, results[0].id);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { results: GeocodingResult[] };
    if (data.results[0]) goTo(data.results[0].slug, data.results[0].id);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls="city-search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0 && results[activeIndex]
              ? `city-search-option-${activeIndex}`
              : undefined
          }
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
        <ul
          id="city-search-listbox"
          role="listbox"
          className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-sky-200/80 bg-white/95 p-1 shadow-xl backdrop-blur-md"
        >
          {results.map((r, index) => {
            const isActive = activeIndex === index;
            const flag = r.countryFlag || getCountryFlag(r.country);
            const countryRu = r.countryNameRu || getCountryNameRu(r.country);
            const locationText = [r.admin1, countryRu].filter(Boolean).join(", ");
            const targetUrl = buildCityUrl({ slug: r.slug, id: r.id });

            return (
              <li
                key={`${r.id}-${r.slug}`}
                id={`city-search-option-${index}`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left transition-colors ${
                    isActive ? "bg-sky-100/90 text-sky-950" : "hover:bg-sky-50 text-sky-900"
                  }`}
                  onClick={() => goTo(r.slug, r.id)}
                  onMouseEnter={() => {
                    setActiveIndex(index);
                    router.prefetch(targetUrl);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0" role="img" aria-label={countryRu}>
                      {flag}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{r.name}</span>
                        {r.isCountryMatch && (
                          <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                            Страна
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cloud-500 truncate mt-0.5">
                        📍 {locationText}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-sky-600 shrink-0 ml-2">
                    Перейти →
                  </span>
                </button>
              </li>
            );
          })}
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
  cities: { slug: string; name: string; id?: number | string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {cities.map((c) => (
        <Link
          key={c.slug}
          href={buildCityUrl(c)}
          prefetch={true}
          className="rounded-full border border-sky-200/70 bg-white/70 px-3 py-1.5 text-sm text-sky-900 transition hover:border-sun-400 hover:bg-sun-50"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
