import { z } from "zod";

/**
 * Zod validation schemas for API query params and payloads.
 */

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(100, "Search query too long"),
});

export const geoQuerySchema = z.object({
  lat: z
    .string()
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ message: "Latitude must be a number" })
        .min(-90)
        .max(90),
    ),
  lon: z
    .string()
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ message: "Longitude must be a number" })
        .min(-180)
        .max(180),
    ),
});

export const favoritePayloadSchema = z.object({
  cityId: z.coerce.number().int("cityId must be an integer"),
});
