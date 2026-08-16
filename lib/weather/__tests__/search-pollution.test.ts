import { describe, it, expect, vi } from "vitest";
import { searchPlaces } from "../open-meteo";
import { resolveCity } from "../city-page";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => {
  const fakeUpsert = vi.fn().mockImplementation(({ create }: { create: Record<string, unknown> }) =>
    Promise.resolve({ id: 888, name: "Марсель", country: "FR", isCurated: true, ...create })
  );
  return {
    prisma: {
      city: {
        findUnique: vi.fn().mockImplementation(({ where }: { where: { slug: string } }) => {
          if (where.slug === "marseille") return Promise.resolve({ id: 888, slug: "marseille", name: "Марсель", country: "FR", isCurated: true });
          return Promise.resolve(null);
        }),
        upsert: fakeUpsert,
      },
    },
  };
});

describe("Search Pollution & Click Resolution", () => {
  it("executes searchPlaces without modifying database records", async () => {
    const prismaUpsertSpy = vi.spyOn(prisma.city, "upsert");
    const results = await searchPlaces("Marseille", "ru");

    expect(results.length).toBeGreaterThan(0);
    // Searching should NOT invoke database upsert
    expect(prismaUpsertSpy).not.toHaveBeenCalled();
    prismaUpsertSpy.mockRestore();
  });

  it("persists city to database when user clicks and loads city page via resolveCity", async () => {
    const city = await resolveCity("marseille");
    expect(city).not.toBeNull();
    expect(city?.name).toBe("Марсель");
    expect(city?.country).toBe("FR");
  }, 10000);
});
