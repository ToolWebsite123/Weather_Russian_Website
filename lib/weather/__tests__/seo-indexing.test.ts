import { describe, it, expect } from "vitest";
import { shouldIndexCity } from "@/lib/cities";

describe("SEO Indexation Logic (shouldIndexCity)", () => {
  it("returns true for curated static cities regardless of population", () => {
    expect(shouldIndexCity({ isCurated: true, population: 5000 })).toBe(true);
    expect(shouldIndexCity({ isCurated: true, population: null })).toBe(true);
  });

  it("returns true for dynamically resolved global cities with population >= 15,000", () => {
    // Major global hubs
    expect(shouldIndexCity({ isCurated: false, population: 2100000 })).toBe(true); // Paris
    expect(shouldIndexCity({ isCurated: false, population: 3300000 })).toBe(true); // Dubai
    expect(shouldIndexCity({ isCurated: false, population: 13900000 })).toBe(true); // Tokyo
    expect(shouldIndexCity({ isCurated: false, population: 15000 })).toBe(true); // Boundary
  });

  it("returns false for non-curated tiny villages/hamlets with population < 15,000", () => {
    expect(shouldIndexCity({ isCurated: false, population: 12000 })).toBe(false);
    expect(shouldIndexCity({ isCurated: false, population: 500 })).toBe(false);
    expect(shouldIndexCity({ isCurated: false, population: null })).toBe(false);
  });
});
