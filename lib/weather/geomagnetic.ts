export type GeomagneticSeverity = "calm" | "minor" | "storm" | "severe";

export type GeomagneticData = {
  kp: number;
  kpDisplay: string;
  label: string;
  severity: GeomagneticSeverity;
  isElevated: boolean;
  timeTag: string;
};

type NoaaKpEntry = {
  time_tag: string;
  Kp: number | string;
};

const NOAA_KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

export async function fetchGeomagneticData(): Promise<GeomagneticData | null> {
  try {
    const res = await fetch(NOAA_KP_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as NoaaKpEntry[];
    if (!Array.isArray(data) || data.length === 0) return null;

    const latest = data[data.length - 1];
    if (!latest || latest.Kp == null) return null;

    const rawKp = typeof latest.Kp === "number" ? latest.Kp : parseFloat(latest.Kp);
    if (isNaN(rawKp)) return null;

    const kp = Math.round(rawKp * 10) / 10;
    const roundedInt = Math.round(rawKp);

    let label: string;
    let severity: GeomagneticSeverity;

    if (roundedInt <= 2) {
      label = "Спокойно";
      severity = "calm";
    } else if (roundedInt <= 4) {
      label = "Слабые возмущения";
      severity = "minor";
    } else if (roundedInt <= 6) {
      label = "Магнитная буря";
      severity = "storm";
    } else {
      label = "Сильная магнитная буря";
      severity = "severe";
    }

    return {
      kp,
      kpDisplay: kp.toFixed(1),
      label,
      severity,
      isElevated: roundedInt >= 5,
      timeTag: latest.time_tag ?? "",
    };
  } catch {
    return null;
  }
}
