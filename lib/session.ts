import { cookies } from "next/headers";

export const SESSION_COOKIE = "wh_session";

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
