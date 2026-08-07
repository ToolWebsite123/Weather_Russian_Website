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
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
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
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  function goTo(slug: string) {
    startTransition(() => {
      router.push(`/pogoda/${slug}`);
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
        goTo(results[activeIndex].slug);
      }
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (open && activeIndex >= 0 && results[activeIndex]) {
      goTo(results[activeIndex].slug);
      return;
    }
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
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-cloud-200 bg-white py-1 shadow-lg"
        >
          {results.map((r, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                key={`${r.id}-${r.slug}`}
                id={`city-search-option-${index}`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  className={`flex w-full flex-col px-4 py-2.5 text-left transition-colors ${
                    isActive ? "bg-sky-100" : "hover:bg-sky-50"
                  }`}
                  onClick={() => goTo(r.slug)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="font-medium text-sky-950">{r.name}</span>
                  <span className="text-sm text-cloud-500">
                    {[r.admin1, r.country].filter(Boolean).join(", ")}
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
