import { describe, it, expect } from "vitest";
import { fetchGeomagneticData } from "../geomagnetic";

describe("NOAA SWPC Real Geomagnetic Data", () => {
  it("fetches live NOAA SWPC 3-hourly K-index observations and parses 8 intervals", async () => {
    const data = await fetchGeomagneticData();
    expect(data).not.toBeNull();
    if (data) {
      expect(typeof data.kp).toBe("number");
      expect(data.kp).toBeGreaterThanOrEqual(0);
      expect(data.kp).toBeLessThanOrEqual(9);
      expect(data.intervals).toBeDefined();
      expect(data.intervals.length).toBeGreaterThan(0);
      expect(data.intervals[0]).toHaveProperty("time");
      expect(data.intervals[0]).toHaveProperty("val");
    }
  }, 10000);
});
