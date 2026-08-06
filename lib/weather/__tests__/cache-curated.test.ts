import { describe, it, expect, vi } from "vitest";
import { upsertCityFromGeo } from "../cache";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    city: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
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

    vi.mocked(prisma.city.upsert).mockImplementationOnce((async (args: any) => {
      return {
        id: 10,
        slug: args.where.slug,
        name: args.update.name as string,
        nameEn: (args.update.nameEn as string) || (args.update.name as string),
        country: "RU",
        region: null,
        latitude: 55.75,
        longitude: 37.61,
        timezone: "Europe/Moscow",
        population: 12653744,
        tier: 1,
        isCurated: args.update.isCurated as boolean,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }) as any);

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

    vi.mocked(prisma.city.upsert).mockImplementationOnce((async (args: any) => {
      return {
        id: 99,
        slug: args.where.slug,
        name: args.create.name as string,
        nameEn: (args.create.nameEn as string) || (args.create.name as string),
        country: "RU",
        region: null,
        latitude: 55.0,
        longitude: 37.0,
        timezone: "Europe/Moscow",
        population: 1000,
        tier: 2,
        isCurated: args.create.isCurated as boolean,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }) as any);

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
