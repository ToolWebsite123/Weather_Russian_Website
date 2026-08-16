import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reverseGeocodeCoords } from "@/lib/weather/geo-resolver";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    city: {
      findMany: vi.fn(),
    },
  },
}));

describe("Nearest City Geolocation Fallback", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Nominatim fetch to simulate API failure/timeout
    global.fetch = vi.fn().mockRejectedValue(new Error("Nominatim API timeout"));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("resolves coordinates near Vladivostok (Far East) to Vladivostok, not a Moscow region city", async () => {
    vi.mocked(prisma.city.findMany).mockResolvedValueOnce([
      {
        id: 1,
        slug: "moscow",
        name: "Москва",
        nameEn: "Moscow",
        country: "RU",
        region: "Московская область",
        latitude: 55.7558,
        longitude: 37.6173,
        timezone: "Europe/Moscow",
        population: 12653744,
        tier: 1,
        isCurated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        slug: "vladivostok",
        name: "Владивосток",
        nameEn: "Vladivostok",
        country: "RU",
        region: "Приморский край",
        latitude: 43.1155,
        longitude: 131.8855,
        timezone: "Asia/Vladivostok",
        population: 603519,
        tier: 1,
        isCurated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Coordinates near Vladivostok (43.1155, 131.8855)
    const result = await reverseGeocodeCoords(43.1155, 131.8855);

    expect(result).not.toBeNull();
    expect(result?.nameEn).toMatch(/Vladivostok|vladivostok/i);
    expect(result?.name).not.toMatch(/Москва|Moscow|Санкт-Петербург|St\. Petersburg/i);
  });
});
