import { describe, it, expect } from "vitest";
import { resolveCity } from "@/lib/weather/city-page";
import { findCatalogCityBySlug } from "@/lib/weather/countries";

describe("Catalog City Resolution & Alias Support", () => {
  it("resolves catalog city by full slug or short slug or alternate spelling", async () => {
    const catalogMatch = findCatalogCityBySlug("feisalabad");
    expect(catalogMatch).toBeDefined();
    expect(catalogMatch?.name).toBe("Фейсалабад");

    const resolvedFeisalabad = await resolveCity("feisalabad");
    expect(resolvedFeisalabad).toBeDefined();
    expect(resolvedFeisalabad?.name).toBe("Фейсалабад");

    const resolvedFaisalabad = await resolveCity("faisalabad");
    expect(resolvedFaisalabad).toBeDefined();
    expect(resolvedFaisalabad?.name).toBe("Фейсалабад");

    const resolvedWeatherFeisalabad = await resolveCity("weather-feisalabad");
    expect(resolvedWeatherFeisalabad).toBeDefined();
    expect(resolvedWeatherFeisalabad?.name).toBe("Фейсалабад");

    const resolvedKarachi = await resolveCity("karachi");
    expect(resolvedKarachi).toBeDefined();
    expect(resolvedKarachi?.name).toBe("Карачи");

    const resolvedIstanbul = await resolveCity("istanbul");
    expect(resolvedIstanbul).toBeDefined();
    expect(resolvedIstanbul?.name).toBe("Стамбул");

    const resolvedDubai = await resolveCity("dubai");
    expect(resolvedDubai).toBeDefined();
    expect(resolvedDubai?.name).toBe("Дубай");
  });
});
