import { describe, it, expect, vi } from "vitest";
import { upsertCityFromGeo, getBatchCachedWeather } from "../cache";
import { prisma } from "@/lib/prisma";

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

  it("never persists search results with empty/missing country as RU cities", async () => {
    vi.clearAllMocks();

    const resultWithEmpty = await upsertCityFromGeo({
      slug: "foreign-city",
      name: "Foreign City",
      country: "",
      latitude: 48.85,
      longitude: 2.35,
    });

    const resultWithUndefined = await upsertCityFromGeo({
      slug: "unknown-city",
      name: "Unknown City",
      country: undefined,
      latitude: 48.85,
      longitude: 2.35,
    });

    expect(prisma.city.findUnique).not.toHaveBeenCalled();
    expect(prisma.city.upsert).not.toHaveBeenCalled();
    expect(resultWithEmpty.id).toBeLessThan(0);
    expect(resultWithEmpty.isCurated).toBe(false);
    expect(resultWithUndefined.id).toBeLessThan(0);
    expect(resultWithUndefined.isCurated).toBe(false);
  });
});

describe("getBatchCachedWeather - cache expiry filtering", () => {
  it("filters query by expiresAt > now and excludes expired cache rows from result", async () => {
    vi.clearAllMocks();

    const mockCity1 = {
      id: 1,
      slug: "moscow",
      name: "Москва",
      latitude: 55.75,
      longitude: 37.61,
    } as any;

    const mockCity2 = {
      id: 2,
      slug: "saint-petersburg",
      name: "Санкт-Петербург",
      latitude: 59.93,
      longitude: 30.31,
    } as any;

    const mockPayload1 = { current: { temperature: 20 } } as any;

    vi.mocked(prisma.weatherCache.findMany).mockResolvedValueOnce([
      {
        id: "cache-1",
        cityId: 1,
        payload: mockPayload1,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      },
    ] as any);

    const result = await getBatchCachedWeather([mockCity1, mockCity2]);

    expect(prisma.weatherCache.findMany).toHaveBeenCalledWith({
      where: {
        cityId: { in: [1, 2] },
        expiresAt: { gt: expect.any(Date) },
      },
    });

    expect(result[1]).toEqual(mockPayload1);
    expect(result[2]).toBeUndefined();
  });
});

