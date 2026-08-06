"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { HourlyPoint } from "@/types/weather";

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const tempData = payload.find((p) => p.dataKey === "temp");
  const feelsLikeData = payload.find((p) => p.dataKey === "feelsLike");
  const precipData = payload.find((p) => p.dataKey === "precip");

  return (
    <div className="rounded-xl border border-sky-100 bg-white/95 p-3 shadow-lg backdrop-blur text-xs">
      <p className="font-semibold text-sky-950">{label}</p>
      <div className="mt-1.5 space-y-1">
        {tempData && (
          <p className="flex items-center justify-between gap-4 font-medium text-sky-900">
            <span>Температура:</span>
            <span className="tabular-nums font-bold">
              {tempData.value > 0 ? `+${tempData.value}` : tempData.value}°C
            </span>
          </p>
        )}
        {feelsLikeData && (
          <p className="flex items-center justify-between gap-4 text-cloud-600">
            <span>Ощущается:</span>
            <span className="tabular-nums font-semibold">
              {feelsLikeData.value > 0
                ? `+${feelsLikeData.value}`
                : feelsLikeData.value}
              °C
            </span>
          </p>
        )}
        {precipData && precipData.value > 0 && (
          <p className="flex items-center justify-between gap-4 text-sky-700">
            <span>Осадки:</span>
            <span className="tabular-nums font-semibold">
              {precipData.value.toFixed(1)} мм
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export function HourlyChart({ hours }: { hours: HourlyPoint[] }) {
  if (!hours || hours.length === 0) return null;

  // Take next 24 hours
  const data = hours.slice(0, 24).map((h) => {
    const dateObj = new Date(h.time);
    const timeLabel = dateObj.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      timeLabel,
      temp: Math.round(h.temperature),
      feelsLike:
        typeof h.feelsLike === "number"
          ? Math.round(h.feelsLike)
          : Math.round(h.temperature),
      precip: h.precipitation ?? 0,
    };
  });

  return (
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-h2 font-semibold text-sky-950">
          График на 24 часа
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-cloud-600">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded bg-[#006bc8]" />
            Температура
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded border-b border-dashed border-[#7cc2fd]" />
            Ощущается
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#a8b7c5]/60" />
            Осадки (мм)
          </span>
        </div>
      </div>

      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e0effe"
            />
            <XAxis
              dataKey="timeLabel"
              tick={{ fontSize: 11, fill: "#748294" }}
              tickLine={false}
              axisLine={{ stroke: "#e0effe" }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              yAxisId="temp"
              tick={{ fontSize: 11, fill: "#748294" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°`}
            />
            <YAxis
              yAxisId="precip"
              orientation="right"
              domain={[0, (dataMax: number) => Math.max(5, dataMax * 1.5)]}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="precip"
              dataKey="precip"
              fill="#a8b7c5"
              fillOpacity={0.4}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="feelsLike"
              stroke="#7cc2fd"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: "#7cc2fd" }}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#006bc8"
              strokeWidth={3}
              dot={{ r: 3, fill: "#006bc8", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#006bc8" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
