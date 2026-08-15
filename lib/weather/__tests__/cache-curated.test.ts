import { describe, it, expect, vi } from "vitest";
import { upsertCityFromGeo, getBatchCachedWeather } from "../cache";
import { prisma } from "@/lib/prisma";
import type { City, WeatherCache, Prisma } from "@prisma/client";
import type { WeatherBundle } from "@/types/weather";

function mockCity(overrides: Partial<City>): City {
  return {
    id: 1,
    slug: "city-slug",
    name: "City Name",
    nameEn: "City Name En",
    country: "RU",
    region: null,
    latitude: 55.75,
    longitude: 37.61,
    timezone: "Europe/Moscow",
    population: 1000000,
    tier: 1,
    isCurated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function mockWeatherBundle(overrides?: Partial<WeatherBundle>): WeatherBundle {
  return {
    provider: "open-meteo",
    latitude: 55.75,
    longitude: 37.61,
    timezone: "Europe/Moscow",
    current: {
      time: "2026-08-07T09:00:00Z",
      temperature: 20,
      feelsLike: 20,
      humidity: 50,
      windSpeed: 5,
      windDirection: 180,
      pressure: 750,
      weatherCode: 0,
      isDay: true,
      precipitation: 0,
      cloudCover: 10,
    },
    hourly: [],
    daily: [],
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

function mockWeatherCacheRow(overrides?: Partial<WeatherCache>): WeatherCache {
  return {
    id: "cache-1",
    cityId: 1,
    payload: mockWeatherBundle() as unknown as Prisma.JsonValue,
    fetchedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    ...overrides,
  };
}

vi.mock("@/lib/prisma", () => ({
  prisma: {
    city: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    weatherCache: {
      findMany: vi.fn(),
    },
  },
}));

describe("upsertCityFromGeo - isCurated preservation", () => {
  it("does NOT change isCurated to false when upserting an existing curated city", async () => {
    vi.mocked(prisma.city.findUnique).mockResolvedValueOnce({
      id: 10,
      slug: "moscow",
      name: "Москва",
      nameEn: "Moscow",
      country: "RU",
      region: null,
      latitude: 55.75,
      longitude: 37.61,
      timezone: "Europe/Moscow",
      population: 12653744,
      tier: 1,
      isCurated: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.city.upsert).mockImplementationOnce((async (args: unknown) => {
      const a = args as { where: { slug: string }; update: { name: string; nameEn?: string; isCurated?: boolean } };
      return {
        id: 10,
        slug: a.where.slug,
        name: a.update.name,
        nameEn: a.update.nameEn || a.update.name,
        country: "RU",
        region: null,
        latitude: 55.75,
        longitude: 37.61,
        timezone: "Europe/Moscow",
        population: 12653744,
        tier: 1,
        isCurated: a.update.isCurated ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }) as unknown as typeof prisma.city.upsert);

    const result = await upsertCityFromGeo({
      slug: "moscow",
      name: "Москва",
      country: "RU",
      latitude: 55.75,
      longitude: 37.61,
    });

    expect(prisma.city.findUnique).toHaveBeenCalledWith({
      where: { slug: "moscow" },
      select: { isCurated: true },
    });

    expect(prisma.city.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "moscow" },
        update: expect.objectContaining({
          isCurated: true,
        }),
      })
    );

    expect(result.isCurated).toBe(true);
  });

  it("sets isCurated: false for new uncurated cities", async () => {
    vi.mocked(prisma.city.findUnique).mockResolvedValueOnce(null);

    vi.mocked(prisma.city.upsert).mockImplementationOnce((async (args: unknown) => {
      const a = args as { where: { slug: string }; create: { name: string; nameEn?: string; isCurated?: boolean } };
      return {
        id: 99,
        slug: a.where.slug,
        name: a.create.name,
        nameEn: a.create.nameEn || a.create.name,
        country: "RU",
        region: null,
        latitude: 55.0,
        longitude: 37.0,
        timezone: "Europe/Moscow",
        population: 1000,
        tier: 2,
        isCurated: a.create.isCurated ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }) as unknown as typeof prisma.city.upsert);

    const result = await upsertCityFromGeo({
      slug: "small-village",
      name: "Деревня",
      country: "RU",
      latitude: 55.0,
      longitude: 37.0,
    });

    expect(prisma.city.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "small-village" },
        update: expect.objectContaining({
          isCurated: false,
        }),
        create: expect.objectContaining({
          isCurated: false,
        }),
      })
    );

    expect(result.isCurated).toBe(false);
  });

  it("upserts non-Russian cities with actual country code and isCurated: false", async () => {
    vi.clearAllMocks();
    vi.mocked(prisma.city.findUnique).mockResolvedValueOnce(null);

    vi.mocked(prisma.city.upsert).mockImplementationOnce((async (args: unknown) => {
      const a = args as { where: { slug: string }; create: { name: string; country: string; isCurated?: boolean } };
      return {
        id: 101,
        slug: a.where.slug,
        name: a.create.name,
        nameEn: a.create.name,
        country: a.create.country,
        region: null,
        latitude: 51.50,
        longitude: -0.12,
        timezone: "Europe/London",
        population: 8900000,
        tier: 2,
        isCurated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }) as unknown as typeof prisma.city.upsert);

    const result = await upsertCityFromGeo({
      slug: "london",
      name: "Лондон",
      country: "GB",
      latitude: 51.50,
      longitude: -0.12,
      timezone: "Europe/London",
    });

    expect(prisma.city.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "london" },
        create: expect.objectContaining({
          country: "GB",
          isCurated: false,
        }),
      })
    );
    expect(result.country).toBe("GB");
    expect(result.isCurated).toBe(false);
  });
});

describe("getBatchCachedWeather - cache expiry filtering", () => {
  it("filters query by expiresAt > now and excludes expired cache rows from result", async () => {
    vi.clearAllMocks();

    const mockCity1 = mockCity({
      id: 1,
      slug: "moscow",
      name: "Москва",
      latitude: 55.75,
      longitude: 37.61,
    });

    const mockCity2 = mockCity({
      id: 2,
      slug: "saint-petersburg",
      name: "Санкт-Петербург",
      latitude: 59.93,
      longitude: 30.31,
    });

    const mockBundle1 = mockWeatherBundle();
    const mockRow1 = mockWeatherCacheRow({
      id: "cache-1",
      cityId: 1,
      payload: mockBundle1 as unknown as Prisma.JsonValue,
      expiresAt: new Date(Date.now() + 3600000),
    });

    vi.mocked(prisma.weatherCache.findMany).mockResolvedValueOnce([mockRow1]);

    const result = await getBatchCachedWeather([mockCity1, mockCity2]);

    expect(prisma.weatherCache.findMany).toHaveBeenCalledWith({
      where: {
        cityId: { in: [1, 2] },
        expiresAt: { gt: expect.any(Date) },
      },
    });

    expect(result[1]).toEqual(mockBundle1);
    expect(result[2]).toBeUndefined();
  });
});

