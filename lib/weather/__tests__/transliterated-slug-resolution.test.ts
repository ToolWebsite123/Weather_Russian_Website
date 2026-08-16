import { describe, expect, it } from "vitest";
import { latinToCyrillicRu } from "@/lib/cities";
import { searchPlaces } from "@/lib/weather/open-meteo";

describe("Transliterated Slug & City Resolution", () => {
  it("converts Latin transliterated names to Cyrillic", () => {
    expect(latinToCyrillicRu("nyachang")).toBe("нячанг");
    expect(latinToCyrillicRu("moskva")).toBe("москва");
    expect(latinToCyrillicRu("pattaya")).toBe("паттайя");
    expect(latinToCyrillicRu("fukuok")).toBe("фукуок");
    expect(latinToCyrillicRu("novosibirsk")).toBe("новосибирск");
  });

  it("finds foreign cities via searchPlaces with Latin queries", async () => {
    const results = await searchPlaces("nyachang", "ru");
    expect(results.length).toBeGreaterThan(0);
    const topMatch = results[0];
    expect(topMatch.name).toMatch(/Нячанг|Nha Trang/i);
  });
});
