import { reportError } from "@/lib/monitoring";

export type GeomagneticSeverity = "calm" | "minor" | "storm" | "severe";

export type GeomagneticInterval = {
  time: string;
  val: number;
};

export type GeomagneticData = {
  kp: number;
  kpDisplay: string;
  label: string;
  severity: GeomagneticSeverity;
  isElevated: boolean;
  timeTag: string;
  intervals: GeomagneticInterval[];
  isEstimated?: boolean;
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

    if (!res.ok) {
      reportError(new Error(`NOAA SWPC HTTP error ${res.status}`), { service: "fetchGeomagneticData" });
      return null;
    }

    const data = (await res.json()) as NoaaKpEntry[];
    if (!Array.isArray(data) || data.length === 0) {
      reportError(new Error("NOAA SWPC empty payload"), { service: "fetchGeomagneticData" });
      return null;
    }

    const validEntries = data.filter(
      (e) => e && e.time_tag && e.Kp != null && !isNaN(typeof e.Kp === "number" ? e.Kp : parseFloat(e.Kp))
    );

    if (validEntries.length === 0) return null;

    const latest = validEntries[validEntries.length - 1];
    const rawKp = typeof latest.Kp === "number" ? latest.Kp : parseFloat(latest.Kp);
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

    // Extract recent 8 3-hourly intervals from NOAA real station readings
    const last8 = validEntries.slice(-8);
    const intervals: GeomagneticInterval[] = last8.map((e) => {
      const timeParts = e.time_tag.split("T");
      const timeStr = timeParts[1] ? timeParts[1].substring(0, 5) : "00:00";
      const valRaw = typeof e.Kp === "number" ? e.Kp : parseFloat(e.Kp);
      const val = Math.max(1, Math.min(9, Math.round(valRaw)));
      return { time: timeStr, val };
    });

    const isEstimated = intervals.length < 8;

    return {
      kp,
      kpDisplay: kp.toFixed(1),
      label,
      severity,
      isElevated: roundedInt >= 5,
      timeTag: latest.time_tag ?? "",
      intervals,
      isEstimated,
    };
  } catch (err) {
    reportError(err, { service: "fetchGeomagneticData" });
    return null;
  }
}
