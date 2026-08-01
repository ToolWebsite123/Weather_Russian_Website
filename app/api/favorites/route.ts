import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

function ensureSession(): { sessionId: string; setCookie: boolean } {
  const store = cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return { sessionId: existing, setCookie: false };
  return { sessionId: randomUUID(), setCookie: true };
}

function parseCityId(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { cityId?: unknown };
    const cityId = parseCityId(body.cityId);
    if (cityId == null) {
      return NextResponse.json({ error: "cityId required" }, { status: 400 });
    }

    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      return NextResponse.json({ error: "city not found" }, { status: 404 });
    }

    const { sessionId, setCookie } = ensureSession();
    await prisma.favorite.upsert({
      where: { sessionId_cityId: { sessionId, cityId } },
      update: {},
      create: { sessionId, cityId },
    });

    const res = NextResponse.json({ ok: true, favorited: true });
    if (setCookie) res.cookies.set(sessionCookieOptions(sessionId));
    return res;
  } catch {
    return NextResponse.json({ error: "favorites update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { cityId?: unknown };
    const cityId = parseCityId(body.cityId);
    if (cityId == null) {
      return NextResponse.json({ error: "cityId required" }, { status: 400 });
    }

    const { sessionId, setCookie } = ensureSession();
    await prisma.favorite.deleteMany({
      where: { sessionId, cityId },
    });

    const res = NextResponse.json({ ok: true, favorited: false });
    if (setCookie) res.cookies.set(sessionCookieOptions(sessionId));
    return res;
  } catch {
    return NextResponse.json({ error: "favorites update failed" }, { status: 500 });
  }
}
