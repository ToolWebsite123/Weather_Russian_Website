import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * Note: Scheduled notification dispatch (such as daily weather digests or severe weather warnings)
 * requires a background cron scheduler (such as Vercel Cron or a worker process) triggering a notification job.
 * This endpoint stores the push subscription credentials per session to enable future scheduled delivery.
 */

function ensureSession(): { sessionId: string; setCookie: boolean } {
  const store = cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return { sessionId: existing, setCookie: false };
  return { sessionId: crypto.randomUUID(), setCookie: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys } = body ?? {};

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { error: "Valid subscription endpoint required" },
        { status: 400 },
      );
    }

    const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : "";
    const auth = typeof keys?.auth === "string" ? keys.auth : "";

    const { sessionId, setCookie } = ensureSession();

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        sessionId,
        p256dh,
        auth,
      },
      create: {
        sessionId,
        endpoint,
        p256dh,
        auth,
      },
    });

    const res = NextResponse.json({ ok: true, subscribed: true });
    if (setCookie) res.cookies.set(sessionCookieOptions(sessionId));
    return res;
  } catch {
    return NextResponse.json(
      { error: "Push subscription failed" },
      { status: 500 },
    );
  }
}
