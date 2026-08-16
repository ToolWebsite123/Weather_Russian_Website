import { cookies } from "next/headers";

export const SESSION_COOKIE = "wh_session";
export const LAST_CITY_COOKIE = "wh_last_city";

export async function getOrCreateSessionId(): Promise<string> {
  const store = cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  return crypto.randomUUID();
}

export function sessionCookieOptions(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function lastCityCookieOptions(value: string) {
  return {
    name: LAST_CITY_COOKIE,
    value,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

