export function MoonPhaseIcon({
  illumination,
  waxing,
  size = 40,
}: {
  illumination: number; // 0..100
  waxing: boolean; // phaseValue < 0.5
  size?: number;
}) {
  const f = Math.max(0, Math.min(1, illumination / 100));

  if (f <= 0.01) {
    // New Moon
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label="Новолуние"
      >
        <circle cx="20" cy="20" r="16" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      </svg>
    );
  }

  if (f >= 0.99) {
    // Full Moon
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label="Полнолуние"
      >
        <circle cx="20" cy="20" r="16" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
      </svg>
    );
  }

  // Intermediate phase: compute continuous crescent/gibbous path
  const rx = Math.abs(16 * (1 - 2 * f));
  const sweep = f < 0.5 ? 0 : 1;
  const pathD = `M 20 4 A 16 16 0 0 1 20 36 A ${rx.toFixed(2)} 16 0 0 ${sweep} 20 4 Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={`Фаза луны (${Math.round(illumination)}%)`}
    >
      {/* Dark background circle */}
      <circle cx="20" cy="20" r="16" fill="#1e293b" stroke="#334155" strokeWidth="1" />

      {/* Illuminated phase shape */}
      <g
        transform={!waxing ? "scale(-1, 1)" : undefined}
        style={{ transformOrigin: "20px 20px" }}
      >
        <path d={pathD} fill="#fef3c7" stroke="#fde68a" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
