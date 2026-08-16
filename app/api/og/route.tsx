import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { getCityLocative } from "@/lib/i18n/declension";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, { maxRequests: 20, windowMs: 60 * 1000 });
  if (!rateLimit.success) return rateLimitResponse();

  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "Москва";
  const temp = searchParams.get("temp") || "+18°C";
  const cond = searchParams.get("cond") || "Ясно";
  const locative = getCityLocative(city);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0284c7 0%, #0f3d3a 100%)",
          padding: "60px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ☀️
          </div>
          <span style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "-1px" }}>
            WeatherHub
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "64px", fontWeight: "bold" }}>
            Погода {locative}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <span style={{ fontSize: "72px", fontWeight: "extrabold", color: "#edf4a1" }}>
              {temp}
            </span>
            <span style={{ fontSize: "36px", color: "#e0f2fe" }}>{cond}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            fontSize: "20px",
            color: "#bcd8d4",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: "24px",
          }}
        >
          <span>Точный прогноз погоды без рекламного шума</span>
          <span>weatherhub.ru</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
