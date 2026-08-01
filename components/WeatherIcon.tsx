import { weatherCodeLabel } from "@/lib/weather/wmo";

type IconProps = {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
};

function iconKind(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "clear" : "clear-night";
  if (code <= 2) return isDay ? "partly" : "cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "storm";
  return "partly";
}

export function WeatherIcon({
  code,
  isDay = true,
  className = "",
  size = 48,
}: IconProps) {
  const kind = iconKind(code, isDay);
  const label = weatherCodeLabel(code);
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    className,
    role: "img" as const,
    "aria-label": label,
  };

  switch (kind) {
    case "clear":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="14" fill="#F98507" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="32"
              y1="8"
              x2="32"
              y2="14"
              stroke="#F98507"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${deg} 32 32)`}
            />
          ))}
        </svg>
      );
    case "clear-night":
      return (
        <svg {...common}>
          <path
            d="M40 12a18 18 0 1 0 10 32 22 22 0 1 1-10-32z"
            fill="#0155a2"
          />
        </svg>
      );
    case "partly":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="10" fill="#F98507" />
          <ellipse cx="38" cy="40" rx="16" ry="10" fill="#919eae" />
          <ellipse cx="28" cy="38" rx="12" ry="9" fill="#b8c0cb" />
        </svg>
      );
    case "cloudy":
      return (
        <svg {...common}>
          <ellipse cx="34" cy="36" rx="18" ry="12" fill="#748294" />
          <ellipse cx="24" cy="34" rx="14" ry="10" fill="#919eae" />
        </svg>
      );
    case "fog":
      return (
        <svg {...common}>
          <path
            d="M12 28h40M10 36h44M14 44h36"
            stroke="#919eae"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <ellipse cx="34" cy="26" rx="16" ry="10" fill="#748294" />
          <ellipse cx="24" cy="24" rx="12" ry="9" fill="#919eae" />
          <path
            d="M22 40l-2 8M32 38l-2 10M42 40l-2 8"
            stroke="#0c87ea"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <ellipse cx="34" cy="26" rx="16" ry="10" fill="#748294" />
          <ellipse cx="24" cy="24" rx="12" ry="9" fill="#b8c0cb" />
          <circle cx="22" cy="42" r="2.5" fill="#36a3f9" />
          <circle cx="32" cy="46" r="2.5" fill="#36a3f9" />
          <circle cx="42" cy="42" r="2.5" fill="#36a3f9" />
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <ellipse cx="34" cy="24" rx="16" ry="10" fill="#4d5765" />
          <ellipse cx="24" cy="22" rx="12" ry="9" fill="#5e6b7c" />
          <path d="M30 34l-6 12h6l-4 12 14-16h-8l6-8z" fill="#F98507" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="12" fill="#36a3f9" />
        </svg>
      );
  }
}
