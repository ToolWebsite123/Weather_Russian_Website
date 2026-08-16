import { describe, it, expect, vi } from "vitest";
import { searchPlaces } from "../open-meteo";
import { resolveCity } from "../city-page";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    city: {
      findUnique: vi.fn().mockImplementation(({ where }: { where: { slug: string } }) => {
        if (where.slug === "paris") return Promise.resolve({ id: 901, slug: "paris", name: "Париж", country: "FR", isCurated: true });
        if (where.slug === "tokyo") return Promise.resolve({ id: 902, slug: "tokyo", name: "Токио", country: "JP", isCurated: true });
        return Promise.resolve(null);
      }),
      upsert: vi.fn().mockImplementation(({ create }: { create: Record<string, unknown> }) => Promise.resolve({ id: 999, ...create })),
    },
  },
}));

describe("Global Cities Search & Resolution", () => {
  it("searches and returns global cities correctly (Paris, Tokyo, New York, Dubai, Istanbul)", async () => {
    const paris = await searchPlaces("Paris", "ru");
    expect(paris.length).toBeGreaterThan(0);
    expect(paris[0].country).toBe("FR");
    expect(paris[0].countryNameRu).toBe("Франция");

    const tokyo = await searchPlaces("Токио", "ru");
    expect(tokyo.length).toBeGreaterThan(0);
    expect(tokyo[0].country).toBe("JP");
    expect(tokyo[0].countryNameRu).toBe("Япония");

    const ny = await searchPlaces("New York", "ru");
    expect(ny.length).toBeGreaterThan(0);
    expect(ny[0].country).toBe("US");
    expect(ny[0].countryNameRu).toBe("США");

    const dubai = await searchPlaces("Дубай", "ru");
    expect(dubai.length).toBeGreaterThan(0);
    expect(dubai[0].country).toBe("AE");
    expect(dubai[0].countryNameRu).toBe("ОАЭ");
  }, 30000);

  it("resolves global cities dynamically via resolveCity", async () => {
    const parisCity = await resolveCity("paris");
    expect(parisCity).not.toBeNull();
    expect(parisCity?.country).toBe("FR");

    const tokyoCity = await resolveCity("tokyo");
    expect(tokyoCity).not.toBeNull();
    expect(tokyoCity?.country).toBe("JP");
  }, 30000);
});
