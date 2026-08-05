# Competitor Audit Benchmarks Refresh Guide

This document defines the structure and refresh process for competitor benchmark data in `scripts/audit-competitors.json`.

---

## Overview

The automated weather accuracy pipeline (`scripts/audit-snapshot.ts` and `scripts/generate-audit-report.ts`) compares live WeatherHub data (Open-Meteo API) against benchmark readings from two major Russian meteorological providers:
1. **Gismeteo** (`gismeteo.ru`)
2. **Yandex Weather** (`yandex.ru/pogoda`)

Audited test cities represent 5 diverse climate zones:
- **Moscow** (`moscow`)
- **St. Petersburg** (`saint-petersburg`)
- **Sochi** (`sochi`)
- **Novosibirsk** (`novosibirsk`)
- **Murmansk** (`murmansk`)

---

## Refresh Cadence & Guidelines

### Recommended Cadence
- **Bi-weekly / Monthly**: Update competitor benchmark readings periodically or when auditing accuracy after major provider model upgrades.
- **On-Demand**: Update benchmark readings whenever running an accuracy audit for a specific time snapshot.

### Data Structure (`scripts/audit-competitors.json`)
Each city record in `scripts/audit-competitors.json` contains:
```json
{
  "timestamp": "2026-08-04T08:54:30Z",
  "competitors": {
    "moscow": {
      "gismeteo": {
        "url": "https://www.gismeteo.ru/weather-moscow-4368/now/",
        "temperature": "24°C–26°C",
        "tempNum": 25.0,
        "feelsLike": "25°C",
        "feelsLikeNum": 25.0,
        "windSpeed": "1.0 m/s",
        "windNum": 1.0,
        "humidity": "55%",
        "humidityNum": 55,
        "pressure": "758 mmHg",
        "pressureNum": 758,
        "condition": "Безоблачно",
        "sunrise": "04:38",
        "sunset": "20:32"
      },
      "yandex": {
        "url": "https://yandex.ru/pogoda/ru/moscow",
        "temperature": "24°C–26°C",
        "tempNum": 25.0,
        "feelsLike": "25°C",
        "feelsLikeNum": 25.0,
        "windSpeed": "1.8 m/s",
        "windNum": 1.8,
        "humidity": "59%",
        "humidityNum": 59,
        "pressure": "750 mmHg",
        "pressureNum": 750,
        "condition": "Облачно с прояснениями",
        "sunrise": "04:39",
        "sunset": "20:31"
      }
    }
  }
}
```

---

## Refresh Process

1. Open the benchmark URLs for each city:
   - **Moscow**: [Gismeteo Moscow](https://www.gismeteo.ru/weather-moscow-4368/now/) | [Yandex Moscow](https://yandex.ru/pogoda/ru/moscow)
   - **St. Petersburg**: [Gismeteo SPb](https://www.gismeteo.ru/weather-sankt-peterburg-4079/now/) | [Yandex SPb](https://yandex.ru/pogoda/ru/saint-petersburg)
   - **Sochi**: [Gismeteo Sochi](https://www.gismeteo.ru/weather-sochi-5233/now/) | [Yandex Sochi](https://yandex.ru/pogoda/ru/sochi)
   - **Novosibirsk**: [Gismeteo Novosibirsk](https://www.gismeteo.ru/weather-novosibirsk-4690/now/) | [Yandex Novosibirsk](https://yandex.ru/pogoda/ru/novosibirsk)
   - **Murmansk**: [Gismeteo Murmansk](https://www.gismeteo.ru/weather-murmansk-3903/now/) | [Yandex Murmansk](https://yandex.ru/pogoda/ru/murmansk)

2. Note the numerical values for:
   - Temperature (°C)
   - Feels-like Temperature (°C)
   - Wind Speed (m/s)
   - Relative Humidity (%)
   - Pressure (mmHg)
   - Weather condition description
   - Sunrise and Sunset local times (HH:MM)

3. Update `scripts/audit-competitors.json` and set `"timestamp"` to current UTC ISO timestamp.

4. Run the automated audit pipeline:
   ```bash
   npx tsx scripts/audit-snapshot.ts
   npx tsx scripts/generate-audit-report.ts
   ```
