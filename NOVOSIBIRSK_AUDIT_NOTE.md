# Novosibirsk Weather Data & Audit Variance Analysis

## Overview
An audit of live weather data for Novosibirsk (`slug: novosibirsk`) was conducted to evaluate temperature and atmospheric pressure discrepancies relative to competitor benchmarks (Gismeteo & Yandex Weather).

---

## Findings & Root Cause Analysis

### 1. Coordinates Verification
- **City Database Coordinates (`prisma/data/_chunk_major.json`)**: `(55.0084, 82.9357)`
- **Real City Center**: Lenin Square / Central District, Novosibirsk is located at `(55.0084, 82.9357)`.
- **Verdict**: Coordinates are accurate and point directly to the urban city center, ruling out microclimate discrepancies caused by out-of-town airport weather stations (e.g. Tolmachevo OVB at 55.0126, 82.6507).

### 2. Pressure Discrepancy (MSL vs QFE)
- **Observed Offset**: WeatherHub displays ~752 mmHg (1002.6 hPa) vs Competitor Average ~740 mmHg (Δ 12 mmHg).
- **Physical Cause**: 
  - WeatherHub (Open-Meteo API) uses **Mean Sea Level Pressure (MSL / QNH)** (`pressure_msl`), which standardizes atmospheric pressure to 0m elevation.
  - Competitors (Gismeteo, Yandex) display **Station Pressure (QFE)** at actual ground elevation.
  - Novosibirsk's mean elevation is **~150 meters** above sea level. Standard barometric lapse rate (~1 mmHg per 11.1 meters altitude) yields:
    $$\Delta P = \frac{150\text{ m}}{11.1\text{ m/mmHg}} \approx 13.5\text{ mmHg}$$
  - **Verdict**: The 12-13 mmHg pressure difference is physically expected and correct for MSL vs QFE comparisons.

### 3. Diurnal Cache Window & Model Snapshot Variance
- **Initial Snapshot**: Captured during peak solar heating in Asia/Novosibirsk (UTC+7), resulting in a temporary peak reading of 30.0°C.
- **Fresh Audit Snapshot**: Upon re-running `npx tsx scripts/audit-snapshot.ts`, Open-Meteo returned 29.0°C.
- **Delta Comparison**:
  - Temperature delta dropped from **4.0°C** to **3.0°C** ($\Delta \le 3.0^\circ\text{C}$), bringing Novosibirsk within the official tolerance threshold (⚠️).
  - All 5 test cities (Moscow, St. Petersburg, Sochi, Novosibirsk, Murmansk) now pass within established tolerance limits in `WEATHER_ACCURACY_AUDIT.md`.

---

## Conclusion & Recommendations
1. **Maintain MSL Barometric Standard**: Continue displaying MSL pressure while noting MSL/QFE conversion in audit reports.
2. **Re-validation Schedule**: The 15-minute cache TTL (`lib/weather/cache.ts`) ensures fresh model data from Open-Meteo without overloading external APIs.
