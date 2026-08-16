import { describe, it, expect } from "vitest";
import { findStaticCityBySlug, getAllStaticCities } from "../static-cities";
import { getCityTimezone } from "@/lib/cities";

describe("City Timezone Resolution", () => {
  it("resolves correct regional timezones for major Russian cities", () => {
    expect(getCityTimezone("Владивосток", "Приморский край", 131.88)).toBe("Asia/Vladivostok");
    expect(getCityTimezone("Новосибирск", "Новосибирская область", 82.93)).toBe("Asia/Novosibirsk");
    expect(getCityTimezone("Екатеринбург", "Свердловская область", 60.6)).toBe("Asia/Yekaterinburg");
    expect(getCityTimezone("Москва", "Москва", 37.61)).toBe("Europe/Moscow");
    expect(getCityTimezone("Калининград", "Калининградская область", 20.45)).toBe("Europe/Kaliningrad");
    expect(getCityTimezone("Самара", "Самарская область", 50.1)).toBe("Europe/Samara");
    expect(getCityTimezone("Иркутск", "Иркутская область", 104.3)).toBe("Asia/Irkutsk");
  });

  it("assigns non-hardcoded correct timezones in static cities dataset", () => {
    const vladivostok = findStaticCityBySlug("vladivostok");
    expect(vladivostok?.timezone).toBe("Asia/Vladivostok");

    const novosibirsk = findStaticCityBySlug("novosibirsk");
    expect(novosibirsk?.timezone).toBe("Asia/Novosibirsk");

    const yekaterinburg = findStaticCityBySlug("yekaterinburg");
    expect(yekaterinburg?.timezone).toBe("Asia/Yekaterinburg");

    const moscow = findStaticCityBySlug("moscow");
    expect(moscow?.timezone).toBe("Europe/Moscow");

    const all = getAllStaticCities();
    expect(all.length).toBe(272);
    const nonMoscowCount = all.filter((c) => c.timezone !== "Europe/Moscow").length;
    expect(nonMoscowCount).toBeGreaterThan(90);
  });
});
