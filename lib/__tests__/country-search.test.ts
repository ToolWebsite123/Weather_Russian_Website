import { describe, it, expect } from "vitest";
import { getCountryFlag, getCountryNameRu } from "@/lib/cities";
import { findCitiesByCountryQuery } from "@/lib/weather/countries";

describe("Country Search & Flag Utilities", () => {
  it("generates correct country flag emojis", () => {
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
    expect(getCountryNameRu("RU")).toBe("Россия");
    expect(getCountryNameRu("US")).toBe("США");
    expect(getCountryNameRu("TR")).toBe("Турция");
    expect(getCountryNameRu("KZ")).toBe("Казахстан");
    expect(getCountryNameRu("BY")).toBe("Беларусь");
    expect(getCountryNameRu("EG")).toBe("Египет");
    expect(getCountryNameRu("DE")).toBe("Германия");
  });

  it("finds top cities when searching by country name in Russian or English", () => {
    const turkeyMatches = findCitiesByCountryQuery("Турция");
    expect(turkeyMatches.length).toBeGreaterThan(0);
    expect(turkeyMatches[0].country).toBe("TR");
    expect(turkeyMatches[0].countryNameRu).toBe("Турция");
    expect(turkeyMatches[0].countryFlag).toBe("🇹🇷");
    expect(turkeyMatches.some((c) => c.name === "Стамбул")).toBe(true);
    expect(turkeyMatches.some((c) => c.name === "Анталья")).toBe(true);

    const kazakhstanMatches = findCitiesByCountryQuery("казахстан");
    expect(kazakhstanMatches.length).toBeGreaterThan(0);
    expect(kazakhstanMatches[0].country).toBe("KZ");
    expect(kazakhstanMatches.some((c) => c.name === "Алматы")).toBe(true);

    const egyptMatches = findCitiesByCountryQuery("egypt");
    expect(egyptMatches.length).toBeGreaterThan(0);
    expect(egyptMatches[0].country).toBe("EG");
    expect(egyptMatches.some((c) => c.name === "Хургада")).toBe(true);

    const usaMatches = findCitiesByCountryQuery("США");
    expect(usaMatches.length).toBeGreaterThan(0);
    expect(usaMatches[0].country).toBe("US");
    expect(usaMatches.some((c) => c.name === "Нью-Йорк")).toBe(true);
  });

  it("returns empty array for unknown or short search query", () => {
    expect(findCitiesByCountryQuery("")).toEqual([]);
    expect(findCitiesByCountryQuery("a")).toEqual([]);
    expect(findCitiesByCountryQuery("xyzcountry123")).toEqual([]);
  });
});
