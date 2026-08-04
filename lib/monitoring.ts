/**
 * Centralized error reporting utility.
 * Safe fallback: if Sentry is not configured, errors are logged without breaking execution.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

  if (process.env.NODE_ENV === "development") {
    console.error("[Error Monitoring]:", error, context ?? "");
  }

  if (!dsn) return;

  try {
    // Dynamic import to keep Sentry optional if not installed or unconfigured
    import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error, { extra: context });
    }).catch(() => {
      // Sentry package not loaded
    });
  } catch {
    // Silent fallback
  }
}
