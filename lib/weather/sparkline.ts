import type { HourlyPoint } from "@/types/weather";

export type SparklinePoint = {
  x: number;
  y: number;
  time: string;
  temp: number;
};

export function getSparklineCoords(
  pointsData: HourlyPoint[],
  width = 96,
  height = 28,
): { coords: SparklinePoint[]; pathD: string; minTemp: number; maxTemp: number; isFlat: boolean } {
  if (!pointsData || pointsData.length === 0) {
    return { coords: [], pathD: "", minTemp: 0, maxTemp: 0, isFlat: true };
  }

  const temps = pointsData.map((p) => p.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp;

  const paddingX = 4;
  const paddingY = 4;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const coords: SparklinePoint[] = pointsData.map((pt, i) => {
    const x =
      pointsData.length > 1
        ? paddingX + (i / (pointsData.length - 1)) * usableWidth
        : width / 2;

    const y =
      tempRange === 0
        ? height / 2
        : height - paddingY - ((pt.temperature - minTemp) / tempRange) * usableHeight;

    return { x, y, time: pt.time, temp: pt.temperature };
  });

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  return { coords, pathD, minTemp, maxTemp, isFlat: tempRange === 0 };
}
