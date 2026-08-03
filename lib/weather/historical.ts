export type HistoricalDailyPoint = {
  date: string; // "YYYY-MM-DD"
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
};

export type YearsAgoComparison = {
  yearsAgo: number;
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
};

export type ClimateNormal = {
  month: number; // 1-12
  avgTempMax: number;
  avgTempMin: number;
  recordTempMax: number;
  recordTempMaxYear: number;
  recordTempMin: number;
  recordTempMinYear: number;
  yearsOfData: number;
};

export type AnomalyResult = {
  diffFromNormalMax: number; // rounded to 1 decimal
  direction: "warmer" | "colder" | "normal";
};

type OpenMeteoArchiveResponse = {
  daily?: {
    time?: string[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_sum?: (number | null)[];
  };
};

function num(value: number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Fetches 10-year historical weather data from Open-Meteo Archive API.
 * Uses 30-day revalidation TTL because past weather history is immutable once recorded.
 */
export async function fetchHistoricalRange(
  latitude: number,
  longitude: number,
): Promise<HistoricalDailyPoint[]> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = currentYear - 10;
  const startDate = `${startYear}-01-01`;

  // Historical archive lags by a few days — use yesterday as end date to prevent 400 errors
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endDate = formatDateISO(yesterday);

  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_sum",
  );
  url.searchParams.set("timezone", "auto");

  // Historical archive data never changes — 30-day Next.js fetch revalidation TTL
  const res = await fetch(url.toString(), {
    next: { revalidate: 30 * 24 * 60 * 60 },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo Archive fetch failed with status ${res.status}`);
  }

  const data = (await res.json()) as OpenMeteoArchiveResponse;
  const daily = data.daily;
  if (!daily?.time || daily.time.length === 0) {
    return [];
  }

  const result: HistoricalDailyPoint[] = [];
  for (let i = 0; i < daily.time.length; i++) {
    result.push({
      date: daily.time[i],
      tempMax: num(daily.temperature_2m_max?.[i]),
      tempMin: num(daily.temperature_2m_min?.[i]),
      precipitationSum: num(daily.precipitation_sum?.[i]),
    });
  }

  return result;
}

export function getYearsAgoComparison(
  history: HistoricalDailyPoint[],
  targetDate: string,
  yearsAgo: number,
): YearsAgoComparison | null {
  if (!history || history.length === 0) return null;

  const [yyyy, mm, dd] = targetDate.split("-");
  if (!yyyy || !mm || !dd) return null;

  const targetYear = Number(yyyy);
  const pastYear = targetYear - yearsAgo;

  let pastDay = dd;
  if (mm === "02" && dd === "29" && !isLeapYear(pastYear)) {
    pastDay = "28";
  }

  const searchDate = `${pastYear}-${mm}-${pastDay}`;
  const point = history.find((p) => p.date === searchDate);
  if (!point) return null;

  return {
    yearsAgo,
    date: point.date,
    tempMax: point.tempMax,
    tempMin: point.tempMin,
    precipitationSum: point.precipitationSum,
  };
}

export function getClimateNormal(
  history: HistoricalDailyPoint[],
  month: number,
): ClimateNormal {
  const filtered = history.filter((p) => {
    const parts = p.date.split("-");
    return Number(parts[1]) === month;
  });

  if (filtered.length === 0) {
    const currentYear = new Date().getFullYear();
    return {
      month,
      avgTempMax: 0,
      avgTempMin: 0,
      recordTempMax: 0,
      recordTempMaxYear: currentYear,
      recordTempMin: 0,
      recordTempMinYear: currentYear,
      yearsOfData: 0,
    };
  }

  const sumMax = filtered.reduce((acc, p) => acc + p.tempMax, 0);
  const sumMin = filtered.reduce((acc, p) => acc + p.tempMin, 0);

  const avgTempMax = Number((sumMax / filtered.length).toFixed(1));
  const avgTempMin = Number((sumMin / filtered.length).toFixed(1));

  let recordTempMax = filtered[0].tempMax;
  let recordTempMaxYear = Number(filtered[0].date.split("-")[0]);
  let recordTempMin = filtered[0].tempMin;
  let recordTempMinYear = Number(filtered[0].date.split("-")[0]);

  for (const p of filtered) {
    const year = Number(p.date.split("-")[0]);
    if (p.tempMax > recordTempMax) {
      recordTempMax = p.tempMax;
      recordTempMaxYear = year;
    }
    if (p.tempMin < recordTempMin) {
      recordTempMin = p.tempMin;
      recordTempMinYear = year;
    }
  }

  const yearsSet = new Set(filtered.map((p) => p.date.split("-")[0]));

  return {
    month,
    avgTempMax,
    avgTempMin,
    recordTempMax,
    recordTempMaxYear,
    recordTempMin,
    recordTempMinYear,
    yearsOfData: yearsSet.size,
  };
}

export function getAnomaly(
  todayTempMax: number,
  normal: ClimateNormal,
): AnomalyResult {
  const diffFromNormalMax = Number(
    (todayTempMax - normal.avgTempMax).toFixed(1),
  );
  let direction: "warmer" | "colder" | "normal" = "normal";

  if (diffFromNormalMax > 1) {
    direction = "warmer";
  } else if (diffFromNormalMax < -1) {
    direction = "colder";
  }

  return {
    diffFromNormalMax,
    direction,
  };
}
