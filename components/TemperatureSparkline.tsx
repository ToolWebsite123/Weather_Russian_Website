import type { HourlyPoint } from "@/types/weather";
import { getSparklineCoords } from "@/lib/weather/sparkline";

export function TemperatureSparkline({
  hourly,
  currentTime,
  width = 96,
  height = 28,
  className = "",
}: {
  hourly?: HourlyPoint[];
  currentTime?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (!hourly || hourly.length === 0) return null;

  const pointsData = hourly.slice(0, 24);
  if (pointsData.length === 0) return null;

  const { coords, pathD, minTemp, maxTemp, isFlat } = getSparklineCoords(
    pointsData,
    width,
    height,
  );

  let currentPoint = coords[0];
  if (currentTime) {
    const found = coords.find((c) => c.time === currentTime);
    if (found) currentPoint = found;
  }

  const titleText = isFlat
    ? `24ч тренд: стабильно ${Math.round(minTemp)}°`
    : `24ч тренд: от ${minTemp > 0 ? "+" : ""}${Math.round(minTemp)}° до ${maxTemp > 0 ? "+" : ""}${Math.round(maxTemp)}°`;

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      title={titleText}
      aria-label={titleText}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible shrink-0"
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-sky-500"
        />

        <circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={3}
          className="fill-sky-700 stroke-white stroke-1"
        />
      </svg>
    </div>
  );
}
