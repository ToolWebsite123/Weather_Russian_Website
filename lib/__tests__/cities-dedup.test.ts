import { describe, it, expect } from "vitest";
import { buildCityRecords, EXPLICIT_SLUGS } from "@/lib/cities-data";
import { getAllStaticCities } from "@/lib/weather/static-cities";

describe("Cities Data Single Source of Truth", () => {
  it("buildCityRecords returns exactly 272 cities", () => {
    const records = buildCityRecords();
    expect(records.length).toBe(272);
  });

  it("getAllStaticCities returns exactly 272 cities matching buildCityRecords slugs", () => {
    const staticCities = getAllStaticCities();
    const records = buildCityRecords();

    expect(staticCities.length).toBe(272);
    expect(staticCities.map((c) => c.slug)).toEqual(records.map((r) => r.slug));
  });

  it("EXPLICIT_SLUGS map contains expected key major cities", () => {
    expect(EXPLICIT_SLUGS["Москва"]).toBe("moscow");
    expect(EXPLICIT_SLUGS["Санкт-Петербург"]).toBe("saint-petersburg");
    expect(EXPLICIT_SLUGS["Новосибирск"]).toBe("novosibirsk");
  });
});
