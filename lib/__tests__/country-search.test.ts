import { describe, it, expect } from "vitest";
import { getCountryFlag, getCountryNameRu } from "@/lib/cities";
import { findCitiesByCountryQuery, getAllCatalogCountries } from "@/lib/weather/countries";

describe("Country Search & Flag Utilities", () => {
  it("generates correct country flag emojis including Pakistan", () => {
    expect(getCountryFlag("PK")).toBe("🇵🇰");
    expect(getCountryFlag("RU")).toBe("🇷🇺");
    expect(getCountryFlag("TR")).toBe("🇹🇷");
    expect(getCountryFlag("KZ")).toBe("🇰🇿");
    expect(getCountryFlag("US")).toBe("🇺🇸");
    expect(getCountryFlag("ES")).toBe("🇪🇸");
    expect(getCountryFlag("DE")).toBe("🇩🇪");
    expect(getCountryFlag("FR")).toBe("🇫🇷");
    expect(getCountryFlag("AE")).toBe("🇦🇪");
    expect(getCountryFlag("EG")).toBe("🇪🇬");
    expect(getCountryFlag("TH")).toBe("🇹🇭");
    expect(getCountryFlag("INVALID")).toBe("🌐");
  });

  it("translates country codes to Russian country names", () => {
    expect(getCountryNameRu("PK")).toBe("Пакистан");
    expect(getCountryNameRu("RU")).toBe("Россия");
    expect(getCountryNameRu("US")).toBe("США");
    expect(getCountryNameRu("TR")).toBe("Турция");
    expect(getCountryNameRu("KZ")).toBe("Казахстан");
    expect(getCountryNameRu("BY")).toBe("Беларусь");
    expect(getCountryNameRu("EG")).toBe("Египет");
    expect(getCountryNameRu("DE")).toBe("Германия");
  });

  it("finds top cities when searching by country name in Russian or English", () => {
    const pakistanMatches = findCitiesByCountryQuery("Пакистан");
    expect(pakistanMatches.length).toBeGreaterThan(0);
    expect(pakistanMatches[0].country).toBe("PK");
    expect(pakistanMatches[0].countryNameRu).toBe("Пакистан");
    expect(pakistanMatches[0].countryFlag).toBe("🇵🇰");
    expect(pakistanMatches.some((c) => c.name === "Карачи")).toBe(true);
    expect(pakistanMatches.some((c) => c.name === "Лахор")).toBe(true);
    expect(pakistanMatches.some((c) => c.name === "Исламабад")).toBe(true);

    const turkeyMatches = findCitiesByCountryQuery("Турция");
    expect(turkeyMatches.length).toBeGreaterThan(0);
    expect(turkeyMatches[0].country).toBe("TR");
    expect(turkeyMatches.some((c) => c.name === "Стамбул")).toBe(true);

    const kazakhstanMatches = findCitiesByCountryQuery("kazakhstan");
    expect(kazakhstanMatches.length).toBeGreaterThan(0);
    expect(kazakhstanMatches[0].country).toBe("KZ");
    expect(kazakhstanMatches.some((c) => c.name === "Алматы")).toBe(true);
  });

  it("getAllCatalogCountries returns Pakistan as the first country", () => {
    const catalog = getAllCatalogCountries();
    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog[0].iso).toBe("PK");
    expect(catalog[0].nameRu).toBe("Пакистан");
    expect(catalog[0].flag).toBe("🇵🇰");
    expect(catalog[0].cities.some((c) => c.name === "Карачи")).toBe(true);
  });

  it("returns empty array for unknown or short search query", () => {
    expect(findCitiesByCountryQuery("")).toEqual([]);
    expect(findCitiesByCountryQuery("a")).toEqual([]);
    expect(findCitiesByCountryQuery("xyzcountry123")).toEqual([]);
  });
});
